import { OrlexInvestDataProviderBuilder } from "./internal/OrlexInvestDataBuilder";
import { Typ } from "@src/core/oferta/model/Typ";

export default OrlexInvestDataProviderBuilder({
    listaLokaliUrl: 'https://www.orlexinvest.pl/inwestycje/3-towers-reda-budynek-a',
    inwestycjaId: 'Osiedle3Towers',
    miasto: 'Reda',
    dzielnica: undefined,
    url: 'https://www.orlexinvest.pl/inwestycje/3-towers-reda-budynek-a',
    data: {
        typ: Typ.MIESZKANIE,
        budynek: undefined
    }
});