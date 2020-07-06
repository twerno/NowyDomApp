import { IDataProvider, IDataProviderParserProps } from "../../../core/oferta/IOfertaProvider";
import { ICechy, isRawData } from "../../../core/oferta/model/IOfertaModel";
import { ISemekoDetails, ISemekoListElement } from "./SemekoModel";
import semekoOfertaBuilder from "./semekoOfertaBuilder";
import semekoTabelaLokaliParser from "./semekoTabelaLokaliParser";
import semekoOfertaParser from "./semekoOfertaParser";

export interface ISemekoDataProviderProps {
    inwestycjaId: string;
    url: string;
    data: ISemekoDataProviderBuilderData,
    listaLokaliUrl: string
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

        getListUrl: () => props.listaLokaliUrl,
        parseListHtml: semekoTabelaLokaliParser,
        getOfferUrl: item => isRawData(item.detailsUrl) ? undefined : item.detailsUrl,
        parseOfferHtml: semekoOfertaParser,
        offerBuilder: semekoOfertaBuilder
    }

}
