import { SemekoDataProviderBuilder } from "./dataProvider/SemekoDataProviderBuilder";
import { registerInwestycja } from "../../inwestycje/inwestycje";

const inwestycja = SemekoDataProviderBuilder({
    inwestycjaId: 'Prima Reda',
    listaLokaliUrl: 'https://www.semeko.pl/oferta/Prima-Reda-Reda/tabela-lokali',
    standard: { data: {} },
    url: 'https://www.semeko.pl/oferta/Prima-Reda-Reda'
})

export default inwestycja;

registerInwestycja(inwestycja);