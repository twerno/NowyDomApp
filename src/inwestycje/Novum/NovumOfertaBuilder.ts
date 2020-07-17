import { ICechy, IOfertaDane, IRawData, ZASOBY, MapWithRawType } from '../../core/oferta/model/IOfertaModel';
import { Novum } from './Novum';
import { INovumDetails, INovumListElement } from './NovumSchema';
import { StronaSwiata, StronaSwiataHelper } from '../../core/oferta/model/StronySwiata';
import { Status } from '../../core/oferta/model/Status';
import { Typ } from '../../core/oferta/model/Typ';
import CommConv from '@src/core/utils/CommConv';
import TypeUtils from '@src/utils/TypeUtils';

export default (listItem: INovumListElement, detale: INovumDetails | null): { id: string, dane: IOfertaDane } => {

    const kierunek = kierunekMapper(detale);
    const standard = standardMapper(detale);
    const status = statusMapper(listItem);
    const odbior = odbiorMapper(listItem);

    const zasobyDoPobrania = detale?.sourceOfertaPdfUrl
        ? [{ id: ZASOBY.PDF, url: detale?.sourceOfertaPdfUrl }]
        : [];

    const result: IOfertaDane = {
        typ: Typ.MIESZKANIE,
        budynek: listItem.budynek,
        nrLokalu: listItem.nrLokalu,
        metraz: listItem.metraż,
        lpPokoj: listItem.liczbaPokoi,
        pietro: listItem.piętro,
        stronySwiata: kierunek,
        cechy: standard,

        status,
        odbior,
        cena: listItem.cena,

        offerDetailsUrl: listItem.offerDetailsUrl,
        zasobyDoPobrania,
        liczbaKondygnacji: undefined
    };

    return { id: listItem.id, dane: result };
}

// ========================================
// private
// ========================================

const odbiorRegExpr = /(I|II|III|IV) kwartał (\d{4})/;

function odbiorMapper(listItem: INovumListElement): IRawData | { rok: number, kwartal: number } {
    const val = odbiorRegExpr.exec(listItem.odbiór);

    if (val) {
        return {
            kwartal: CommConv.rzymskie2arabskie(val[1]),
            rok: Number.parseInt(val[2])
        };
    }

    return { raw: listItem.odbiór };
}

function statusMapper(listItem: INovumListElement): Status | IRawData {
    switch (listItem.status) {
        case 'wolne': return Status.WOLNE;
        case 'zarezerwowane': return Status.REZERWACJA;
        case 'sprzedane': return Status.SPRZEDANE;
        default: return { raw: listItem.status };
    }
}

function kierunekMapper(detale: INovumDetails | null): Array<StronaSwiata | IRawData> {
    if (!detale) {
        return [];
    }

    const result = detale.stronyŚwiata
        .split(',')
        .map(v => v.trim())
        .map(StronaSwiataHelper.raw2StronaSwiata)
        .filter(TypeUtils.notEmpty);

    return result;
}

function standardMapper(detale: INovumDetails | null): MapWithRawType<ICechy> {
    const result: MapWithRawType<ICechy> = {
        map: { ...Novum.data.cechy.map },
        raw: [...Novum.data.cechy.raw || []]
    };

    detale?.udogodnienia
        .split(',')
        .map(v => v.trim())
        .forEach(val => {
            const partial = standardValMapper(val);
            if (partial) {
                result.map = { ...result.map, ...partial };
            }
            else {
                result.raw?.push(val)
            }
        })

    return result;
}

function standardValMapper(val: string): Partial<ICechy> | null {
    switch (val) {
        case 'balkon': return { balkon: true };
        case 'taras': return { taras: true };
        default: return null;
    }
}