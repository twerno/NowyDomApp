export default {
    notEmpty,
    deepEqual,
    swallowMerge
}

function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
    return value !== null && value !== undefined;
}

// https://stackoverflow.com/a/38416465
function deepEqual(a: any, b: any) {
    if ((typeof a == 'object' && a != null) &&
        (typeof b == 'object' && b != null)) {
        var count = [0, 0];
        for (var key in a) count[0]++;
        for (var key in b) count[1]++;
        if (count[0] - count[1] != 0) { return false; }
        for (var key in a) {
            if (!(key in b) || !deepEqual(a[key], b[key])) { return false; }
        }
        for (var key in b) {
            if (!(key in a) || !deepEqual(b[key], a[key])) { return false; }
        }
        return true;
    }
    else {
        return a === b;
    }
}

function swallowMerge<T extends object>(source1: T, source2: T): T {
    for (const key in source2) {
        if (source2[key] !== undefined) {
            source1[key] = source2[key];
        }
    }
    return source1;
}