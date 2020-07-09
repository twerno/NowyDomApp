import { IDataProvider, IDataProviderParserProps } from "../../core/oferta/IOfertaProvider";
import { isRawData, MapWithRawType, ICechy } from "../../core/oferta/model/IOfertaModel";
import { IInproListElement, IInproOfferDetails } from "./internal/InproModel";
import InproParser from "./internal/InproParser";
import InproOfertaBuilder from "./internal/InproOfertaBuilder";
import { Typ } from "core/oferta/model/Typ";

export interface IInproDataProviderProps {
    inwestycjaId: string;
    url: string;
    data: IInproDataProviderBuilderData,
    listaLokaliUrl: string
}

interface IInproDataProviderBuilderData {
    cechy: MapWithRawType<ICechy>,
    typ: Typ,
}

export type IInproDataProvider = IDataProvider<IInproListElement, IInproOfferDetails, IInproDataProviderBuilderData>;
export type IInproParserProps = IDataProviderParserProps<IInproListElement, IInproOfferDetails, IInproDataProviderBuilderData>;

export const InproDataProviderBuilder = (props: IInproDataProviderProps): IInproDataProvider => {

    return {
        developerId: 'Inpro',
        inwestycjaId: props.inwestycjaId,
        url: props.url,
        data: props.data,

        getListUrl: () => props.listaLokaliUrl,
        parseListHtml: InproParser.listMapper,
        getOfferUrl: item => isRawData(item.offerDetailsUrl) ? undefined : item.offerDetailsUrl,
        parseOfferHtml: InproParser.detailMapper,
        offerBuilder: InproOfertaBuilder
    }

}
