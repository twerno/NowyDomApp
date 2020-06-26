import { SemekoDataProviderBuilder } from "./dataProvider/SemekoDataProviderBuilder";
import { registerInwestycja } from "../../inwestycje/inwestycje";

const inwestycja = SemekoDataProviderBuilder({
    inwestycjaId: 'Light Tower',
    listaLokaliUrl: 'https://www.semeko.pl/oferta/Light-Tower-Reda/tabela-lokali',
    standard: { data: {} },
    url: 'https://www.semeko.pl/oferta/Light-Tower-Reda'
});

export default inwestycja;

registerInwestycja(inwestycja);