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

    getListUrl: async () => new Set(['https://www.inpro.com.pl/ostoja/cennik']),

    parseListHtml: OstojaMapper.listMapper,

    getOfferUrl: (listItem: IOstojaListElement) =>
        new Set(
            [listItem.offerDetailsUrl]
                .filter(TypeUtils.notEmpty)
        ),

    parseOfferHtml: OstojaMapper.detailMapper,

    offerBuilder: OstojaOfertaBuilder
}
