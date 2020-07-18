import { MultidomDataProviderBuilder } from "./utils/MultidomDataProviderBuilder";
import { Typ } from "../../core/oferta/model/Typ";

export default MultidomDataProviderBuilder({
    inwestycjaId: 'LipovaParkIEtap',
    listaLokaliUrl: 'https://multidom.pl/lipova-park-reda-i-etap',
    data: {
        typ: Typ.MIESZKANIE,
    },
    url: 'https://multidom.pl/lipova-park-reda-i-etap',
    lokalizacja: 'Reda Ciechocino'
});
