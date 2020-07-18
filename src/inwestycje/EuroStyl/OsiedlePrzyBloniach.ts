import { Typ } from "../../core/oferta/model/Typ";
import { EuroStylDataProviderBuilder } from "./internal/EuroStylDataBuilder";

export default EuroStylDataProviderBuilder({
    inwestycjaId: 'Osiedle_Przy_Bloniach',
    listaLokaliUrl: 'https://www.eurostyl.com.pl/osiedle-przy-bloniach-rumia-janowo/tabela-lokali_pelna.html',
    data: {
        typ: Typ.MIESZKANIE,
    },
    url: 'https://www.eurostyl.com.pl/osiedle-przy-bloniach-rumia-janowo/',
    lokalizacja: 'Rumia Janowo Park'
});
