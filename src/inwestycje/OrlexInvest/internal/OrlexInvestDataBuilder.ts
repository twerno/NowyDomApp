import { IDataProvider, IDataProviderParserProps } from "../../../core/oferta/IOfertaProvider";
import { isRawData } from "../../../core/oferta/model/IOfertaModel";
import { Typ } from "../../../core/oferta/model/Typ";
import { IOrlexInvestistElement, IOrlexInvestfferDetails } from "./OrlexInvestModel";
import OrlexInvestfertaBuilder from "./OrlexInvestOfertaBuilder";
import OrlexInvestfertaParser from "./OrlexInvestOfertaParser";
import OrlexInvestabelaLokaliParser from "./OrlexInvestTabelaLokaliParser";


interface IBuilderProps {
    inwestycjaId: string;
    url: string;
    data: IOrlexInvestataProviderBuilderData,
    listaLokaliUrl: string | string[],
    lokalizacja: string,
}

interface IOrlexInvestataProviderBuilderData {
    typ: Typ,
    budynek: string | undefined,
}

export type IOrlexInvestataProvider = IDataProvider<IOrlexInvestistElement, IOrlexInvestfferDetails, IOrlexInvestataProviderBuilderData>;
export type IOrlexInvestarserProps = IDataProviderParserProps<IOrlexInvestistElement, IOrlexInvestfferDetails, IOrlexInvestataProviderBuilderData>;

export const OrlexInvestataProviderBuilder = (props: IBuilderProps): IOrlexInvestataProvider => {

    return {
        developerId: 'OrlexInvest',
        inwestycjaId: props.inwestycjaId,
        url: props.url,
        data: props.data,
        lokalizacja: props.lokalizacja,

        getListUrl: () => props.listaLokaliUrl,
        parseListHtml: OrlexInvestabelaLokaliParser,
        getOfferUrl: (element) => isRawData(element.offerDetailsUrl) ? undefined : element.offerDetailsUrl,
        parseOfferHtml: OrlexInvestfertaParser,
        offerBuilder: OrlexInvestfertaBuilder
    }

}
