import { IDataProvider } from "../../core/oferta/IOfertaProvider";
import { INovumDetails, INovumListElement } from "./NovumSchema";
import NovumOfertaBuilder from "./NovumOfertaBuilder";
import NovumMapper from "./NovumMapper";
import { registerInwestycja } from "../../inwestycje/inwestycje";

export const Novum: IDataProvider<INovumListElement, INovumDetails> = {

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
            'komórka lokatorska do każdego mieszkania (obowiązek zakupu)',
        ]
    },

    getListUrl: () => 'https://novumrumia.pl/mieszkania/',

    parseListHtml: NovumMapper.listMapper,

    getOfferUrl: (listItem: INovumListElement) => [
        listItem.offerDetailsUrl,
        `https://novumrumia.pl/mieszkanie/${listItem.budynek.toLowerCase()}-${listItem.nrLokalu.toLowerCase()}/`
    ],

    parseOfferHtml: NovumMapper.detailMapper,

    offerBuilder: NovumOfertaBuilder,
};

registerInwestycja(Novum);
