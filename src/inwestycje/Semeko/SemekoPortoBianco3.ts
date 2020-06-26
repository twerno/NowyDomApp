import { SemekoDataProviderBuilder } from "./dataProvider/SemekoDataProviderBuilder";
import { registerInwestycja } from "../../inwestycje/inwestycje";

const inwestycja = SemekoDataProviderBuilder({
    inwestycjaId: 'Porto Bianco III',
    listaLokaliUrl: 'https://www.semeko.pl/oferta/Porto-Bianco-III/tabela-lokali',
    standard: { data: {} },
    url: 'https://www.semeko.pl/oferta/Porto-Bianco-III'
});

export default inwestycja;

registerInwestycja(inwestycja);