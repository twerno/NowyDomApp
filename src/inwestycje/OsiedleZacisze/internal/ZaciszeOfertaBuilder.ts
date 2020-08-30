
import { IOfertaDane } from '../../../core/oferta/model/IOfertaModel';
import { IZaciszeListElement, IZaciszeOfferDetails } from './ZaciszeModel';
import { IZaciszeParserProps } from './ZaciszeDataBuilder';


export default (listItem: IZaciszeListElement, detale: IZaciszeOfferDetails | null, props: IZaciszeParserProps): { id: string, dane: IOfertaDane } => {

    const result: IOfertaDane = {
        zasobyDoPobrania: detale?.zasobyDoPobrania ?? [],
        cechy: listItem.cechy,
        lpPokoj: listItem.lpPokoj,
        metraz: listItem.metraz,
        nrLokalu: listItem.nrLokalu,
        pietro: listItem.pietro,
        status: listItem.status,
        typ: listItem.typ,
        liczbaKondygnacji: undefined,
        stronySwiata: undefined,
        budynek: listItem.budynek,
        cena: listItem.cena,
        odbior: props.dataProvider.data.odbior,
        offerDetailsUrl: listItem.offerDetailsUrl
    };

    return { id: listItem.id, dane: result };
}
