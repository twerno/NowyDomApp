import { IDataProvider, IDataProviderParserProps } from "../../core/oferta/IOfertaProvider";
import { IGarvenaParkListElement, IGarvenaParkDetails } from "./GarvenaParkModel";
import GarvenaParkListMapper from "./GarvenaParkListMapper";
import GarvenaOfferBuilder from "./GarvenaOfferBuilder";

interface IGarvenaParkData {

}

export type IGarvenaParkDataProvider = IDataProvider<IGarvenaParkListElement, IGarvenaParkDetails, IGarvenaParkData>;
export type IGarvenaParkParserProps = IDataProviderParserProps<IGarvenaParkListElement, IGarvenaParkDetails, IGarvenaParkData>;

export const GarvenaPark: IGarvenaParkDataProvider = {

    inwestycjaId: 'GarvenaPark',
    developerId: 'DS Development',
    url: 'https://www.garvena.pl/',
    data: {},

    getListUrl: () => 'https://www.garvena.pl/mieszkania/#lokale',

    parseListHtml: GarvenaParkListMapper,

    getOfferUrl: () => [],

    parseOfferHtml: null,

    offerBuilder: GarvenaOfferBuilder,

    lokalizacja: 'Rumia'
};
