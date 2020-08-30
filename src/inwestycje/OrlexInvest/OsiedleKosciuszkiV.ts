import { OrlexInvestDataProviderBuilder } from "./internal/OrlexInvestDataBuilder";
import { Typ } from "@src/core/oferta/model/Typ";

export default OrlexInvestDataProviderBuilder({
    listaLokaliUrl: 'https://www.orlexinvest.pl/inwestycje/pogorze-osiedle-kosciuszki-v',
    inwestycjaId: 'OsiedleKosciuszki',
    miasto: 'Pogórze',
    dzielnica: undefined,
    url: 'https://www.orlexinvest.pl/inwestycje/pogorze-osiedle-kosciuszki-v',
    data: {
        typ: Typ.MIESZKANIE,
        budynek: 'V'
    }
});