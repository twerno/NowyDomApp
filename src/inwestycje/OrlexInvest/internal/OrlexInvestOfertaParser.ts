import { IOrlexInvestarserProps } from './OrlexInvestDataBuilder';
import { IOrlexInvestfferDetails } from './OrlexInvestModel';

export default async (
    html: string[] | string,
    errors: any[],
    offerId: string,
    props: IOrlexInvestarserProps
): Promise<IOrlexInvestfferDetails> => {

    if (html instanceof Array) {
        throw new Error('maper przenaczony dla pojedynczego rekordu, otrzymano tablicę');
    }

    return {}
}
