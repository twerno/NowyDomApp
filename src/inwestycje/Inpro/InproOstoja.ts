import { InproDataProviderBuilder } from "./InproDataProviderBuilder";
import { Typ } from "../../core/oferta/model/Typ";

export default InproDataProviderBuilder({
    inwestycjaId: 'Ostoja',
    listaLokaliUrl: 'https://www.inpro.com.pl/ostoja/cennik',
    url: 'https://www.inpro.com.pl/ostoja/mieszkania-rumia',
    data: {
        cechy: {
            map: {
                winda: true
            }
        },
        typ: Typ.MIESZKANIE,
    },
    lokalizacja: 'Rumia Biała Rzeka'
});