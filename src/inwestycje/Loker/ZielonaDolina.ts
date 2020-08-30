import { Typ } from "../../core/oferta/model/Typ";
import { LokerDataProviderBuilder } from "./internal/LokerDataBuilder";

export default LokerDataProviderBuilder({
    inwestycjaId: 'Zielona_Dolina',
    listaLokaliUrl: [
        'http://www.loker.com.pl/?action=oferta&ido=6&tab=tabelamieszkan#show', // II ETAP
        'http://www.loker.com.pl/?action=oferta&ido=11&tab=tabelamieszkan#show', // III ETAP

    ],
    data: {
        typ: Typ.MIESZKANIE,
    },
    url: 'http://www.loker.com.pl/?action=oferta&ido=11',
    miasto: 'Starogard',
    dzielnica: undefined
});
