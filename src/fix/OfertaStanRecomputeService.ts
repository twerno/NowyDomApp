import { IEnv } from "../core/oferta/tasks/IEnv";
import { OfertaUpdateHelper, IOfertaWyliczonaZmina } from "../core/oferta/tasks/OfertaUpdateService";
import { inwestycje } from "../inwestycje/inwestycje";
import { IOfertaRecord, IOfertaDane } from "../core/oferta/model/IOfertaModel";
import { Status } from "../core/oferta/model/Status";
import TypeUtils from "../utils/TypeUtils";
import { Typ } from "../core/oferta/model/Typ";

export class OfertaStanRecomputeService {

    public constructor(protected readonly env: IEnv) {

    }

    public async recomputeMany(inwestycjeIds: string[]) {
        for (const inwestycjaId of inwestycjeIds) {
            await this.recomputeStan(inwestycjaId);
        }
    }

    public async recomputeStan(inwestycjaId: string) {
        const ofertyList = await this.env.stanService.getByInwestycja(inwestycjaId);
        const dataProvider = inwestycje.find(dp => dp.inwestycjaId === inwestycjaId);
        if (!dataProvider) {
            throw new Error(`dataProvider for ${inwestycjaId} is NULL`);
        }

        console.log(`Przetwarzam ${inwestycjaId}`);

        for (const oferta of ofertyList) {
            const operacje = (await this.env.opeService.getByOfertaId(oferta.ofertaId))
                .sort((a, b) => a.version - b.version);

            let data: IOfertaDane = {} as any;
            let wyliczonyStan: IOfertaRecord | null = null;
            let zmiana: IOfertaWyliczonaZmina | null = null;
            for (const ope of operacje) {
                data = { ...data, ...ope.data };
                zmiana = OfertaUpdateHelper.wyliczZmiane(
                    { id: oferta.ofertaId, data },
                    wyliczonyStan,
                    dataProvider,
                    null,
                    { now: () => new Date(ope.timestamp) }
                );
                if (zmiana?.rekord) {
                    wyliczonyStan = zmiana?.rekord || null;
                    wyliczonyStan = { ...wyliczonyStan, data: { ...wyliczonyStan?.data, typ: Typ.DOM } }
                }
            }

            if (wyliczonyStan && !TypeUtils.deepEqual(wyliczonyStan, oferta)) {
                await this.env.stanService.save(wyliczonyStan);
            }

        }
        console.log(`Zakończona naprawa stanu ${inwestycjaId}`);
    }
}