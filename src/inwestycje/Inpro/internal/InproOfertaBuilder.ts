import { IOfertaDane, ZASOBY } from '../../../core/oferta/model/IOfertaModel';
import { IInproListElement, IInproOfferDetails } from './InproModel';
import { Typ } from '../../../core/oferta/model/Typ';
import { IDataProviderParserProps } from '@src/core/oferta/IOfertaProvider';
import { IInproDataProviderBuilderData } from '../InproDataProviderBuilder';

export default (
    listItem: IInproListElement,
    detale: IInproOfferDetails | null,
    props: IDataProviderParserProps<IInproListElement, IInproOfferDetails, IInproDataProviderBuilderData>
): { id: string, dane: IOfertaDane } => {

    const zasobyDoPobrania = detale?.sourceOfertaPdfUrl
        ? [{ id: ZASOBY.PDF, url: detale?.sourceOfertaPdfUrl }]
        : [];

    const result: IOfertaDane = {
        ...listItem,
        ...detale,
        zasobyDoPobrania,
        liczbaKondygnacji: undefined,
        odbior: props.dataProvider.data.odbior,
        cena: listItem.cena,
        offerDetailsUrl: listItem.offerDetailsUrl
    };

    return { id: listItem.id, dane: result };
}
