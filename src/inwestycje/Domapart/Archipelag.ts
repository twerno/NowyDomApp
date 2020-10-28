import { Typ } from "../../core/oferta/model/Typ";
import { DomapartDataProviderBuilder } from "./internal/Domapart";

export default DomapartDataProviderBuilder({
    inwestycjaId: 'Archipelag',
    listaLokaliUrl: 'https://osiedle-archipelag.pl/lista-mieszkan.json',
    data: {
        typ: Typ.MIESZKANIE,
    },
    url: 'https://osiedle-archipelag.pl',
    miasto: 'Rumia',
    dzielnica: 'Janowo'

});
