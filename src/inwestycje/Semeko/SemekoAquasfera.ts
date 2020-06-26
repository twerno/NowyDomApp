import { registerInwestycja } from "../../inwestycje/inwestycje";
import { SemekoDataProviderBuilder } from "./dataProvider/SemekoDataProviderBuilder";

const inwestycja = SemekoDataProviderBuilder({
    inwestycjaId: 'Aquasfera',
    listaLokaliUrl: 'https://www.semeko.pl/oferta/aquasfera/tabela-lokali',
    standard: { data: {} },
    url: 'https://www.semeko.pl/oferta/aquasfera'
});

export default inwestycja;

registerInwestycja(inwestycja);