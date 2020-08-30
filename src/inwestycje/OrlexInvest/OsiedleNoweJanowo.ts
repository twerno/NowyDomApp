import { OrlexInvestDataProviderBuilder } from "./internal/OrlexInvestDataBuilder";
import { Typ } from "@src/core/oferta/model/Typ";

export default OrlexInvestDataProviderBuilder({
    listaLokaliUrl: [
        'https://www.orlexinvest.pl/inwestycje/osiedle-nowe-janowo'
    ],
    inwestycjaId: 'OsiedleNoweJanowo',
    miasto: 'Rumia',
    dzielnica: 'Janowo Park',
    url: 'https://www.orlexinvest.pl/inwestycje/osiedle-nowe-janowo',
    data: {
        typ: Typ.MIESZKANIE,
        budynek: undefined
    }
});