import { IDataProvider, IDataProviderParserProps } from "../../../core/oferta/IOfertaProvider";
import { Typ } from "../../../core/oferta/model/Typ";
import { ILokerListElement, ILokerOfferDetails } from "./LokerModel";
import LokerTabelaLokaliParser from "./LokerTabelaLokaliParser";
import LokerOfertaBuilder from "./LokerOfertaBuilder";


interface IBuilderProps {
    inwestycjaId: string;
    url: string;
    data: ILokerDataProviderBuilderData,
    listaLokaliUrl: string | string[],
    miasto: string,
    dzielnica: string | undefined
}

interface ILokerDataProviderBuilderData {
    typ: Typ,
}

export type ILokerDataProvider = IDataProvider<ILokerListElement, ILokerOfferDetails, ILokerDataProviderBuilderData>;
export type ILokerParserProps = IDataProviderParserProps<ILokerListElement, ILokerOfferDetails, ILokerDataProviderBuilderData>;

export const LokerDataProviderBuilder = (props: IBuilderProps): ILokerDataProvider => {

    return {
        developerId: 'Loker',
        inwestycjaId: props.inwestycjaId,
        url: props.url,
        data: props.data,
        miasto: props.miasto,
        dzielnica: props.dzielnica,

        getListUrl: () => props.listaLokaliUrl,
        parseListHtml: LokerTabelaLokaliParser,
        getOfferUrl: (item: ILokerListElement) => undefined,
        parseOfferHtml: null,
        offerModelBuilder: LokerOfertaBuilder
    }

}
