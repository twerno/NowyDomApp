import { IDataProvider, IDataProviderParserProps } from "../../core/oferta/IOfertaProvider";
import NovumMapper from "./NovumMapper";
import NovumOfertaBuilder from "./NovumOfertaBuilder";
import { INovumDetails, INovumListElement } from "./NovumSchema";
import { MapWithRawType, ICechy } from "core/oferta/model/IOfertaModel";

export interface INovumData {
    cechy: MapWithRawType<ICechy>
}

export type INovumDataProvider = IDataProvider<INovumListElement, INovumDetails, INovumData>;
export type INovumParserProps = IDataProviderParserProps<INovumListElement, INovumDetails, INovumData>;

export const Novum: INovumDataProvider = {

    inwestycjaId: 'Novum',
    developerId: 'HS',
    url: 'https://novumrumia.pl',
    data: {
        cechy: {
            data: {
                winda: true
            },
            raw: [
                'ściany pokryte gładzią szpachlowaną i malowaną w kolorze białym',
                'drzwi anywłamaniowe',
                'kamienne parapety',
                'trzyszybowa stolarka okienna',
                'komórka lokatorska do każdego mieszkania (obowiązek zakupu)',
            ]
        }
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
