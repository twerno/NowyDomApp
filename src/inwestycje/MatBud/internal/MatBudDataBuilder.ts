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
    miasto: string,
    dzielnica: string | undefined;
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
        miasto: props.miasto,
        dzielnica: props.dzielnica,

        getListUrl: () => props.listaLokaliUrl,
        parseListHtml: MatBudTabelaLokaliParser,
        getOfferUrl: () => undefined,
        parseOfferHtml: null,
        offerModelBuilder: MatBudOfertaBuilder
    }

}
