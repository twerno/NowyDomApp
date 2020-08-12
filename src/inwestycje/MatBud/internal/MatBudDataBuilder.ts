import { IDataProvider, IDataProviderParserProps } from "../../../core/oferta/IOfertaProvider";
import { Typ } from "../../../core/oferta/model/Typ";
import { IMatBudListElement, IMatBudOfferDetails } from "./MatBudModel";
import MatBudOfertaBuilder from "./MatBudOfertaBuilder";
import MatBudTabelaLokaliParser from "./MatBudTabelaLokaliParser";


interface IBuilderProps {
    inwestycjaId: string;
    url: string;
    data: IMatBudDataProviderBuilderData,
    listaLokaliUrl: string | string[],
    lokalizacja: string,
}

interface IMatBudDataProviderBuilderData {
    typ: Typ,
}

export type IMatBudDataProvider = IDataProvider<IMatBudListElement, IMatBudOfferDetails, IMatBudDataProviderBuilderData>;
export type IMatBudParserProps = IDataProviderParserProps<IMatBudListElement, IMatBudOfferDetails, IMatBudDataProviderBuilderData>;

export const MatBudDataProviderBuilder = (props: IBuilderProps): IMatBudDataProvider => {

    return {
        developerId: 'MatBud',
        inwestycjaId: props.inwestycjaId,
        url: props.url,
        data: props.data,
        lokalizacja: props.lokalizacja,

        getListUrl: () => props.listaLokaliUrl,
        parseListHtml: MatBudTabelaLokaliParser,
        getOfferUrl: () => undefined,
        parseOfferHtml: null,
        offerBuilder: MatBudOfertaBuilder
    }

}
