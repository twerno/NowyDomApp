import { IDataProviderParserProps } from '@src/core/oferta/IOfertaProvider';
import { IOfertaDane, ZASOBY } from '../../../core/oferta/model/IOfertaModel';
import { IMaskoInvestDataProviderBuilderData } from '../MaskoInvestDataProviderBuilder';
import { IMaskoInvestListElement } from './MaskoInvestModel';

export default (
    listItem: IMaskoInvestListElement,
    detale: null | void,
    props: IDataProviderParserProps<IMaskoInvestListElement, void, IMaskoInvestDataProviderBuilderData>
): { id: string, dane: IOfertaDane } => {

    const zasobyDoPobrania = listItem.sourceOfertaPdfUrl
        ? [{ id: ZASOBY.PDF, url: listItem.sourceOfertaPdfUrl }]
        : [];

    const result: IOfertaDane = {
        ...listItem,
        zasobyDoPobrania,
        liczbaKondygnacji: undefined,
        budynek: undefined,
        cena: undefined,
        nrLokalu: undefined,
        stronySwiata: undefined,
        offerDetailsUrl: ''
    };

    return { id: listItem.id, dane: result };
}
