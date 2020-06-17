import { HTMLElement, parse } from 'node-html-parser';
import { IRawData, MapWithRawType, isRawData } from 'dataProvider/IOfertaRecord';
import TypeUtils from 'utils/TypeUtils';

export interface IElReaderOptions {
    notEmpty: boolean;
}

export interface IParserOptions<T> {
    fromAttribute?: string;
    mapper?: (rawText: string | null) => T | null
}

const floatRegExpr = /([\d,.]+)/;

export class HtmlParserHelper<T extends object> {

    public constructor(protected id: string, protected errors: any[]) {

    }

    // oczekiwana niepusta wartosc tekstowa
    // 
    public asString<K extends keyof FancyProperties<T, string>>(
        field: K,
        el: HTMLElement | undefined,
    ) {

        const text = this.readTextOf(field, el, { notEmpty: true });

        return this.asRecord<K, string>(field, text || '');
    }

    public asStringOptional<K extends keyof FancyProperties<T, string | null>>(
        field: K,
        el: HTMLElement | undefined) {

        const text = this.readTextOf(field, el, { notEmpty: false });

        return this.asRecord<K, string | null>(field, text);
    }

    // oczekiwana niepusta wartosc całkowita
    // 
    public asInt<K extends keyof FancyProperties<T, number | IRawData>>(
        field: K,
        el: HTMLElement | undefined) {

        return this.asCustom<number, K>(field, el, {
            mapper: rawText => {
                const parsedNumber = Number.parseInt(rawText || '', 10);
                return isNaN(parsedNumber)
                    ? null
                    : parsedNumber;
            }
        });
    }

    // oczekiwana niepusta wartosc zmiennoprzecinkowa
    // 
    public asFloat<K extends keyof FancyProperties<T, number | IRawData>>(
        field: K,
        el: HTMLElement | undefined) {

        return this.asCustom<number, K>(field, el, {
            mapper: rawText => {
                const exprResult = floatRegExpr.exec(rawText || '');
                if (exprResult === null || exprResult[1] === null) {
                    return null;
                }
                const parsedNumber = Number.parseFloat(exprResult[1].replace(/,/g, '.'));
                return isNaN(parsedNumber)
                    ? null
                    : parsedNumber;
            }
        });
    }

    public asCustom<Type, K extends keyof FancyProperties<T, Type | IRawData>>(
        field: K,
        el: HTMLElement | undefined,
        options: SomeRequired<IParserOptions<Type>, 'mapper'>,
    ) {
        const text = this.readTextOf(field, el, { notEmpty: false, ...options });

        try {
            const result = text ? options.mapper(text) : null;
            return this.asRecord<K, Type | IRawData>(field, result || { raw: text });

        } catch (e) {
            this.errors.push({ id: this.id, field, err: JSON.stringify(e) });
            return this.asRecord<K, Type | IRawData>(field, { raw: text });
        }
    }

    // public asList<Type, K extends keyof FancyProperties<T, Array<Type | IRawData>>>(
    //     field: K,
    //     el: HTMLElement[] | undefined,
    //     mapper: (rawText: string) => Type | IRawData
    // ) {

    //     const text = this.readTextOf(field, el, { notNullOrUndefined: false });
    // }

    public asMap<Type extends object, K extends keyof FancyProperties<T, MapWithRawType<Type>>>(
        field: K,
        elList: HTMLElement[] | undefined,
        mapper: (rawText: string) => { data: Partial<Type> } | IRawData | null
    ) {
        const result: MapWithRawType<Type> = { data: {} };

        if (!elList || elList.length === 0) {
            this.errors.push({ id: this.id, field, err: `lista jest pusta!` });
        }
        else {
            elList
                .map(el => this.readTextOf(field, el, { notEmpty: true }))
                .filter(TypeUtils.notEmpty)
                .map(mapper)
                .forEach(r => {
                    if (isRawData(r)) {
                        result.raw = [...result.raw || [], r.raw];
                    }
                    else if (r !== null) {
                        result.data = { ...result.data, ...r.data }
                    }
                    else {
                        this.errors.push({ id: this.id, field, err: `Maper nie rozpoznał wartości: ${r}` });
                    }
                });
        }

        return this.asRecord<K, MapWithRawType<Type>>(field, result);
    }

    protected readTextOf<Type>(
        field: keyof T,
        el: HTMLElement | undefined,
        options: IElReaderOptions & IParserOptions<Type>
    ): string | null {
        if (!el) {
            this.errors.push({ id: this.id, field, err: `element jest "${JSON.stringify(el)}"!` });
            return null;
        }

        const rawText: string | undefined = options.fromAttribute
            ? el.attributes[options.fromAttribute]?.trim()
            : el.text?.trim();

        if (options.notEmpty && !rawText) {
            this.errors.push({ id: this.id, field, err: `pole jest puste!` });
            return null;
        }

        return rawText;
    }

    protected asRecord<K extends keyof FancyProperties<T, TYPE>, TYPE>(
        field: K,
        value: TYPE): Record<K, TYPE> {
        return { [field]: value } as any;
    }

}

// https://stackoverflow.com/a/49797062
type FancyProperties<T, TYPE> = Pick<T, {
    [K in keyof T]: T[K] extends TYPE ? K : never
}[keyof T]>;

type SomeRequired<T, K extends keyof T> = T & Required<Pick<T, K>>

