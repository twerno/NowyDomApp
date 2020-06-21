import { HTMLElement } from 'node-html-parser';
import { IRawData, MapWithRawType, isRawData } from '../dataProvider/IOfertaRecord';
import TypeUtils, { FancyProperties, SomeRequired } from './TypeUtils';
import parseUtils from './parseUtils';

export interface IElReaderOptions {
    // default: true
    notNull?: boolean;

    // default: true
    notEmpty: boolean;
}

export interface IParserOptions<T> {
    fromAttribute?: string;
    mapper?: (rawText: string) => T | null
}

export class HtmlParserHelper<T extends object> {

    public constructor(protected id: string, protected errors: any[]) {

    }

    public addError(field: keyof T | { fieldName?: keyof T, comment: string }, err: string) {
        this.errors.push({ id: this.id, field, err });
    }

    // oczekiwana niepusta wartosc tekstowa
    // 
    public asString<K extends keyof FancyProperties<T, string>>(
        field: K,
        el: HTMLElement | undefined,
    ) {

        const text = this.readTextOf(el, field, { notEmpty: true });

        return this.asRecord<K, string>(field, text || '');
    }

    public asStringOptional<K extends keyof FancyProperties<T, string | null>>(
        field: K,
        el: HTMLElement | undefined) {

        const text = this.readTextOf(el, field, { notEmpty: false });

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
        el: HTMLElement | undefined,
        customRegExpr?: RegExp
    ) {
        return this.asCustom<number, K>(field, el, {
            mapper: (rawText) => parseUtils.floatParser(rawText, customRegExpr)
        });
    }

    public asCustomWithDefault<Type, K extends keyof FancyProperties<T, Type>>(
        field: K,
        el: HTMLElement | undefined,
        options: SomeRequired<IParserOptions<Type>, 'mapper'> & { defaultValue: Type },
    ) {
        const { data } = this.asCustomInternal<Type, K>(field, el, { notEmpty: true, ...options });

        return this.asRecord<K, Type>(field, data || options.defaultValue);
    }

    public asCustom<Type, K extends keyof FancyProperties<T, Type | IRawData>>(
        field: K,
        el: HTMLElement | undefined,
        options: SomeRequired<IParserOptions<Type>, 'mapper'>,
    ) {
        const { data, rawText } = this.asCustomInternal<Type | IRawData, K>(field, el, { notEmpty: true, ...options });

        return !!data
            ? this.asRecord<K, Type | IRawData>(field, data)
            : this.asRecord<K, Type | IRawData>(field, { raw: rawText });
    }

    public asCustomOptional<Type, K extends keyof FancyProperties<T, Type | null>>(
        field: K,
        el: HTMLElement | undefined,
        options: SomeRequired<IParserOptions<Type>, 'mapper'>,
    ) {
        const { data } = this.asCustomInternal<Type | null, K>(field, el, { notEmpty: true, ...options });

        return !!data
            ? this.asRecord<K, Type | null>(field, data)
            : this.asRecord<K, Type | null>(field, null);
    }

    protected asCustomInternal<Type, K extends keyof FancyProperties<T, Type>>(
        field: K,
        el: HTMLElement | undefined,
        options: IElReaderOptions & SomeRequired<IParserOptions<Type>, 'mapper'>,
    ) {
        const rawText = this.readTextOf(el, field, options);

        try {
            const data = rawText ? options.mapper(rawText) : null;
            return { data, rawText };
        } catch (e) {
            this.addError(field, JSON.stringify(e));
            return { rawText };
        }
    }

    public asMap<Type extends object, K extends keyof FancyProperties<T, MapWithRawType<Type>>>(
        field: K,
        elList: HTMLElement[] | undefined,
        mapper: (rawText: string) => { data: Partial<Type> } | IRawData | null,
        options?: IElReaderOptions
    ) {
        const result: MapWithRawType<Type> = { data: {} };

        if (!elList || elList.length === 0) {
            if (options?.notEmpty !== false) {
                this.addError(field, 'lista jest pusta!');
            }
        }
        else {
            elList
                .map(el => this.readTextOf(el, field, { notEmpty: true, ...options }))
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
                        this.addError(field, `Maper nie rozpoznał wartości: ${r}`);
                    }
                });
        }

        return this.asRecord<K, MapWithRawType<Type>>(field, result);
    }

    public readTextOf<Type>(
        el: HTMLElement | undefined,
        field: keyof T | { fieldName?: keyof T, comment: string },
        options: IElReaderOptions & IParserOptions<Type>
    ): string | null {
        if (!el) {
            if (options.notNull !== false) {
                this.addError(field, `element jest "${JSON.stringify(el)}"!`);
            }
            return null;
        }

        const rawText: string | undefined = options.fromAttribute
            ? el.attributes[options.fromAttribute]?.trim()
            : el.text?.trim();

        if (options.notNull !== false && !rawText) {
            this.addError(field, 'pole jest puste!');
            return null;
        }

        return rawText || null;
    }

    protected asRecord<K extends keyof FancyProperties<T, TYPE>, TYPE>(
        field: K,
        value: TYPE): Record<K, TYPE> {
        return { [field]: value } as any;
    }

}
