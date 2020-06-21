import { IDataProvider } from "../../dataProvider/IOfertaProvider";
import { IGarvenaParkListElement, IGarvenaParkDetails } from "./GarvenaParkModel";
import GarvenaParkListMapper from "./GarvenaParkListMapper";
import GarvenaOfferBuilder from "./GarvenaOfferBuilder";

export const GarvenaPark: IDataProvider<IGarvenaParkListElement, IGarvenaParkDetails> = {

    inwestycjaId: 'GarvenaPark',
    developerId: 'DS Development',
    url: 'https://www.garvena.pl/',
    standard: {
        data: {},
        raw: []
    },

    getListUrl: () => 'https://www.garvena.pl/mieszkania/#lokale',

    parseListHtml: GarvenaParkListMapper,

    getOfferUrl: () => [],

    parseOfferHtml: null,

    offerBuilder: GarvenaOfferBuilder
}
