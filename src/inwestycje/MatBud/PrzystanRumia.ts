import { MatBudDataProviderBuilder } from "./internal/MatBudDataBuilder";
import { Typ } from "@src/core/oferta/model/Typ";

export default MatBudDataProviderBuilder({
    listaLokaliUrl: 'http://matbudrumia.pl/sprzedaz-mieszkan/przystan-rumia/plany-mieszkan/',
    inwestycjaId: 'PrzystanRumia',
    miasto: 'Rumia',
    dzielnica: 'Biała Rzeka',
    url: 'http://matbudrumia.pl/sprzedaz-mieszkan/przystan-rumia/',
    data: {
        typ: Typ.MIESZKANIE,
    }
});