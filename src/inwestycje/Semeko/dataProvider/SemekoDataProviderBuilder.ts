import { IDataProvider, IDataProviderParserProps } from "../../../core/oferta/IOfertaProvider";
import { isRawData } from "../../../core/oferta/model/IOfertaModel";
import { ISemekoDetails, ISemekoListElement } from "./SemekoModel";
import semekoOfertaBuilder from "./semekoOfertaBuilder";
import semekoOfertaParser from "./semekoOfertaParser";
import semekoTabelaLokaliParser from "./semekoTabelaLokaliParser";

export interface ISemekoDataProviderProps {
    inwestycjaId: string;
    url: string;
    data: ISemekoDataProviderBuilderData;
    listaLokaliUrl: string;
    lokalizacja: string;
}

interface ISemekoDataProviderBuilderData {

}

export type ISemekoDataProvider = IDataProvider<ISemekoListElement, ISemekoDetails, ISemekoDataProviderBuilderData>;
export type ISemekoParserProps = IDataProviderParserProps<ISemekoListElement, ISemekoDetails, ISemekoDataProviderBuilderData>;

export const SemekoDataProviderBuilder = (props: ISemekoDataProviderProps): ISemekoDataProvider => {

    return {
        developerId: 'Semeko',
        inwestycjaId: props.inwestycjaId,
        url: props.url,
        data: props.data,
        lokalizacja: props.lokalizacja,

        getListUrl: () => props.listaLokaliUrl,
        parseListHtml: semekoTabelaLokaliParser,
        getOfferUrl: item => isRawData(item.offerDetailsUrl) ? undefined : item.offerDetailsUrl,
        parseOfferHtml: semekoOfertaParser,
        offerBuilder: semekoOfertaBuilder
    }

}
