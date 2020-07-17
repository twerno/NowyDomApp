import { Typ } from "../../core/oferta/model/Typ";
import { EuroStylDataProviderBuilder } from "./internal/EuroStylDataBuilder";

export default EuroStylDataProviderBuilder({
    inwestycjaId: 'Nasze_Miejsce',
    listaLokaliUrl: 'https://www.eurostyl.com.pl/naszemiejsce/tabela-lokali-pelna.html',
    data: {
        typ: Typ.MIESZKANIE,
    },
    url: 'https://www.eurostyl.com.pl/naszemiejsce.html',
});
