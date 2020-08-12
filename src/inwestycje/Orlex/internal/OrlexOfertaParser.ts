import { IOrlexParserProps } from './OrlexDataBuilder';
import { IOrlexOfferDetails } from './OrlexModel';

export default async (
    html: string[] | string,
    errors: any[],
    offerId: string,
    props: IOrlexParserProps
): Promise<IOrlexOfferDetails> => {

    if (html instanceof Array) {
        throw new Error('maper przenaczony dla pojedynczego rekordu, otrzymano tablicę');
    }

    return {}
}
