import { InproDataProviderBuilder } from "./InproDataProviderBuilder";
import { Typ } from "../../core/oferta/model/Typ";

export default InproDataProviderBuilder({
    inwestycjaId: 'Debiut',
    listaLokaliUrl: 'https://www.inpro.com.pl/debiut/cennik',
    url: 'https://www.inpro.com.pl/debiut/mieszkania-pruszcz-gdanski',
    data: {
        cechy: {
            map: {}
        },
        typ: Typ.MIESZKANIE,
    },
    miasto: 'Pruszcz Gdański',
    dzielnica: undefined
});