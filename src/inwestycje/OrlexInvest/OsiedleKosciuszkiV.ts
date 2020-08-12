import { OrlexInvestataProviderBuilder } from "./internal/OrlexInvestDataBuilder";
import { Typ } from "@src/core/oferta/model/Typ";

export default OrlexInvestataProviderBuilder({
    listaLokaliUrl: 'https://www.orlexinvest.pl/inwestycje/pogorze-osiedle-kosciuszki-v',
    inwestycjaId: 'OsiedleKosciuszki',
    lokalizacja: 'Pogórze',
    url: 'https://www.orlexinvest.pl/inwestycje/pogorze-osiedle-kosciuszki-v',
    data: {
        typ: Typ.MIESZKANIE,
        budynek: 'V'
    }
});