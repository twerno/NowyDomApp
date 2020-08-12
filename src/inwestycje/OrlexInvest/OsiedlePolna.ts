import { OrlexInvestDataProviderBuilder } from "./internal/OrlexInvestDataBuilder";
import { Typ } from "@src/core/oferta/model/Typ";

export default OrlexInvestDataProviderBuilder({
    listaLokaliUrl: 'https://www.orlexinvest.pl/inwestycje/osiedle-polna',
    inwestycjaId: 'OsiedlePolna',
    lokalizacja: 'Reda',
    url: 'https://www.orlexinvest.pl/inwestycje/osiedle-polna',
    data: {
        typ: Typ.MIESZKANIE,
        budynek: undefined
    }
});