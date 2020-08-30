import { IDataProvider, IDataProviderParserProps } from "../../../core/oferta/IOfertaProvider";
import { Typ } from "../../../core/oferta/model/Typ";
import { IZaciszeListElement, IZaciszeOfferDetails } from "./ZaciszeModel";
import ZaciszeTabelaLokaliParser from "./ZaciszeTabelaLokaliParser";
import ZaciszeOfertaBuilder from "./ZaciszeOfertaBuilder";
import ZaciszeDetailsParser from "./ZaciszeDetailsParser";
import { OdbiorType } from "@src/core/oferta/model/OdbiorType";


interface IBuilderProps {
    inwestycjaId: string;
    url: string;
    data: IZaciszeDataProviderBuilderData,
    listaLokaliUrl: string | string[],
    lokalizacja: string,
}

interface IZaciszeDataProviderBuilderData {
    typ: Typ,
    odbior: OdbiorType;
}

export type IZaciszeDataProvider = IDataProvider<IZaciszeListElement, IZaciszeOfferDetails, IZaciszeDataProviderBuilderData>;
export type IZaciszeParserProps = IDataProviderParserProps<IZaciszeListElement, IZaciszeOfferDetails, IZaciszeDataProviderBuilderData>;

export const ZaciszeDataProviderBuilder = (props: IBuilderProps): IZaciszeDataProvider => {

    return {
        developerId: 'Osiedle Zacisze Sp. z o.o.',
        inwestycjaId: props.inwestycjaId,
        url: props.url,
        data: props.data,
        lokalizacja: props.lokalizacja,

        getListUrl: () => props.listaLokaliUrl,
        parseListHtml: ZaciszeTabelaLokaliParser,
        getOfferUrl: (item: IZaciszeListElement) => item.offerDetailsUrl,
        parseOfferHtml: ZaciszeDetailsParser,
        offerBuilder: ZaciszeOfertaBuilder
    }

}
