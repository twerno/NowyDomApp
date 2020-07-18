import { Typ } from "../../core/oferta/model/Typ";
import { EuroStylDataProviderBuilder } from "./internal/EuroStylDataBuilder";

export default EuroStylDataProviderBuilder({
    inwestycjaId: 'Osiedle_Cis',
    listaLokaliUrl: 'https://www.eurostyl.com.pl/osiedle-cis-gdynia-cisowa/tabela-lokali_pelna.html',
    data: {
        typ: Typ.MIESZKANIE,
    },
    url: 'https://www.eurostyl.com.pl/osiedle-cis-gdynia-cisowa/',
    lokalizacja: 'Gdynia Cisowa'
});
