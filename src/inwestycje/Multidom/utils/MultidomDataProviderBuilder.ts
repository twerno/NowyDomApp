import { ICechy, isRawData } from "../../../core/oferta/model/IOfertaModel"
import { IDataProvider, IDataProviderParserProps } from "../../../core/oferta/IOfertaProvider"
import { IMultiDomListElement, IMultidomDetails } from "./MultidomModel"
import MultidomTabelaLokaliParser from "./MultidomTabelaLokaliParser"
import MultidomOfertaParser from "./MultidomOfertaParser"
import MultidomOfertaBuilder from "./MultidomOfertaBuilder"
import { Typ } from "../../../core/oferta/model/Typ"


interface IBuilderProps {
    inwestycjaId: string;
    url: string;
    data: IMultidomDataProviderBuilderData,
    listaLokaliUrl: string
}

interface IMultidomDataProviderBuilderData {
    typ: Typ,
}

export type IMultiDomDataProvider = IDataProvider<IMultiDomListElement, IMultidomDetails, IMultidomDataProviderBuilderData>;
export type IMultiDomParserProps = IDataProviderParserProps<IMultiDomListElement, IMultidomDetails, IMultidomDataProviderBuilderData>;

export const MultidomDataProviderBuilder = (props: IBuilderProps): IMultiDomDataProvider => {

    return {
        developerId: 'MultiDom',
        inwestycjaId: props.inwestycjaId,
        url: props.url,
        data: props.data,

        getListUrl: () => props.listaLokaliUrl,
        parseListHtml: MultidomTabelaLokaliParser,
        getOfferUrl: (element) => isRawData(element.detailsUrl) ? undefined : element.detailsUrl,
        parseOfferHtml: MultidomOfertaParser,
        offerBuilder: MultidomOfertaBuilder
    }

}
