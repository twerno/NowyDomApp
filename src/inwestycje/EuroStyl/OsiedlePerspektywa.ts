import { Typ } from "../../core/oferta/model/Typ";
import { EuroStylDataProviderBuilder } from "./internal/EuroStylDataBuilder";

export default EuroStylDataProviderBuilder({
    inwestycjaId: 'Osiedle_Perspektywa',
    listaLokaliUrl: 'https://www.eurostyl.com.pl/osiedle-perspektywa-gdansk-siedlce/tabela-lokali-pelna.html',
    data: {
        typ: Typ.MIESZKANIE,
    },
    url: 'https://www.eurostyl.com.pl/osiedle-perspektywa-gdansk-siedlce/',
    miasto: 'Gdańsk',
    dzielnica: 'Śródmieście'
});
