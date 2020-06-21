import { IOfertaDane, Typ } from '../../dataProvider/IOfertaRecord';
import { IGarvenaParkDetails, IGarvenaParkListElement } from './GarvenaParkModel';

export default (listItem: IGarvenaParkListElement, detale: IGarvenaParkDetails | null): { id: string, dane: IOfertaDane } => {

    const result: IOfertaDane = {
        typ: Typ.MIESZKANIE
        , ...listItem
        , cechy: { data: {} }
    };

    return { id: listItem.id, dane: result };
}
