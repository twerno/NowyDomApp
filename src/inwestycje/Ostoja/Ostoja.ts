import { IDataProvider, IDataProviderParserProps } from "../../core/oferta/IOfertaProvider";
import OstojaMapper from "./OstojaMapper";
import { IOstojaListElement, IOstojaOfferDetails } from "./OstojaModel";
import OstojaOfertaBuilder from "./OstojaOfertaBuilder";
import { MapWithRawType, ICechy } from "core/oferta/model/IOfertaModel";

export interface IOstojaData {
    cechy: MapWithRawType<ICechy>
}

export type IOstojaDataProvider = IDataProvider<IOstojaListElement, IOstojaOfferDetails, IOstojaData>;
export type IOstojaParserProps = IDataProviderParserProps<IOstojaListElement, IOstojaOfferDetails, IOstojaData>;

export const Ostoja: IOstojaDataProvider = {

    inwestycjaId: 'Ostoja',
    developerId: 'Inpro',
    url: 'https://www.inpro.com.pl/ostoja/mieszkania-rumia',
    data: {
        cechy: {
            data: {
                winda: true
            }
        }
    },

    getListUrl: () => 'https://www.inpro.com.pl/ostoja/cennik',

    parseListHtml: OstojaMapper.listMapper,

    getOfferUrl: item => item.offerDetailsUrl,

    parseOfferHtml: OstojaMapper.detailMapper,

    offerBuilder: OstojaOfertaBuilder
};
