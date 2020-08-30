import { Typ } from "../../core/oferta/model/Typ";
import { MaskoInvestDataProviderBuilder } from "./MaskoInvestDataProviderBuilder";

export default MaskoInvestDataProviderBuilder({
    inwestycjaId: 'Rodziewiczówny',
    listaLokaliUrl: 'https://maskoinvest.pl/oferta/rumia-rodziewiczowny/',
    data: {
        typ: Typ.MIESZKANIE,
    },
    url: 'https://maskoinvest.pl/oferta/rumia-rodziewiczowny/',
    miasto: 'Rumia',
    dzielnica: undefined
});
