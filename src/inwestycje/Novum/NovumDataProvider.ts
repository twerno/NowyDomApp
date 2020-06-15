import { IDataProvider } from "../../dataProvider/IOfertaProvider";
import { INovumDetails, INovumListElement } from "./NovumSchema";
import NovumOfertaBuilder from "./NovumOfertaBuilder";
import NovumMapper from "./NovumMapper";

export const NovumDataProvider: IDataProvider<INovumListElement, INovumDetails> = {

    inwestycjaId: 'Novum',
    developerId: 'HS',
    url: 'https://novumrumia.pl',
    standard: {
        data: {
            winda: true,
        },
        raw: [
            'ściany pokryte gładzią szpachlowaną i malowaną w kolorze białym',
            'drzwi anywłamaniowe',
            'kamienne parapety',
            'trzyszybowa stolarka okienna',
            'komórka lokatorska do każdego mieszkania (darmowa?)',
        ]
    },

    getListUrl: async () => new Set(['https://novumrumia.pl/mieszkania/']),

    parseListHtml: NovumMapper.listMapper,

    getOfferUrl: (listItem: INovumListElement) => new Set([
        listItem.offerDetailsUrl,
        `https://novumrumia.pl/mieszkanie/${listItem.budynek.toLowerCase()}-${listItem.nrLokalu.toLowerCase()}/`
    ]),

    parseOfferHtml: NovumMapper.detailMapper,

    offerBuilder: NovumOfertaBuilder,
}
