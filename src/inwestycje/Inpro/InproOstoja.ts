import { InproDataProviderBuilder } from "./InproDataProviderBuilder";
import { Typ } from "../../core/oferta/model/Typ";

export default InproDataProviderBuilder({
    inwestycjaId: 'Ostoja',
    listaLokaliUrl: 'https://www.inpro.com.pl/ostoja/cennik',
    url: 'https://www.inpro.com.pl/ostoja/mieszkania-rumia',
    data: {
        cechy: {
            data: {
                winda: true
            }
        },
        typ: Typ.MIESZKANIE,
    }
});