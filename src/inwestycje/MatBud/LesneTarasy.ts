import { MatBudDataProviderBuilder } from "./internal/MatBudDataBuilder";
import { Typ } from "@src/core/oferta/model/Typ";

export default MatBudDataProviderBuilder({
    listaLokaliUrl: 'http://matbudrumia.pl/sprzedaz-mieszkan/lesne-tarasy/plany-mieszkan/',
    inwestycjaId: 'LesneTarasy',
    lokalizacja: 'Reda',
    url: 'http://matbudrumia.pl/sprzedaz-mieszkan/lesne-tarasy/',
    data: {
        typ: Typ.MIESZKANIE,
    }
});