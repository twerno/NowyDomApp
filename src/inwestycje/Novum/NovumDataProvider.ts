import { IDataProvider } from "../../dataProvider/IOfertaProvider";
import { INovumDetails, INovumListElement } from "./NovumSchema";
import NovumOfertaBuilder from "./NovumOfertaBuilder";
import NovumMapper from "./NovumMapper";

export const NovumDataProvider: IDataProvider<INovumListElement, INovumDetails> = {

    nazwa: 'Novum',
    developer: 'HS',
    url: 'https://novumrumia.pl',

    listUrlProvider: async () => ['https://novumrumia.pl/mieszkania/'],

    listMapper: NovumMapper.listMapper,

    detailsUrlProvider: (listItem: INovumListElement) => listItem.detailsUrl,

    detailsMapper: NovumMapper.detailMapper,

    planUrlProvider: (_, detale: INovumDetails) => detale.pdfUrl,

    ofertaBuilder: NovumOfertaBuilder
}
