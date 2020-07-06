import { MultidomDataProviderBuilder } from "./utils/MultidomDataProviderBuilder";
import { Typ } from "../../core/oferta/model/Typ";

export default MultidomDataProviderBuilder({
    inwestycjaId: 'Apartamenty Marengo',
    listaLokaliUrl: 'https://multidom.pl/apartamenty-marengo',
    data: {
        typ: Typ.MIESZKANIE,
    },
    url: 'https://multidom.pl/apartamenty-marengo',
});
