import { IOfertaDane, IOfertaRecord, IOfertaRecordOpe } from "../core/oferta/model/IOfertaModel";
import { IEnv } from "../core/oferta/tasks/IEnv";
import { inwestycje } from "../inwestycje/inwestycje";

export async function multidomCenaFix(env: IEnv) {
    const promises = inwestycje
        .filter(inwestycja => inwestycja.developerId === "MultiDom")
        .map(inwestycja => env.stanService.getByInwestycja(inwestycja.inwestycjaId));

    const oferty = (await Promise.all(promises))
        .reduce((prev, curr) => [...prev, ...curr], []);

    const doPoprawy = oferty
        .filter(oferta => typeof oferta.data.cena === 'number' && oferta.data.cena < 1000);

    for (const stan of doPoprawy) {
        console.log('Naprawa', stan.ofertaId);
        await napraw(stan, env);
    }
}

async function napraw(stan: IOfertaRecord, env: IEnv) {
    const timestamp = new Date().getTime();
    const cena = stan.data.cena;
    if (typeof cena !== 'number' || Number.isNaN(cena)) {
        return;
    }
    const delta: Partial<IOfertaDane> = { cena: cena * 1000 };

    const rekord: IOfertaRecord = {
        ...stan,
        version: stan.version + 1,
        data: {
            ...stan.data,
            ...delta
        }
    };

    const ope: IOfertaRecordOpe = {
        ofertaId: stan.ofertaId,  // partition_key
        version: stan.version + 1, // sort_key
        timestamp,
        data: delta,
        updatedBy: 'server'
    };

    await env.stanService.save(rekord);
    await env.opeService.save(ope);
} 