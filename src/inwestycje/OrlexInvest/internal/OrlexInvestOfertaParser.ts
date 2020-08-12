import { IOrlexInvestParserProps } from './OrlexInvestDataBuilder';
import { IOrlexInvestOfferDetails } from './OrlexInvestModel';

export default async (
    html: string[] | string,
    errors: any[],
    offerId: string,
    props: IOrlexInvestParserProps
): Promise<IOrlexInvestOfferDetails> => {

    if (html instanceof Array) {
        throw new Error('maper przenaczony dla pojedynczego rekordu, otrzymano tablicę');
    }

    return {}
}
