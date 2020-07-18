import { InproDataProviderBuilder } from "./InproDataProviderBuilder";
import { Typ } from "../../core/oferta/model/Typ";

export default InproDataProviderBuilder({
    inwestycjaId: 'HarmoniaOliwska',
    listaLokaliUrl: 'https://www.inpro.com.pl/harmonia-oliwska/cennik',
    url: 'https://www.inpro.com.pl/harmonia-oliwska/mieszkania-gdansk-oliwa',
    data: {
        cechy: {
            map: {}
        },
        typ: Typ.MIESZKANIE,
    },
    lokalizacja: 'Gdańsk Oliwa',
});