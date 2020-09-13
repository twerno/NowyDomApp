import { IDataProvider, IDataProviderParserProps } from "../../../core/oferta/IOfertaProvider";
import { Typ } from "../../../core/oferta/model/Typ";
import { IHSDomListElement, IHSDomOfferDetails } from "./HSDomModel";
import HSDomTabelaLokaliParser from "./HSDomTabelaLokaliParser";
import HSDomDetailsParser from "./HSDomDetailsParser";
import HSDomOfertaBuilder from "./HSDomOfertaBuilder";

interface IBuilderProps {
    inwestycjaId: string;
    url: string;
    data: IHSDomDataProviderBuilderData;
    listaLokaliUrl: string | string[];
    miasto: string;
    dzielnica: string;
}

interface IHSDomDataProviderBuilderData {
    typ: Typ,
}

export type IHSDomDataProvider = IDataProvider<IHSDomListElement, IHSDomOfferDetails, IHSDomDataProviderBuilderData>;
export type IHSDomParserProps = IDataProviderParserProps<IHSDomListElement, IHSDomOfferDetails, IHSDomDataProviderBuilderData>;

export const HSDomDataProviderBuilder = (props: IBuilderProps): IHSDomDataProvider => {

    return {
        developerId: 'HS',
        inwestycjaId: props.inwestycjaId,
        url: props.url,
        data: props.data,
        miasto: props.miasto,
        dzielnica: props.dzielnica,

        getListUrl: () => props.listaLokaliUrl,
        parseListHtml: HSDomTabelaLokaliParser,
        getOfferUrl: (item: IHSDomListElement) => item.offerDetailsUrl,
        parseOfferHtml: HSDomDetailsParser,
        offerBuilder: HSDomOfertaBuilder,
    }

}
