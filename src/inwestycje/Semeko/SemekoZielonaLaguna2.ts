import { SemekoDataProviderBuilder } from "./dataProvider/SemekoDataProviderBuilder";
import { registerInwestycja } from "../../inwestycje/inwestycje";


const inwestycja = SemekoDataProviderBuilder({
    inwestycjaId: 'Zielona Laguna II',
    listaLokaliUrl: 'https://www.semeko.pl/oferta/Zielona-Laguna-II-Gdynia/tabela-lokali',
    standard: { data: {} },
    url: 'https://www.semeko.pl/oferta/Zielona-Laguna-II-Gdynia'
});

export default inwestycja;

registerInwestycja(inwestycja);