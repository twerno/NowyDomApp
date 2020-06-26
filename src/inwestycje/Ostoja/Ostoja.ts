import { IDataProvider } from "../../core/oferta/IOfertaProvider";
import OstojaMapper from "./OstojaMapper";
import { IOstojaListElement, IOstojaOfferDetails } from "./OstojaModel";
import OstojaOfertaBuilder from "./OstojaOfertaBuilder";
import { registerInwestycja } from "../../inwestycje/inwestycje";

export const Ostoja: IDataProvider<IOstojaListElement, IOstojaOfferDetails> = {

    inwestycjaId: 'Ostoja',
    developerId: 'Inpro',
    url: 'https://www.inpro.com.pl/ostoja/mieszkania-rumia',
    standard: {
        data: {
            winda: true
        },
        raw: []
    },

    getListUrl: () => 'https://www.inpro.com.pl/ostoja/cennik',

    parseListHtml: OstojaMapper.listMapper,

    getOfferUrl: item => item.offerDetailsUrl,

    parseOfferHtml: OstojaMapper.detailMapper,

    offerBuilder: OstojaOfertaBuilder
};

registerInwestycja(Ostoja);
