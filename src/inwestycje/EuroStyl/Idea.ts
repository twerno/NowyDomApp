import { Typ } from "../../core/oferta/model/Typ";
import { EuroStylDataProviderBuilder } from "./internal/EuroStylDataBuilder";

export default EuroStylDataProviderBuilder({
    inwestycjaId: 'Idea',
    listaLokaliUrl: 'https://www.eurostyl.com.pl/osiedle-idea-etap-iv-gdansk-oliwa/tabela-lokali.html',
    data: {
        typ: Typ.MIESZKANIE,
    },
    url: 'https://www.eurostyl.com.pl/osiedle-idea-etap-iv-gdansk-oliwa.html',
    miasto: 'Gdańsk',
    dzielnica: 'Oliwa'
});
