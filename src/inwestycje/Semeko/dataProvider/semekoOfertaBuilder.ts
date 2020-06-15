import { IOfertaDane, Typ } from '../../../dataProvider/IOfertaRecord';
import { ISemekoDetails, ISemekoListElement } from './SemekoModel';

export default (item: ISemekoListElement, detale: ISemekoDetails | null): { id: string, dane: IOfertaDane } => {

    const zasobyDoPobrania = [...item.zasobyDoPobrania, ...detale?.zasobyDoPobrania || []];

    const result: IOfertaDane = {
        typ: Typ.MIESZKANIE,
        ...item,
        ...detale,
        zasobyDoPobrania,
        zasobyPobrane: [],
    };

    return { id: item.id, dane: result };
}
