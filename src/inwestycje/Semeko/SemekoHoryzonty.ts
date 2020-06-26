import { SemekoDataProviderBuilder } from "./dataProvider/SemekoDataProviderBuilder";
import { registerInwestycja } from "../../inwestycje/inwestycje";

const inwestycja = SemekoDataProviderBuilder({
    inwestycjaId: 'Horyzonty',
    listaLokaliUrl: 'https://www.semeko.pl/oferta/Horyzonty-Gdyni/tabela-lokali',
    standard: { data: {} },
    url: 'https://www.semeko.pl/oferta/Horyzonty-Gdyni'
});

export default inwestycja;

registerInwestycja(inwestycja);