import { IDataProvider, IDataProviderParserProps } from "../../../core/oferta/IOfertaProvider";
import { Typ } from "../../../core/oferta/model/Typ";
import { IOrlexInvestListElement, IOrlexInvestOfferDetails } from "./OrlexInvestModel";
import OrlexInvestOfertaBuilder from "./OrlexInvestOfertaBuilder";
import OrlexInvestTabelaLokaliParser from "./OrlexInvestTabelaLokaliParser";


interface IBuilderProps {
    inwestycjaId: string;
    url: string;
    data: IOrlexInvestDataProviderBuilderData,
    listaLokaliUrl: string | string[],
    lokalizacja: string,
}

interface IOrlexInvestDataProviderBuilderData {
    typ: Typ,
    budynek: string | undefined,
}

export type IOrlexInvestDataProvider = IDataProvider<IOrlexInvestListElement, IOrlexInvestOfferDetails, IOrlexInvestDataProviderBuilderData>;
export type IOrlexInvestParserProps = IDataProviderParserProps<IOrlexInvestListElement, IOrlexInvestOfferDetails, IOrlexInvestDataProviderBuilderData>;

export const OrlexInvestDataProviderBuilder = (props: IBuilderProps): IOrlexInvestDataProvider => {

    return {
        developerId: 'OrlexInvest',
        inwestycjaId: props.inwestycjaId,
        url: props.url,
        data: props.data,
        lokalizacja: props.lokalizacja,

        getListUrl: () => props.listaLokaliUrl,
        parseListHtml: OrlexInvestTabelaLokaliParser,
        // na stronie z detalami nie ma nic ciekawego
        getOfferUrl: () => undefined,
        parseOfferHtml: null,
        offerBuilder: OrlexInvestOfertaBuilder
    }

}
