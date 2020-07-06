import { MultidomDataProviderBuilder } from "./utils/MultidomDataProviderBuilder";
import { Typ } from "../../core/oferta/model/Typ";

export default MultidomDataProviderBuilder({
    inwestycjaId: 'LipovaParkIIEtap',
    listaLokaliUrl: 'https://multidom.pl/lipova-park-ii-etap',
    data: {
        typ: Typ.MIESZKANIE,
    },
    url: 'https://multidom.pl/lipova-park-ii-etap',
});
