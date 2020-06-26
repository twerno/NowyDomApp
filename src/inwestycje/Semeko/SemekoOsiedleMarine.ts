import { SemekoDataProviderBuilder } from "./dataProvider/SemekoDataProviderBuilder";
import { registerInwestycja } from "../../inwestycje/inwestycje";

const inwestycja = SemekoDataProviderBuilder({
    inwestycjaId: 'Osiedle Marine',
    listaLokaliUrl: 'https://www.semeko.pl/oferta/Osiedle-Marine-Rumia/tabela-lokali',
    standard: { data: {} },
    url: 'https://www.semeko.pl/oferta/Osiedle-Marine-Rumia'
});

export default inwestycja;

registerInwestycja(inwestycja);