import { IDataProvider } from "../../dataProvider/IOfertaProvider";
import { INovumDetails, INovumListElement } from "./NovumSchema";
import NovumOfertaBuilder from "./NovumOfertaBuilder";
import NovumMapper from "./NovumMapper";

export const NovumDataProvider: IDataProvider<INovumListElement, INovumDetails> = {

    nazwa: 'Novum',
    developer: 'HS',
    url: 'https://novumrumia.pl',
    standard: {
        data: { winda: true, },
        raw: [
            'ściany pokryte gładzią szpachlowaną i malowaną w kolorze białym',
            'drzwi anywłamaniowe',
            'kamienne parapety',
            'trzyszybowa stolarka okienna',
            'komórka lokatorska do każdego mieszkania (darmowa?)',
        ]
    },

    listUrlProvider: async () => ['https://novumrumia.pl/mieszkania/'],

    listMapper: NovumMapper.listMapper,

    detailsUrlProvider: (listItem: INovumListElement) => listItem.detailsUrl,

    detailsMapper: NovumMapper.detailMapper,

    planUrlProvider: (_, detale?: INovumDetails) => detale?.pdfUrl,

    ofertaBuilder: NovumOfertaBuilder
}
