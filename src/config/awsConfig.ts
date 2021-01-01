export default {
    region: 'eu-west-1',
    Bucket: 'nowydom',

    dynamoDB: {
        ofertaOpe: {
            name: 'OfertaOpe',
            key: 'ofertaId'
        },
        ofertaStan: {
            name: 'Oferta',
            key: 'inwestycjaId'
        },
    }
}