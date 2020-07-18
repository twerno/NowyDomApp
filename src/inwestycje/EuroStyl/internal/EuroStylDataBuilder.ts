import { IDataProvider, IDataProviderParserProps } from "../../../core/oferta/IOfertaProvider";
import { isRawData } from "../../../core/oferta/model/IOfertaModel";
import { Typ } from "../../../core/oferta/model/Typ";
import { IEuroStylListElement, IEuroStylOfferDetails } from "./EuroStylModel";
import EuroStylOfertaBuilder from "./EuroStylOfertaBuilder";
import EuroStylOfertaParser from "./EuroStylOfertaParser";
import EuroStylTabelaLokaliParser from "./EuroStylTabelaLokaliParser";


interface IBuilderProps {
    inwestycjaId: string;
    url: string;
    data: IEuroStylDataProviderBuilderData,
    listaLokaliUrl: string,
    lokalizacja: string,
}

interface IEuroStylDataProviderBuilderData {
    typ: Typ,
}

export type IEuroStylDataProvider = IDataProvider<IEuroStylListElement, IEuroStylOfferDetails, IEuroStylDataProviderBuilderData>;
export type IEuroStylParserProps = IDataProviderParserProps<IEuroStylListElement, IEuroStylOfferDetails, IEuroStylDataProviderBuilderData>;

export const EuroStylDataProviderBuilder = (props: IBuilderProps): IEuroStylDataProvider => {

    return {
        developerId: 'EuroStyl',
        inwestycjaId: props.inwestycjaId,
        url: props.url,
        data: props.data,
        lokalizacja: props.lokalizacja,

        getListUrl: () => props.listaLokaliUrl,
        parseListHtml: EuroStylTabelaLokaliParser,
        getOfferUrl: (element) => isRawData(element.offerDetailsUrl) ? undefined : element.offerDetailsUrl,
        parseOfferHtml: EuroStylOfertaParser,
        offerBuilder: EuroStylOfertaBuilder
    }

}
