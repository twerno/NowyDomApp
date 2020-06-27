import { SemekoDataProviderBuilder } from "./dataProvider/SemekoDataProviderBuilder";

export default SemekoDataProviderBuilder({
    inwestycjaId: 'Aquasfera',
    listaLokaliUrl: 'https://www.semeko.pl/oferta/aquasfera/tabela-lokali',
    standard: { data: {} },
    url: 'https://www.semeko.pl/oferta/aquasfera'
});
