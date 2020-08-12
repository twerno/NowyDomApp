import { IDataProvider, IDataProviderParserProps } from "../../../core/oferta/IOfertaProvider";
import { isRawData } from "../../../core/oferta/model/IOfertaModel";
import { Typ } from "../../../core/oferta/model/Typ";
import { IOrlexListElement, IOrlexOfferDetails } from "./OrlexModel";
import OrlexOfertaBuilder from "./OrlexOfertaBuilder";
import OrlexOfertaParser from "./OrlexOfertaParser";
import OrlexTabelaLokaliParser from "./OrlexTabelaLokaliParser";


interface IBuilderProps {
    inwestycjaId: string;
    url: string;
    data: IOrlexDataProviderBuilderData,
    listaLokaliUrl: string,
    lokalizacja: string,
}

interface IOrlexDataProviderBuilderData {
    typ: Typ,
    budynek: string,
}

export type IOrlexDataProvider = IDataProvider<IOrlexListElement, IOrlexOfferDetails, IOrlexDataProviderBuilderData>;
export type IOrlexParserProps = IDataProviderParserProps<IOrlexListElement, IOrlexOfferDetails, IOrlexDataProviderBuilderData>;

export const OrlexDataProviderBuilder = (props: IBuilderProps): IOrlexDataProvider => {

    return {
        developerId: 'Orlex',
        inwestycjaId: props.inwestycjaId,
        url: props.url,
        data: props.data,
        lokalizacja: props.lokalizacja,

        getListUrl: () => props.listaLokaliUrl,
        parseListHtml: OrlexTabelaLokaliParser,
        getOfferUrl: (element) => isRawData(element.offerDetailsUrl) ? undefined : element.offerDetailsUrl,
        parseOfferHtml: OrlexOfertaParser,
        offerBuilder: OrlexOfertaBuilder
    }

}
