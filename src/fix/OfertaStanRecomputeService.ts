import { IOfertaRecord } from "../core/oferta/model/IOfertaModel";
import { IEnv } from "../core/oferta/tasks/IEnv";
import TypeUtils from "../core/utils/TypeUtils";
import { inwestycje } from "../inwestycje/inwestycje";

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

            let wyliczonyStan: IOfertaRecord = {
                developerId: dataProvider.developerId,
                inwestycjaId: dataProvider.inwestycjaId,
                ofertaId: oferta.ofertaId,
                version: undefined as any,
                data: {} as any,
                created_at: undefined as any,
                updated_at: undefined as any
            };
            for (const ope of operacje) {
                wyliczonyStan.data = { ...wyliczonyStan.data, ...ope.data };
                wyliczonyStan.version = ope.version;
                wyliczonyStan.updated_at = ope.timestamp;
                if (ope.version === 1) {
                    wyliczonyStan.created_at = ope.timestamp;
                }
            }

            if (!TypeUtils.deepEqual(wyliczonyStan, oferta)) {
                await this.env.stanService.save(wyliczonyStan);
            }

        }
        console.log(`Zakończona naprawa stanu ${inwestycjaId}`);
    }
}