import { Typ } from "../../core/oferta/model/Typ";
import { LokerDataProviderBuilder } from "./internal/LokerDataBuilder";

export default LokerDataProviderBuilder({
    inwestycjaId: 'Osiedle_Primula',
    listaLokaliUrl: 'http://www.loker.com.pl/?action=oferta&ido=10&tab=tabelamieszkan#show',
    data: {
        typ: Typ.DOM,
    },
    url: 'http://www.loker.com.pl/?action=oferta&ido=10',
    miasto: 'Starogard',
    dzielnica: undefined
});
