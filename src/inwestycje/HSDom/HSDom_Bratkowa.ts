import { Typ } from "../../core/oferta/model/Typ";
import { HSDomDataProviderBuilder } from "./internal/HSDom";

export default HSDomDataProviderBuilder({
    inwestycjaId: 'Reda Bratkowa',
    listaLokaliUrl: 'https://hsdom.pl/oferta/reda-bratkowa/lista-mieszkan',
    data: {
        typ: Typ.DOM_SZEREGOWY,
    },
    url: 'https://hsdom.pl/',
    miasto: 'Reda',
    dzielnica: 'Betlejem'

});
