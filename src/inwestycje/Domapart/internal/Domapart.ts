import { IDataProvider, IDataProviderParserProps } from "../../../core/oferta/IOfertaProvider";
import { Typ } from "../../../core/oferta/model/Typ";
import { IDomapartListElement, IDomapartOfferDetails } from "./DomapartModel";
import DomapartTabelaLokaliParser from "./DomapartTabelaLokaliParser";
import DomapartDetailsParser from "./DomapartDetailsParser";
import DomapartOfertaBuilder from "./DomapartOfertaBuilder";

interface IBuilderProps {
    inwestycjaId: string;
    url: string;
    data: IDomapartDataProviderBuilderData;
    listaLokaliUrl: string | string[];
    miasto: string;
    dzielnica: string;
}

interface IDomapartDataProviderBuilderData {
    typ: Typ,
}

export type IDomapartDataProvider = IDataProvider<IDomapartListElement, IDomapartOfferDetails, IDomapartDataProviderBuilderData>;
export type IDomapartParserProps = IDataProviderParserProps<IDomapartListElement, IDomapartOfferDetails, IDomapartDataProviderBuilderData>;

export const DomapartDataProviderBuilder = (props: IBuilderProps): IDomapartDataProvider => {

    return {
        developerId: 'Domapart',
        inwestycjaId: props.inwestycjaId,
        url: props.url,
        data: props.data,
        miasto: props.miasto,
        dzielnica: props.dzielnica,

        getListUrl: () => props.listaLokaliUrl,
        parseListHtml: DomapartTabelaLokaliParser,
        getOfferUrl: (item: IDomapartListElement) => item.offerDetailsUrl,
        parseOfferHtml: DomapartDetailsParser,
        offerModelBuilder: DomapartOfertaBuilder,
    }

}
