import { ICechy, isRawData } from "../../../core/oferta/model/IOfertaModel"
import { IDataProvider } from "../../../core/oferta/IOfertaProvider"
import { IMultiDomListElement, IMultidomDetails } from "./MultidomModel"
import MultidomTabelaLokaliParser from "./MultidomTabelaLokaliParser"


interface IBuilderProps {
    inwestycjaId: string;
    url: string;
    standard: { data: Partial<ICechy>, raw?: string[] },
    listaLokaliUrl: string
}

export const MultidomDataProviderBuilder = (props: IBuilderProps): IDataProvider<IMultiDomListElement, IMultidomDetails> => {

    return {
        developerId: 'MultiDom',
        inwestycjaId: props.inwestycjaId,
        url: props.url,
        standard: props.standard,

        getListUrl: () => props.listaLokaliUrl,
        parseListHtml: MultidomTabelaLokaliParser,
        getOfferUrl: (element) => isRawData(element.detailsUrl) ? undefined : element.detailsUrl,
        parseOfferHtml: null,
        offerBuilder: (() => null) as any
    }

}
