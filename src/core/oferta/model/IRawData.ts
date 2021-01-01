export function isRawData(x: any): x is IRawData {
    return x instanceof Object
        && (x.raw === null || typeof x.raw === 'string');
}

export interface IRawData {
    raw: string | null;
}

export function valueOfRaw<T>(val: T | IRawData | undefined | null): T | string | undefined | null {
    return isRawData(val)
        ? val.raw
        : val;
}