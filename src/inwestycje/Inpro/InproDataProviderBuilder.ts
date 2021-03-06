import { IDataProvider, IDataProviderParserProps } from "../../core/oferta/IOfertaProvider";
import { MapWithRawType } from "../../core/oferta/model/IOfertaModel";
import { IInproListElement, IInproOfferDetails } from "./internal/InproModel";
import InproParser from "./internal/InproParser";
import InproOfertaBuilder from "./internal/InproOfertaBuilder";
import { Typ } from "@src/core/oferta/model/Typ";
import { OdbiorType } from "@src/core/oferta/model/OdbiorType";
import { isRawData } from "@src/core/oferta/model/IRawData";
import { ICechy } from "@src/core/oferta/model/ICechy";

export interface IInproDataProviderProps {
    inwestycjaId: string;
    url: string;
    data: IInproDataProviderBuilderData;
    listaLokaliUrl: string;
    miasto: string;
    dzielnica: string | undefined;
}

export interface IInproDataProviderBuilderData {
    cechy: MapWithRawType<ICechy>,
    typ: Typ,
    odbior?: OdbiorType,
}

export type IInproDataProvider = IDataProvider<IInproListElement, IInproOfferDetails, IInproDataProviderBuilderData>;
export type IInproParserProps = IDataProviderParserProps<IInproListElement, IInproOfferDetails, IInproDataProviderBuilderData>;

export const InproDataProviderBuilder = (props: IInproDataProviderProps): IInproDataProvider => {

    return {
        developerId: 'Inpro',
        inwestycjaId: props.inwestycjaId,
        url: props.url,
        data: props.data,
        miasto: props.miasto,
        dzielnica: props.dzielnica,

        getListUrl: () => props.listaLokaliUrl,
        parseListHtml: InproParser.listMapper,
        getOfferUrl: item => isRawData(item.offerDetailsUrl) ? undefined : item.offerDetailsUrl,
        parseOfferHtml: InproParser.detailMapper,
        offerModelBuilder: InproOfertaBuilder
    }

}
