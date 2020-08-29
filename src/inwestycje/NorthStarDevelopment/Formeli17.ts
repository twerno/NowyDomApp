import { ofertaIdBuilderExcept } from "@src/core/oferta/IOfertaProvider";
import { ZASOBY } from "@src/core/oferta/model/IOfertaModel";
import { HTMLElement } from 'node-html-parser';
import { Typ } from "../../core/oferta/model/Typ";
import { HtmlParser } from "../helpers/HtmlParser";
import DataParserHelper from '../helpers/ParserHelper';
import { INorthStarDevDataProvider, NorthStarDevDataProviderBuilder } from "./internal/NorthStarDevDataBuilder";
import { INorthStarDevListElement } from "./internal/NorthStarDevModel";

export default NorthStarDevDataProviderBuilder({
    inwestycjaId: 'Formeli17',
    listaLokaliUrl: 'https://formeli17.pl/#dostepne-mieszkania',
    data: {
        typ: Typ.MIESZKANIE,
    },
    url: 'https://formeli17.pl',
    lokalizacja: 'Rumia',
    northStarDevRowMapper: rowMapper
});

function rowMapper(
    row: HTMLElement | undefined,
    h: HtmlParser<INorthStarDevListElement>,
    dataProvider: INorthStarDevDataProvider
): INorthStarDevListElement {

    const cols: HTMLElement[] = row?.querySelectorAll('td') || [];

    const result: INorthStarDevListElement = {
        id: 'tmp_id',
        typ: dataProvider.data.typ,
        ...h.asFloat('metraz', cols[0], DataParserHelper.float()),
        ...h.asInt('pietro', cols[1], DataParserHelper.pietro),
        ...h.asInt('lpPokoj', cols[2]),
        ...h.asCustom('status', cols[3], DataParserHelper.status),
        ...h.asString('nrLokalu', cols[4]),
        ...zasobyDoPobrania(cols[5], h),
    };

    result.id = ofertaIdBuilderExcept([dataProvider.inwestycjaId, result.nrLokalu]);

    return result;
}

// ****************************
// mapper utils
// ****************************

function zasobyDoPobrania(el: HTMLElement | undefined, h: HtmlParser<INorthStarDevListElement>) {
    const link = el?.querySelector('a');
    const href = h.readAttributeOf(link, 'href', { fieldInfo: 'zasobyDoPobrania', mustExist: false });

    const zasobyDoPobrania = href
        ? [{ id: ZASOBY.IMG, url: href }]
        : [];

    return { zasobyDoPobrania };
}