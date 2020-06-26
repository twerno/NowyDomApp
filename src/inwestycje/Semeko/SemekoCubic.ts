import { SemekoDataProviderBuilder } from "./dataProvider/SemekoDataProviderBuilder";
import { registerInwestycja } from "../../inwestycje/inwestycje";

const inwestycja = SemekoDataProviderBuilder({
    inwestycjaId: 'Cubic',
    listaLokaliUrl: 'https://www.semeko.pl/oferta/Osiedle-Cubic-Rumia/tabela-lokali',
    standard: { data: {} },
    url: 'https://www.semeko.pl/oferta/Osiedle-Cubic-Rumia'
});

export default inwestycja;

registerInwestycja(inwestycja);