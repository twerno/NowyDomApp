import { Typ } from "../../core/oferta/model/Typ";
import { EuroStylDataProviderBuilder } from "./internal/EuroStylDataBuilder";

export default EuroStylDataProviderBuilder({
    inwestycjaId: 'Osiedle_Locus',
    listaLokaliUrl: 'https://www.eurostyl.com.pl/osiedle-locus-rumia-janowo/tabela-lokali_pelna.html',
    data: {
        typ: Typ.MIESZKANIE,
    },
    url: 'https://www.eurostyl.com.pl/osiedle-locus-rumia-janowo.html',
    miasto: 'Rumia',
    dzielnica: undefined
});
