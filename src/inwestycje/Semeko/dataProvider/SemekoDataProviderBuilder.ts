import { IDataProvider, IDataProviderParserProps } from "../../../core/oferta/IOfertaProvider";
import { isRawData } from "../../../core/oferta/model/IRawData";
import { ISemekoDetails, ISemekoListElement } from "./SemekoModel";
import semekoOfertaBuilder from "./semekoOfertaBuilder";
import semekoOfertaParser from "./semekoOfertaParser";
import semekoTabelaLokaliParser from "./semekoTabelaLokaliParser";

export interface ISemekoDataProviderProps {
    inwestycjaId: string;
    url: string;
    data: ISemekoDataProviderBuilderData;
    listaLokaliUrl: string;
    miasto: string;
    dzielnica: string | undefined;
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
        miasto: props.miasto,
        dzielnica: props.dzielnica,

        getListUrl: () => props.listaLokaliUrl,
        parseListHtml: semekoTabelaLokaliParser,
        getOfferUrl: item => isRawData(item.offerDetailsUrl) ? undefined : item.offerDetailsUrl,
        parseOfferHtml: semekoOfertaParser,
        offerModelBuilder: semekoOfertaBuilder
    }

}
