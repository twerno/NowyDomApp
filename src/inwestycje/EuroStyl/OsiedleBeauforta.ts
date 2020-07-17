import { Typ } from "../../core/oferta/model/Typ";
import { EuroStylDataProviderBuilder } from "./internal/EuroStylDataBuilder";

export default EuroStylDataProviderBuilder({
    inwestycjaId: 'Osiedle_Beauforta',
    listaLokaliUrl: 'htts://www.eurostyl.com.pl/osiedle-beauforta-gdynia-pogorze/tabela-lokali/tabela-lokali_pelna.html',
    data: {
        typ: Typ.MIESZKANIE,
    },
    url: 'htts://www.eurostyl.com.pl/osiedle-beauforta-gdynia-pogorze',
});
