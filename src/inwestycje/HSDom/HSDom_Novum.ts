import { Typ } from "../../core/oferta/model/Typ";
import { HSDomDataProviderBuilder } from "./internal/HSDom";

export default HSDomDataProviderBuilder({
    inwestycjaId: 'Novum',
    listaLokaliUrl: 'https://hsdom.pl/oferta/novum-rumia/lista-mieszkan',
    data: {
        typ: Typ.MIESZKANIE,
    },
    url: 'https://hsdom.pl/',
    miasto: 'Rumia',
    dzielnica: 'Biała Rzeka'

});
