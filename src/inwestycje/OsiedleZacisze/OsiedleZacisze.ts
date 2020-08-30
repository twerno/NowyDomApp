import { Typ } from "../../core/oferta/model/Typ";
import { ZaciszeDataProviderBuilder } from "./internal/ZaciszeDataBuilder";

export default ZaciszeDataProviderBuilder({
    inwestycjaId: 'Osiedle_Zacisze',
    listaLokaliUrl: 'https://osiedle-zacisze.com.pl/apartamenty.php',
    data: {
        typ: Typ.MIESZKANIE,
        odbior: { kwartal: 2, rok: 2021 }
    },
    url: 'https://osiedle-zacisze.com.pl',
    lokalizacja: 'Reda'
});
