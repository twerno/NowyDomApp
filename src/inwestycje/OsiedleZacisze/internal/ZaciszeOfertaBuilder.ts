
import { IOfertaDane, ZASOBY } from '../../../core/oferta/model/IOfertaModel';
import { IZaciszeListElement, IZaciszeOfferDetails } from './ZaciszeModel';
import { IZaciszeParserProps } from './ZaciszeDataBuilder';


export default (listItem: IZaciszeListElement, detale: IZaciszeOfferDetails | null, props: IZaciszeParserProps): { id: string, dane: IOfertaDane } => {

    const zasobyDoPobrania = detale?.zasobyDoPobrania ?? [];
    if (!listItem.cechy.map["garaż indywidualny"]) {
        const idx = zasobyDoPobrania.findIndex(v => v.id === ZASOBY.IMG_GARAZ);
        zasobyDoPobrania.splice(idx, 1);
    }

    const result: IOfertaDane = {
        zasobyDoPobrania,
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
