import Axios, { AxiosResponse } from "axios";
import { extension } from 'mime-types';
import S3Utils from "utils/S3Utils";
import { ofertaOpeRepo } from "../db/OfertaRecordOpeRepo";
import { ofertaRepo } from "../db/OfertaRecordRepo";
import { IStringMap } from "../utils/IMap";
import TypeUtils from "../utils/TypeUtils";
import WebDownloader from "../utils/WebDownloader";
import { IDataProvider, IListElement } from "./IOfertaProvider";
import { IOfertaDane, IOfertaRecord, IOfertaRecordOpe, Status } from "./IOfertaRecord";

export async function run<T extends IListElement, D>(dataProvider: IDataProvider<T, D>) {
    const errors: any[] = [];

    const oferty = await provideOfferList(dataProvider, errors);

    const ofertyStan = await pobierzOfertyZInwestycji(dataProvider);
    const ofertaOperList = wyliczOfertaOper(ofertyStan, oferty, dataProvider);
    await zapiszOper(ofertaOperList);
    await pobierzKartyOfert(ofertaOperList);

    return { errors, ofertyStan, ofertaZmiana: ofertaOperList };
}

// =======================================
// private
// =======================================

async function provideOfferList<T extends IListElement, D>(
    dataProvider: IDataProvider<T, D>,
    errors: any[]
) {
    // przygotowanie url zawierających listę ofert
    const urls = await dataProvider.listUrlProvider();

    const listHtml = await downloadLists(urls, errors);

    // zachomikuj html-e na s3
    // TODO - html + url + data

    console.log('pobieranie listy ofert');
    const offerList = parseOfferList(listHtml, dataProvider, errors);

    console.log('pobieranie detali');
    const detailsHtml = await downloadDetails(offerList, dataProvider, errors);

    // zachomikuj html-e na s3
    // TODO - html + url + data

    console.log('parsowanie detali');
    const offersWithDetails = await parseDetails(detailsHtml, dataProvider, errors);

    // zachomikuj błędy na s3
    // TODO - errors + data

    console.log('budowanie ofert');
    const oferty = buildOffer(offersWithDetails, dataProvider, []);

    return oferty;
}

// pobranie stron zawierających listy ofert z przygotowanych url-i
async function downloadLists(urls: Set<string>, errors: any[]) {
    return Promise.all(
        Array.from(urls)
            .map(url =>
                WebDownloader.download(url)
                    .then(html => ({ url, html }))
                    .catch(err => {
                        errors.push(JSON.stringify({ method: 'downloadLists', err, url }));
                        return null;
                    })
            )
    );
}

// przetworzenie pobranych stron i wyciągnięcie z nich listy ofert
function parseOfferList<T extends IListElement, D>(
    lista: Array<{ url: string, html: string } | null>,
    dataProvider: IDataProvider<T, D>,
    errors: any[]
) {
    return lista
        .filter(TypeUtils.notEmpty)
        .map(({ html }) => dataProvider.listHtmlParser(html))
        .reduce((prev, curr) => [...prev, ...curr], []);
}

// pobranie detali oferty
async function downloadDetails<T extends IListElement, D>(
    offerList: T[],
    dataProvider: IDataProvider<T, D>,
    errors: any[]
) {
    const offerMapper: (props: { offer: T, urls: string[] }) => Promise<{ offer: T, htmlList?: string[] }> =
        ({ offer, urls }) => urls.length === 0
            ? Promise.resolve({ offer })
            : Promise.all(
                urls.map(url => WebDownloader.download(url)
                    .catch(err => {
                        errors.push(JSON.stringify({ method: 'downloadOfferDetails', err, detailsUrl: url }));
                        return null;
                    }))
            ).then(htmlList => (
                {
                    offer,
                    htmlList: htmlList.filter(TypeUtils.notEmpty)
                }));

    return Promise.all(
        offerList
            .map(offer => (
                {
                    offer,
                    urls: Array.from(dataProvider.offerDetailsUrlProvider(offer))
                        .filter(TypeUtils.notEmpty)
                }
            ))
            .map(offerMapper)
    );
}

// przetworzenie detali
function parseDetails<T extends IListElement, D = any>(
    lista: { offer: T, htmlList?: string[] }[],
    dataProvider: IDataProvider<T, D>,
    errors: any[]
) {
    return Promise.all(
        lista
            .filter(TypeUtils.notEmpty)
            .map(({ offer, htmlList }) => parseDetail(offer, htmlList, dataProvider, errors))
    );
}

async function parseDetail<T extends IListElement, D = any>(
    offer: T,
    htmlList: string[] | undefined,
    dataProvider: IDataProvider<T, D>,
    errors: any[]
): Promise<{ offer: T, detail?: D }> {

    if (htmlList === undefined || htmlList.length === 0) {
        return { offer };
    }

    const details = await Promise.all(
        htmlList.map(html =>
            dataProvider.offerDetailsHtmlParser(html)
                .catch(err => {
                    errors.push(JSON.stringify({ method: 'parseDetail', offer, err, html }));
                    return null;
                })
        )
    ).then(list => list.filter(TypeUtils.notEmpty));

    if (details.length <= 1) {
        const detail = details[0];
        return { offer, detail };
    }

    const offerDetailsMerger = dataProvider.offerDetailsMerger;
    if (offerDetailsMerger === undefined) {
        errors.push(JSON.stringify({ method: 'parseDetail', offer, err: 'wiele wyników do zmergowania, ale nie zdefiniowano mergera!', details }))
        return { offer, detail: details[0] };
    } else {
        const detail = details.reduce((curr, prev) => offerDetailsMerger(curr, prev), {} as D);
        return { offer, detail };
    }
}

// przepisanie lokalnych danych na obiekt
function buildOffer<T extends IListElement, D = any>(
    offersWithDetails: ({ offer: T, details?: D } | null)[],
    dataProvider: IDataProvider<T, D>,
    errors: any[]
) {
    return offersWithDetails
        .filter(TypeUtils.notEmpty)
        .map(({ offer, details }) => ({
            offer,
            details,
            planUrl: dataProvider.offerCardUrlProvider(offer, details)
        }))
        .map(({ offer, details, planUrl }) => dataProvider.offerBuilder(offer, details, planUrl));
}

// pobranie ofert z bazy
async function pobierzOfertyZInwestycji<T extends IListElement, D>(dataProvider: IDataProvider<T, D>) {
    return ofertaRepo.queryByPartitionKey(dataProvider.inwestycjaId);
}

async function zapiszOper(oferty: { rekord: IOfertaRecord, ope: IOfertaRecordOpe }[]) {
    await Promise.all(oferty.map(o => ofertaOpeRepo.put(o.ope)));
    return Promise.all(oferty.map(o => ofertaRepo.put(o.rekord)));
}

function wyliczOfertaOper<T extends IListElement, D>(
    stan: IOfertaRecord[],
    przetworzoneOferty: { id: string, dane: IOfertaDane }[],
    dataProvider: IDataProvider<T, D>
) {
    const stanMap: IStringMap<IOfertaRecord> = {};
    const ofertyMap: IStringMap<IOfertaDane> = {};

    stan.forEach(e => stanMap[e.ofertaId] = e);
    przetworzoneOferty.forEach(e => ofertyMap[e.id] = e.dane);

    const keys = new Set([...Object.keys(stanMap), ...Object.keys(ofertyMap)]);

    const result: { rekord: IOfertaRecord, ope: IOfertaRecordOpe }[] = [];
    for (const id of keys) {
        const zmiana = wyliczZmiana(id, stanMap[id] || null, ofertyMap[id] || null, dataProvider);
        if (zmiana !== null) {
            result.push(zmiana);
        }
    }

    return result;
}

function wyliczZmiana<T extends IListElement, D>(
    id: string,
    stan: IOfertaRecord | null,
    oferta: IOfertaDane | null,
    dataProvider: IDataProvider<T, D>
): { rekord: IOfertaRecord, ope: IOfertaRecordOpe } | null {

    if (stan === null) {
        return oferta === null
            ? null
            : nowyRekord(id, oferta, dataProvider)
    }

    // usunięty
    if (oferta === null) {
        return usunietyRekord(stan);
    }

    // wylicz zmiane
    return zmienionyRekord(stan, oferta);
}

function nowyRekord<T extends IListElement, D>(
    id: string,
    data: IOfertaDane,
    dataProvider: IDataProvider<T, D>
): { rekord: IOfertaRecord, ope: IOfertaRecordOpe } {
    const timestamp = new Date().getTime();

    const rekord: IOfertaRecord = {
        inwestycjaId: dataProvider.inwestycjaId, // partition_key
        ofertaId: id, // sort_key
        developerId: dataProvider.developerId,
        version: 1,
        created_at: timestamp,
        updated_at: timestamp,
        data,
    };

    const ope: IOfertaRecordOpe = {
        ofertaId: id,  // partition_key
        version: 1, // sort_key
        timestamp,
        data,
        updatedBy: 'developer'
    };

    return { rekord, ope };
}

function usunietyRekord(
    stan: IOfertaRecord
): { rekord: IOfertaRecord, ope: IOfertaRecordOpe } {
    const timestamp = new Date().getTime();

    const rekord: IOfertaRecord = {
        ...stan,
        version: stan.version + 1,
        data: {
            ...stan.data,
            status: Status.USUNIETA
        }
    };

    const ope: IOfertaRecordOpe = {
        ofertaId: stan.ofertaId,  // partition_key
        version: stan.version + 1, // sort_key
        timestamp,
        data: { status: Status.USUNIETA },
        updatedBy: 'developer'
    }

    return { rekord, ope };
}

function zmienionyRekord(
    stan: IOfertaRecord,
    oferta: IOfertaDane,
): { rekord: IOfertaRecord, ope: IOfertaRecordOpe } | null {
    const timestamp = new Date().getTime();

    const delta = wyliczDelta(stan, oferta);

    if (delta === null) {
        return null;
    }

    const rekord: IOfertaRecord = {
        ...stan,
        version: stan.version + 1,
        data: {
            ...stan.data,
            ...delta
        }
    };

    const ope: IOfertaRecordOpe = {
        ofertaId: stan.ofertaId,  // partition_key
        version: stan.version + 1, // sort_key
        timestamp,
        data: delta,
        updatedBy: 'developer'
    }

    return { rekord, ope };
}

function wyliczDelta<T extends IOfertaDane, S extends { data: T }>(stan: S, oferta: T) {
    const result: Partial<T> = {};
    let hasChange = false;

    for (const key in oferta) {
        if (oferta[key] instanceof Object) {
            if (!TypeUtils.deepEqual(oferta[key], stan.data[key])) {
                result[key] = oferta[key];
                hasChange = true;
            }
        } else {
            if (oferta[key] !== stan.data[key]) {
                result[key] = oferta[key];
                hasChange = true;
            }
        }

    }

    return hasChange ? result : null;
}

async function pobierzKartyOfert(oferty: { rekord: IOfertaRecord, ope: IOfertaRecordOpe }[]) {
    const kartyDoPobrania = oferty
        .filter(o => o.rekord.version === 1 && !!o.rekord.data.kartaOfertyUrl)
        .map(o => ({
            url: o.rekord.data.kartaOfertyUrl || '',
            inwestycjaId: o.rekord.inwestycjaId,
            ofertaId: o.rekord.ofertaId
        }));

    for (const karta of kartyDoPobrania) {
        await pobierzKarte(karta);
    }
}

async function pobierzKarte(karta: { url: string, inwestycjaId: string, ofertaId: string }) {
    const file = await Axios({ responseType: 'arraybuffer', url: karta.url });
    const filenameOrExt = readFilenameOrExt(file);
    const filename = filenameOrExt
        && (filenameOrExt.filename || `${karta.ofertaId}.${filenameOrExt.ext}`)
        || 'plik_bez_nazwy';
    await S3Utils.putFile(karta.inwestycjaId, 'plany', filename, file.data);
}

function readFilenameOrExt(file: AxiosResponse<any>): { filename?: string, ext?: string } | null {
    const filenameRegExt = /filename="(.+)"/
        .exec(file.headers['content-disposition']);

    const filename = filenameRegExt && filenameRegExt[1];
    if (filename) {
        return { filename };
    }

    const contentType = file.headers['content-type'];
    const ext = extension(contentType);
    if (ext) {
        return { ext };
    }

    return null;
}
