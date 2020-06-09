import { IOfertaDane, IOfertaOpe, IOfertaRecord, Status } from "../db/IOfertaRecord";
import { ofertyRepo } from "../db/OfertaRecordRepo";
import { IStringMap } from "../utils/IMap";
import TypeUtils from "../utils/TypeUtils";
import WebDownloader from "../utils/WebDownloader";
import { IListElement, IDataProvider } from "./IOfertaProvider";

export async function run<T extends IListElement, D>(dataProvider: IDataProvider<T, D>) {
    const errors: any[] = [];

    const offersWithDetails = await provideOfferWithDetails(dataProvider, errors);
    const oferty = buildOffer(offersWithDetails, dataProvider, []);

    // TODO - pdf

    const ofertyStan = await pobierzOfertyZInwestycji(dataProvider);
    const ofertaZmiana = wyliczOfertyZmiana(ofertyStan, oferty, dataProvider);
    await zapiszOfertyDoBazy(ofertaZmiana);

    return { errors, ofertyStan, ofertaZmiana };
}

// =======================================
// private
// =======================================

async function provideOfferWithDetails<T extends IListElement, D>(
    dataProvider: IDataProvider<T, D>,
    errors: any[]
) {
    // przygotowanie url zawierających listę ofert
    const urls = await dataProvider.listUrlProvider();

    const listHtml = await downloadLists(urls, errors);

    // zachomikuj html-e na s3
    // TODO - html + url + data

    const offerList = parseOfferList(listHtml, dataProvider, errors);

    const detailsHtml = await downloadDetails(offerList, dataProvider, errors);

    // zachomikuj html-e na s3
    // TODO - html + url + data

    const offersWithDetails = parseDetails(detailsHtml, dataProvider, errors);

    // zachomikuj błędy na s3
    // TODO - errors + data

    return offersWithDetails;
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
    const detailsMerger = (offer: T, htmlList?: string[]) =>
        htmlList === undefined || htmlList.length === 0
            ? Promise.resolve({ offer })
            : Promise.all(
                htmlList.map(html =>
                    dataProvider.offerDetailsHtmlParser(html)
                        .catch(err => {
                            errors.push(JSON.stringify({ method: 'parseDetails', offer, err, html }));
                            return null;
                        })
                )
            ).then(result => result
                .filter(TypeUtils.notEmpty)
                .reduce<D>((prev, curr) => dataProvider.offerDetailsMerger(prev, curr), {} as any)
            ).then(details => ({ offer, details }));

    return Promise.all(
        lista
            .filter(TypeUtils.notEmpty)
            .map(({ offer, htmlList }) => detailsMerger(offer, htmlList))
    );
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
    return ofertyRepo.queryByPartitionKey(dataProvider.inwestycjaId);
}

async function zapiszOfertyDoBazy(oferty: IOfertaRecord[]) {
    return Promise.all(oferty.map(o => ofertyRepo.put(o)));
}

function wyliczOfertyZmiana<T extends IListElement, D>(
    stan: IOfertaRecord[],
    przetworzoneOferty: { id: string, dane: IOfertaDane }[],
    dataProvider: IDataProvider<T, D>
) {
    const stanMap: IStringMap<IOfertaRecord> = {};
    const ofertyMap: IStringMap<IOfertaDane> = {};

    stan.forEach(e => stanMap[e.id] = e);
    przetworzoneOferty.forEach(e => ofertyMap[e.id] = e.dane);

    const keys = new Set([...Object.keys(stanMap), ...Object.keys(ofertyMap)]);

    const result: IOfertaRecord[] = [];
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
): IOfertaRecord | null {

    if (stan === null && oferta === null) {
        return null;
    }

    // nowy rekord
    if (stan === null && oferta !== null) {
        return nowyRekord(id, oferta, dataProvider);
    }

    // usunięty
    if (stan !== null && oferta === null) {
        const operation: IOfertaOpe = {
            data: { status: Status.USUNIETA },
            updatedBy: 'developer',
            updatedAt: new Date().toJSON(),
        };
        return { ...stan, updates: [...stan.updates, operation] };
    }

    // wylicz zmiane
    if (stan !== null && oferta !== null) {
        const delta = wyliczDelta(stan, oferta);
        if (delta !== null) {
            const operation: IOfertaOpe = {
                data: delta,
                updatedBy: 'developer',
                updatedAt: new Date().toJSON(),
            };
            return { ...stan, updates: [...stan.updates, operation], data: oferta };
        }

    }

    // nie było zmiany
    return null;
}

function nowyRekord<T extends IListElement, D>(
    id: string,
    data: IOfertaDane,
    dataProvider: IDataProvider<T, D>
): IOfertaRecord {
    const createdAt = new Date().toJSON();
    const rekord: IOfertaRecord = {
        id,
        createdAt,
        data,
        developerId: dataProvider.developerId,
        inwestycjaId: dataProvider.inwestycjaId,
        updates: [{ data, updatedAt: createdAt, updatedBy: 'developer' }]
    };

    return rekord;
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
