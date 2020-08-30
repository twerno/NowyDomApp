import { Typ } from "../../core/oferta/model/Typ";
import { LokerDataProviderBuilder } from "./internal/LokerDataBuilder";

export default LokerDataProviderBuilder({
    inwestycjaId: 'Vela_Park',
    listaLokaliUrl: 'http://www.loker.com.pl/?action=oferta&ido=14&tab=tabelamieszkan#show',
    data: {
        typ: Typ.MIESZKANIE,
    },
    url: 'http://www.loker.com.pl/?action=oferta&ido=14',
    miasto: 'Rumia',
    dzielnica: 'Biała Rzeka'
});
