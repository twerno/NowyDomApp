import { IEnv } from "@src/core/oferta/tasks/IEnv";
import { ofertaRepo } from "@src/core/oferta/repo/OfertaRecordRepo";
import { ofertaOpeRepo } from "@src/core/oferta/repo/OfertaRecordOpeRepo";
import { IStringMap } from "@src/utils/IMap";
import { Status } from "@src/core/oferta/model/Status";

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

export const brakDatySprzedazyFix = async (inwestycjaId: string, env: IEnv) => {
    const list = (await env.stanService.getByInwestycja(inwestycjaId))
        .filter(o => o.data.status === Status.SPRZEDANE && o.data.sprzedaneData === undefined);

    const promises = list.map(o => {
        o.data.sprzedaneData = o.created_at;
        return env.stanService.save(o);
    });

    await Promise.all(promises);

    const promiseOpe = list.map(async o => {
        const opeList = await env.opeService.getByOfertaId(o.ofertaId);
        const ope = opeList.find(o => o.data.status === Status.SPRZEDANE);
        if (ope) {
            ope.data.sprzedaneData = list.find(s => s.ofertaId === ope.ofertaId)?.created_at;
            return env.opeService.save(ope);
        }
        else {
            console.log(`blad: brak operacji dla ${o.ofertaId}`);
        }
    });

    await Promise.all(promiseOpe);
}