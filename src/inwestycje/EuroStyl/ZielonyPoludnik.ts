import { Typ } from "../../core/oferta/model/Typ";
import { EuroStylDataProviderBuilder } from "./internal/EuroStylDataBuilder";

export default EuroStylDataProviderBuilder({
    inwestycjaId: 'Zielony_Poludnik',
    listaLokaliUrl: 'https://www.eurostyl.com.pl/zielony-poludnik-gdansk-poludnie/tabela-lokali/tabela-lokali_pelna.html',
    data: {
        typ: Typ.MIESZKANIE,
    },
    url: 'https://www.eurostyl.com.pl/zielony-poludnik-gdansk-poludnie.html',
    lokalizacja: 'Gdańsk południe'
});
