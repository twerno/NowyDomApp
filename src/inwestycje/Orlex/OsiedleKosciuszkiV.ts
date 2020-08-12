import { OrlexDataProviderBuilder } from "./internal/OrlexDataBuilder";
import { Typ } from "@src/core/oferta/model/Typ";

export default OrlexDataProviderBuilder({
    listaLokaliUrl: 'https://www.orlexinvest.pl/inwestycje/pogorze-osiedle-kosciuszki-v',
    inwestycjaId: 'OsiedleKosciuszki',
    lokalizacja: '',
    url: 'https://www.orlexinvest.pl/inwestycje/pogorze-osiedle-kosciuszki-v',
    data: { typ: Typ.MIESZKANIE }
});