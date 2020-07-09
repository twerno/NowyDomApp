import { InproDataProviderBuilder } from "./InproDataProviderBuilder";
import { Typ } from "../../core/oferta/model/Typ";

export default InproDataProviderBuilder({
    inwestycjaId: 'Optima',
    listaLokaliUrl: 'https://www.inpro.com.pl/optima/cennik',
    url: 'https://www.inpro.com.pl/optima/mieszkania-gdansk-jasien',
    data: {
        cechy: {
            data: {}
        },
        typ: Typ.MIESZKANIE,
    }
});