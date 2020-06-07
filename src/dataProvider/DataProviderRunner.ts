import { IOfertaDane, IOfertaOpe, IOfertaRecord, Status } from "../db/IOfertaRecord";
import { ofertyRepo } from "../db/OfertaRecordRepo";
import { IStringMap } from "../utils/IMap";
import TypeUtils from "../utils/TypeUtils";
import WebDownloader from "../utils/WebDownloader";
import { IListElement, IDataProvider } from "./IOfertaProvider";

export async function run<T extends IListElement, D>(dataProvider: IDataProvider<T, D>) {
    const offersWithDetails = await provideOfferWithDetails(dataProvider);
    const oferty = buildOffer(offersWithDetails, dataProvider, []);

    // TODO - pdf

    const ofertyStan = await pobierzOfertyZInwestycji(dataProvider);
    const ofertaZmiana = wyliczOfertyZmiana(ofertyStan, oferty, dataProvider);
    await zapiszOfertyDoBazy(ofertaZmiana);
}

// =======================================
// private
// =======================================

async function provideOfferWithDetails<T extends IListElement, D>(dataProvider: IDataProvider<T, D>) {
    const errors: any[] = [];

    // przygotowanie url zawierających listę ofert
    const urls = await dataProvider.listUrlProvider();

    const listHtml = await downloadLists(urls, errors);

    // zachomikuj html-e na s3
    // TODO - html + url + data

    const offerList = parseOfferList(listHtml, dataProvider.listMapper, errors);
    offerList.forEach(o => o.inwestycjaId = dataProvider.nazwa);

    const detailsHtml = await downloadOfferDetails(offerList, errors);

    // zachomikuj html-e na s3
    // TODO - html + url + data

    const offerWithDetails = parseDetails(detailsHtml, dataProvider.detailsMapper, errors);

    // zachomikuj błędy na s3
    // TODO - errors + data

    return offerWithDetails;
}

// pobranie stron zawierających listy ofert z przygotowanych url-i
async function downloadLists(urls: string[], errors: any[]) {
    return Promise.all(
        urls.map(url =>
            WebDownloader.download(url)
                .then(html => ({ url, html }))
                .catch(err => {
                    errors.push(({ err, url }));
                    return null;
                })
        )
    );
}

// przetworzenie pobranych stron i wyciągnięcie z nich listy ofert
function parseOfferList<T extends IListElement>(
    lista: Array<{ url: string, html: string } | null>,
    mapper: (html: string) => T[],
    errors: any[]
) {
    return lista
        .filter(TypeUtils.notEmpty)
        .map(({ html }) => mapper(html))
        .reduce((prev, curr) => [...prev, ...curr], []);
}

// pobranie detali oferty
async function downloadOfferDetails<T extends IListElement>(offerList: T[], errors: any[]) {
    return Promise.all(
        offerList
            .filter(offer => !!offer && !!offer.detailsUrl)
            .map(offer =>
                WebDownloader.download(offer.detailsUrl)
                    .then(html => ({ html, offer }))
                    .catch(err => {
                        errors.push(({ err, detailsUrl: offer.detailsUrl }));
                        return null;
                    })
            )
    );
}

// przetworzenie detali
function parseDetails<T extends IListElement, D = any>(
    lista: Array<{ offer: T, html: string } | null>,
    mapper: (html: string, offer: T) => Promise<D>,
    errors: any[]
) {
    return Promise.all(
        lista
            .filter(TypeUtils.notEmpty)
            .map(({ html, offer }) =>
                mapper(html, offer)
                    .then(details => ({ offer, details }))
                    .catch(err => {
                        errors.push(({ offer, err }));
                        return null;
                    })
            )
    );
}

// przepisanie lokalnych danych na obiekt
function buildOffer<T extends IListElement, D = any>(
    offersWithDetails: ({ offer: T, details: D } | null)[],
    dataProvider: IDataProvider<T, D>,
    errors: any[]
) {
    return offersWithDetails
        .filter(TypeUtils.notEmpty)
        .map(({ offer, details }) => ({
            offer,
            details,
            planUrl: dataProvider.planUrlProvider(offer, details)
        }))
        .map(({ offer, details, planUrl }) => dataProvider.ofertaBuilder(offer, details, planUrl));
}

// pobranie ofert z bazy
async function pobierzOfertyZInwestycji<T extends IListElement, D>(dataProvider: IDataProvider<T, D>) {
    return ofertyRepo.queryByPartitionKey(dataProvider.nazwa);
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
        developerId: dataProvider.developer,
        inwestycjaId: dataProvider.nazwa,
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
