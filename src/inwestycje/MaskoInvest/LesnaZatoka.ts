import { Typ } from "../../core/oferta/model/Typ";
import { MaskoInvestDataProviderBuilder } from "./MaskoInvestDataProviderBuilder";

export default MaskoInvestDataProviderBuilder({
    inwestycjaId: 'Lesna_Zatoka',
    listaLokaliUrl: 'https://maskoinvest.pl/oferta/lesna-zatoka-oferta/',
    data: {
        typ: Typ.DOM,
    },
    url: 'https://maskoinvest.pl/oferta/lesna-zatoka-oferta/',
    lokalizacja: 'Rumia'
});
