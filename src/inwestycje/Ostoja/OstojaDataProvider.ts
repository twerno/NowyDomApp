import { IDataProvider } from "../../dataProvider/IOfertaProvider";
import OstojaMapper from "./OstojaMapper";
import { IOstojaListElement, IOstojaOfferDetails } from "./OstojaModel";
import OstojaOfertaBuilder from "./OstojaOfertaBuilder";
import TypeUtils from "../../utils/TypeUtils";

export const OstojaDataProvider: IDataProvider<IOstojaListElement, IOstojaOfferDetails> = {

    inwestycjaId: 'Ostoja',
    developerId: 'Inpro',
    url: 'https://www.inpro.com.pl/ostoja/mieszkania-rumia',
    standard: {
        data: {
            winda: true
        },
        raw: []
    },

    listUrlProvider: async () => new Set(['https://www.inpro.com.pl/ostoja/cennik']),

    listHtmlParser: OstojaMapper.listMapper,

    offerDetailsUrlProvider: (listItem: IOstojaListElement) =>
        new Set(
            [listItem.offerDetailsUrl]
                .filter(TypeUtils.notEmpty)
        ),

    offerDetailsHtmlParser: OstojaMapper.detailMapper,

    offerCardUrlProvider: (_, detale?: IOstojaOfferDetails) => detale?.sourceOfertaPdfUrl,

    offerBuilder: OstojaOfertaBuilder
}
