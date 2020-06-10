import { IDataProvider } from "../../dataProvider/IOfertaProvider";
import { INovumDetails, INovumListElement } from "./NovumSchema";
import NovumOfertaBuilder from "./NovumOfertaBuilder";
import NovumMapper from "./NovumMapper";
import TypeUtils from "../../utils/TypeUtils";

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

    listUrlProvider: async () => new Set(['https://novumrumia.pl/mieszkania/']),

    listHtmlParser: NovumMapper.listMapper,

    offerDetailsUrlProvider: (listItem: INovumListElement) => new Set([
        listItem.detailsUrl,
        `https://novumrumia.pl/mieszkanie/${listItem.budynek.toLowerCase()}-${listItem.nrLokalu.toLowerCase()}/`
    ]),

    offerDetailsHtmlParser: NovumMapper.detailMapper,

    offerCardUrlProvider: (_, detale?: INovumDetails) => detale?.pdfUrl,

    offerBuilder: NovumOfertaBuilder,
}
