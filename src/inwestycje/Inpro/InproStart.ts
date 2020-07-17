import { InproDataProviderBuilder } from "./InproDataProviderBuilder";
import { Typ } from "../../core/oferta/model/Typ";

export default InproDataProviderBuilder({
    inwestycjaId: 'Start',
    listaLokaliUrl: 'https://www.inpro.com.pl/start/cennik',
    url: 'https://www.inpro.com.pl/start/mieszania-gdansk-kokoszki',
    data: {
        cechy: {
            map: {}
        },
        typ: Typ.MIESZKANIE,
    }
});