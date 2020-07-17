import { InproDataProviderBuilder } from "./InproDataProviderBuilder";
import { Typ } from "../../core/oferta/model/Typ";

export default InproDataProviderBuilder({
    inwestycjaId: 'Azymut',
    listaLokaliUrl: 'https://www.inpro.com.pl/azymut/cennik',
    url: 'https://www.inpro.com.pl/azymut/mieszkania-gdynia-maly-kack',
    data: {
        cechy: {
            map: {}
        },
        typ: Typ.MIESZKANIE,
    }
});