import { Status } from "@src/core/oferta/model/Status";
import { ofertaRepo } from "@src/core/aws/repo/OfertaRecordRepo";
import { IEnv } from "@src/core/oferta/tasks/IEnv";
import { ofertaOpeRepo } from "@src/core/aws/repo/OfertaRecordOpeRepo";

export const oznaczOpeAsTech = async (ofertaId: string, version: number, env: IEnv) => {
    const ope = await env.opeService.load({ ofertaId, version });
    if (ope) {
        ope.updatedBy = 'tech';
        await env.opeService.save(ope);
    }
}

export const usunZDnia = async (rok: number, miesiac: number, dzien: number, env: IEnv) => {
    const date_min = new Date(rok, miesiac - 1, dzien).valueOf();
    const date_max = date_min + 24 * 60 * 60 * 1000;

    const promisesStan = (await env.stanService.getAll())
        .filter(s => date_min <= s.created_at && s.created_at < date_max)
        .map(s => ofertaRepo.delete({ inwestycjaId: s.inwestycjaId, ofertaId: s.ofertaId }));

    const promisesOpe = (await env.opeService.getAll())
        .filter(o => date_min <= o.timestamp && o.timestamp < date_max)
        .map(o => ofertaOpeRepo.delete({ ofertaId: o.ofertaId, version: o.version }));

    return Promise.all([...promisesStan, ...promisesOpe]);
}

export const naprawOpePoBledachPolaczenia = async (rok: number, miesiac: number, dzien: number, inwestycjaId: string, env: IEnv) => {
    const date_min = new Date(rok, miesiac - 1, dzien).valueOf();
    const date_max = date_min + 24 * 60 * 60 * 1000;

    const ofertaList = (await env.stanService.getAll())
        .filter(s => s.inwestycjaId === inwestycjaId)
        .map(s => s.ofertaId);

    const ofertaOpe = (await env.opeService.getAll())
        .filter(o => date_min <= o.timestamp && o.timestamp < date_max)
        .filter(o => ofertaList.indexOf(o.ofertaId) !== -1);

    const ofertaOpeKeys = new Set(ofertaOpe.map(o => o.ofertaId));

    for (const key of ofertaOpeKeys) {
        const ope1 = ofertaOpe.filter(s => s.ofertaId === key && s.data.status === Status.WOLNE);
        const ope2 = ofertaOpe.filter(s => s.ofertaId === key && (s.data.status === Status.SPRZEDANE));

        if (ope1.length > 0 && ope2.length > 0) {
            [...ope1, ...ope2].forEach(o => {
                o.updatedBy = "tech";
                env.opeService.save(o);
            });
        }
    }
}

export const brakDatySprzedazyFix = async (env: IEnv) => {
    const stanList = (await env.stanService.getAll())
        .filter(o => o.data.sprzedaneData === undefined && o.data.status !== Status.WOLNE);

    const promises = stanList.map(async (s) => {
        const opeList = await env.opeService.getByOfertaId(s.ofertaId);
        const ope = opeList.reverse()
            .find(o => o.data.status === Status.SPRZEDANE || o.data.status === Status.REZERWACJA);

        if (ope === undefined) {
            console.log(`Nie znaleziono operacji zmieniającej ${s.ofertaId}`);
            return;
        }

        ope.data.sprzedaneData = ope.timestamp;
        await env.opeService.save(ope);

        s.data.sprzedaneData = ope.timestamp;
        return env.stanService.save(s);
    });

    return Promise.all(promises);
}