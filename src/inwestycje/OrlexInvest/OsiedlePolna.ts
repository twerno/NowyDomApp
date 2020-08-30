import { OrlexInvestDataProviderBuilder } from "./internal/OrlexInvestDataBuilder";
import { Typ } from "@src/core/oferta/model/Typ";

export default OrlexInvestDataProviderBuilder({
    listaLokaliUrl: 'https://www.orlexinvest.pl/inwestycje/osiedle-polna',
    inwestycjaId: 'OsiedlePolna',
    miasto: 'Reda',
    dzielnica: undefined,
    url: 'https://www.orlexinvest.pl/inwestycje/osiedle-polna',
    data: {
        typ: Typ.MIESZKANIE,
        budynek: undefined
    }
});