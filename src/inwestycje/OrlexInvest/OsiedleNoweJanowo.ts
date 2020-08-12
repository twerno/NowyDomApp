import { OrlexInvestataProviderBuilder } from "./internal/OrlexInvestDataBuilder";
import { Typ } from "@src/core/oferta/model/Typ";

export default OrlexInvestataProviderBuilder({
    listaLokaliUrl: [
        'https://www.orlexinvest.pl/inwestycje/osiedle-nowe-janowo',
        'https://www.orlexinvest.pl/inwestycje/rumia-osiedle-nowe-janowo-budynek-b',
        'https://www.orlexinvest.pl/inwestycje/rumia-osiedle-nowe-janowo-budynek-c',
        'https://www.orlexinvest.pl/inwestycje/rumia-osiedle-nowe-janowo-budynek-d'
    ],
    inwestycjaId: 'OsiedleNoweJanowo',
    lokalizacja: 'Rumia Janowo',
    url: 'https://www.orlexinvest.pl/inwestycje/osiedle-nowe-janowo',
    data: {
        typ: Typ.MIESZKANIE,
        budynek: undefined
    }
});