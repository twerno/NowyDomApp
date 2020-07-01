import { IEnv } from "../../core/oferta/tasks/IEnv";
import { OfertaUpdateHelper, IOfertaWyliczonaZmina } from "../../core/oferta/tasks/OfertaUpdateService";
import { inwestycje } from "../../inwestycje/inwestycje";
import { IOfertaRecord, IOfertaDane } from "../../core/oferta/model/IOfertaModel";

export class OfertaStanRecomputeService {

    public constructor(protected readonly env: IEnv) {

    }

    public async recomputeStan(inwestycjaId: string) {
        const ofertyList = await this.env.stanService.getByInwestycja(inwestycjaId);
        const dataProvider = inwestycje.find(dp => dp.inwestycjaId === inwestycjaId);
        if (!dataProvider) {
            throw new Error(`dataProvider for ${inwestycjaId} is NULL`);
        }

        for (const oferta of ofertyList) {
            const operacje = (await this.env.opeService.getByOfertaId(oferta.ofertaId))
                .sort((a, b) => a.version - b.version);

            let data: IOfertaDane = {} as any;
            let stan: IOfertaRecord | null = null;
            let zmiana: IOfertaWyliczonaZmina | null = null;
            for (const ope of operacje) {
                data = { ...data, ...ope.data };
                zmiana = OfertaUpdateHelper.wyliczZmiane(
                    { id: oferta.ofertaId, data },
                    stan,
                    dataProvider,
                    null
                );
                if (zmiana?.rekord) {
                    stan = zmiana?.rekord || null;
                }
            }
            if (zmiana?.rekord) {
                await this.env.stanService.save(zmiana?.rekord);
            }

        }
        console.log(`Zakończona naprawa stanu ${inwestycjaId}`);
    }
}