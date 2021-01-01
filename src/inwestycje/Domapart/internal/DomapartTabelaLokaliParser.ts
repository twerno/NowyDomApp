import { OdbiorType } from '@src/core/oferta/model/OdbiorType';
import { Status } from '@src/core/oferta/model/Status';
import CommConv from '@src/inwestycje/utils/CommConv';
import { HTMLElement } from 'node-html-parser';
import { IAsyncTask } from "../../../core/asyncTask/IAsyncTask";
import { ofertaIdBuilderExcept } from '../../../core/oferta/IOfertaProvider';
import { HtmlParser } from '../../helpers/HtmlParser';
import DataParserHelper from '../../helpers/ParserHelper';
import { IDomapartDataProvider, IDomapartParserProps } from './Domapart';
import { IDomapartListElement } from './DomapartModel';

export default (
    json: any,
    errors: any[],
    props: IDomapartParserProps
): { items: IDomapartListElement[], tasks?: IAsyncTask[] } => {

    const flats: any[] = json?.flats || [];
    const items = flats
        .filter(flat => !!flat)
        .map<IDomapartListElement>(flat => (
            {
                id: 'tmp_id',
                budynek: (<string>flat.etap[0] || '').replace('&nbsp', ' ').replace('<br/>', ''),
                metraz: DataParserHelper.float()(flat.area[0]) ?? { raw: flat.area[0] },
                offerDetailsUrl: props.dataProvider.url + flat.flatUrl[0],
                pietro: DataParserHelper.pietro(flat.floor[0]) ?? { raw: flat.floor[0] },
                nrLokalu: flat.number[0],
                lpPokoj: flat.rooms[0],
                odbior: odbiorMapper(flat.termin[0]) ?? { raw: flat.termin[0] },
                typ: props.dataProvider.data.typ,
                status: flat.status[0] === 1 ? Status.WOLNE : Status.REZERWACJA
            }
        ));

    items.forEach(item => {
        item.id = ofertaIdBuilderExcept([props.dataProvider.inwestycjaId, item.budynek, item.nrLokalu]);

    })

    return { items };
}

// ****************************
// mapper utils
// ****************************

function odbiorMapper(raw: string | null | undefined): OdbiorType | null {
    if (raw === null || raw === undefined) {
        return null;
    }

    const exprResult = /^(\w+)&nbsp;kw.&nbsp;(\d{4})/.exec(raw || '');

    if (!exprResult || !exprResult[1]) {
        return { raw };
    }

    const kwartal = CommConv.rzymskie2arabskie(exprResult[1]);
    const rok = Number.parseInt(exprResult[2]);

    if (kwartal === null || isNaN(rok)) {
        return { raw };
    }

    return { kwartal, rok };
}