import { IDataProvider } from "../../../core/oferta/IOfertaProvider";
import { ICechy, isRawData } from "../../../core/oferta/model/IOfertaModel";
import { ISemekoDetails, ISemekoListElement } from "./SemekoModel";
import semekoOfertaBuilder from "./semekoOfertaBuilder";
import semekoOfertaParser from "./semekoOfertaParser";
import semekoTabelaLokaliParser from "./semekoTabelaLokaliParser";

export interface ISemekoDataProviderProps {
    inwestycjaId: string;
    url: string;
    standard: { data: Partial<ICechy>, raw?: string[] },
    listaLokaliUrl: string
}

export const SemekoDataProviderBuilder = (props: ISemekoDataProviderProps): IDataProvider<ISemekoListElement, ISemekoDetails> => {

    return {
        developerId: 'Semeko',
        inwestycjaId: props.inwestycjaId,
        url: props.url,
        standard: props.standard,

        getListUrl: () => props.listaLokaliUrl,
        parseListHtml: semekoTabelaLokaliParser,
        getOfferUrl: item => isRawData(item.detailsUrl) ? undefined : item.detailsUrl,
        parseOfferHtml: semekoOfertaParser,
        offerBuilder: semekoOfertaBuilder
    }

}
