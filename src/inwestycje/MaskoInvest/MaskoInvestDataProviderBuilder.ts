import { IDataProvider, IDataProviderParserProps } from "../../core/oferta/IOfertaProvider";
import { IMaskoInvestListElement } from "./internal/MaskoInvestModel";
import MaskoInvestOfertaBuilder from "./internal/MaskoInvestOfertaBuilder";
import MaskoInvestParser from "./internal/MaskoInvestParser";
import { Typ } from "@src/core/oferta/model/Typ";

export interface IMaskoInvestDataProviderProps {
    inwestycjaId: string;
    url: string;
    data: IMaskoInvestDataProviderBuilderData;
    listaLokaliUrl: string;
    lokalizacja: string;
}

export interface IMaskoInvestDataProviderBuilderData {
    typ: Typ,
}

export type IMaskoInvestDataProvider = IDataProvider<IMaskoInvestListElement, void, IMaskoInvestDataProviderBuilderData>;
export type IMaskoInvestParserProps = IDataProviderParserProps<IMaskoInvestListElement, void, IMaskoInvestDataProviderBuilderData>;

export const MaskoInvestDataProviderBuilder = (props: IMaskoInvestDataProviderProps): IMaskoInvestDataProvider => {

    return {
        developerId: 'MaskoInvest',
        inwestycjaId: props.inwestycjaId,
        url: props.url,
        data: props.data,
        lokalizacja: props.lokalizacja,

        getListUrl: () => props.listaLokaliUrl,
        parseListHtml: MaskoInvestParser.listMapper,
        getOfferUrl: () => undefined,
        parseOfferHtml: () => Promise.resolve(),
        offerBuilder: MaskoInvestOfertaBuilder
    }

}
