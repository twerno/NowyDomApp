import { InproDataProviderBuilder } from "./InproDataProviderBuilder";
import { Typ } from "../../core/oferta/model/Typ";

export default InproDataProviderBuilder({
    inwestycjaId: 'Bravo',
    listaLokaliUrl: 'https://www.inpro.com.pl/brawo/cennik',
    url: 'https://www.inpro.com.pl/brawo/mieszkania-pruszcz-gdanski',
    data: {
        cechy: {
            map: {}
        },
        typ: Typ.MIESZKANIE,
    },
    miasto: 'Pruszcz Gdański',
    dzielnica: undefined
});