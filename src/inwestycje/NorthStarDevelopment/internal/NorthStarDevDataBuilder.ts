import { IDataProvider, IDataProviderParserProps } from "../../../core/oferta/IOfertaProvider";
import { Typ } from "../../../core/oferta/model/Typ";
import { INorthStarDevListElement, INorthStarDevOfferDetails } from "./NorthStarDevModel";
import LokerTabelaLokaliParser, { NorthStarDevRowMapper } from "./NorthStarDevTabelaLokaliParser";
import LokerOfertaBuilder from "./NorthStarDevOfertaBuilder";


interface IBuilderProps {
    inwestycjaId: string;
    url: string;
    data: INorthStarDevDataProviderBuilderData;
    listaLokaliUrl: string | string[];
    miasto: string;
    dzielnica: string | undefined;
    northStarDevRowMapper: NorthStarDevRowMapper;
}

interface INorthStarDevDataProviderBuilderData {
    typ: Typ,
}

export type INorthStarDevDataProvider = IDataProvider<INorthStarDevListElement, INorthStarDevOfferDetails, INorthStarDevDataProviderBuilderData>;
export type INorthStarDevParserProps = IDataProviderParserProps<INorthStarDevListElement, INorthStarDevOfferDetails, INorthStarDevDataProviderBuilderData>;

export const NorthStarDevDataProviderBuilder = (props: IBuilderProps): INorthStarDevDataProvider => {

    return {
        developerId: 'NorthStarDev',
        inwestycjaId: props.inwestycjaId,
        url: props.url,
        data: props.data,
        miasto: props.miasto,

        getListUrl: () => props.listaLokaliUrl,
        parseListHtml: LokerTabelaLokaliParser(props.northStarDevRowMapper),
        getOfferUrl: (item: INorthStarDevListElement) => undefined,
        parseOfferHtml: null,
        offerModelBuilder: LokerOfertaBuilder
    }

}
