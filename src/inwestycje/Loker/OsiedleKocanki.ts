import { Typ } from "../../core/oferta/model/Typ";
import { LokerDataProviderBuilder } from "./internal/LokerDataBuilder";

export default LokerDataProviderBuilder({
    inwestycjaId: 'Osiedle_Kocanki',
    listaLokaliUrl: 'http://www.loker.com.pl/?action=oferta&ido=7&tab=tabelamieszkan#show',
    data: {
        typ: Typ.DOM,
    },
    url: 'http://www.loker.com.pl/?action=oferta&ido=7',
    miasto: 'Rumia',
    dzielnica: 'Biała Rzeka'
});
