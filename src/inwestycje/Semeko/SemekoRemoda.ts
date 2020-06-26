import { SemekoDataProviderBuilder } from "./dataProvider/SemekoDataProviderBuilder";
import { registerInwestycja } from "../../inwestycje/inwestycje";

const inwestycja = SemekoDataProviderBuilder({
    inwestycjaId: 'Remoda',
    listaLokaliUrl: 'https://www.semeko.pl/oferta/Remoda-Reda/tabela-lokali',
    standard: { data: {} },
    url: 'https://www.semeko.pl/oferta/Remoda-Reda'
});

export default inwestycja;

registerInwestycja(inwestycja);