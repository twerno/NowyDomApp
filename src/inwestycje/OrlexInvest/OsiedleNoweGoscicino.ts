import { OrlexInvestDataProviderBuilder } from "./internal/OrlexInvestDataBuilder";
import { Typ } from "@src/core/oferta/model/Typ";

export default OrlexInvestDataProviderBuilder({
    listaLokaliUrl: 'https://www.orlexinvest.pl/inwestycje/nowe-goscicino-etap-ii',
    inwestycjaId: 'OsiedleNoweGoscicino',
    miasto: 'Gościcino',
    dzielnica: undefined,
    url: 'https://www.orlexinvest.pl/inwestycje/nowe-goscicino-etap-ii',
    data: {
        typ: Typ.MIESZKANIE,
        budynek: 'etap2'
    }
});