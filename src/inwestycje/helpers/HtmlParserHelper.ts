import { HTMLElement } from 'node-html-parser';
import { IRawData, MapWithRawType, isRawData } from '../../core/oferta/model/IOfertaModel';
import TypeUtils, { PropertiesOfTheType as PropertiesByTheType } from '../../utils/TypeUtils';

export interface IElReaderOptions {
    /**
     * default: true 
     * */
    mustExist?: boolean;

    /**
     * default: true 
     * */
    errorWhenEmpty?: boolean;
}

/**
 * mapper otrzymuje string lub śmieci
 * zwraca string jeśli mapowanie się powidło
 * undefined jesli chcemy wymusic z funkcji zewnętrznej zwrot {raw: null} as IRawData
 * null w.p.p.
 */
type THtmlParserMapper<T> = (rawText: string | undefined | null) => T | null | undefined;

/**
 * mapper dla elementów mapy, otrzymuje string lub śmieci
 * zwraca Partial<Type> jeśli mapowanie na "Type" się powidło
 * zwraca string w przypadku uproszczonego mapowania na typ raw
 * null w przypadku niepowodzenia mapowania
 */
type THtmlParserMapMapper<Type> = (rawText: string | undefined | null) => Partial<Type> | string | null;

export class HtmlParserHelper<T extends object> {

    public constructor(protected id: string, protected errors: any[]) {

    }

    public addError(fieldInfo: keyof T | { fieldName?: keyof T, comment: string }, err: string) {
        this.errors.push({ id: this.id, field: fieldInfo, err });
    }

    // oczekiwana niepusta wartosc tekstowa
    // 
    public asRaw<K extends keyof PropertiesByTheType<T, string>>(
        field: K,
        el: HTMLElement | undefined,
        type?: 'text' | { attributeName: string },
    ): Record<K, string> {

        const value = this.readValueOf(el, type || 'text', { fieldInfo: field });

        return this.asRecord<K, string>(field, value || '');
    }

    // oczekiwana niepusta wartosc tekstowa
    // 
    public asString<K extends keyof PropertiesByTheType<T, string | IRawData>>(
        field: K,
        el: HTMLElement | undefined,
        mapper?: THtmlParserMapper<string>,
        type?: 'text' | { attributeName: string },
    ): Record<K, string | IRawData> {

        const options: IElReaderOptions = {
            mustExist: true,
            errorWhenEmpty: true
        }

        const defaultMapper: THtmlParserMapper<string> = v => v || null;

        return this.asCustom(field, el, mapper || defaultMapper, type, options);
    }

    public asStringOptional<K extends keyof PropertiesByTheType<T, string | IRawData | undefined>>(
        field: K,
        el: HTMLElement | undefined,
        mapper?: THtmlParserMapper<string>,
        type?: 'text' | { attributeName: string },
    ): Record<K, string> | {} {

        const defaultMapper: THtmlParserMapper<string> = v => v || null;

        const _options = { mustExist: false };

        return this.asCustomOptional(field, el, mapper || defaultMapper, type, _options);
    }

    // oczekiwana niepusta wartosc całkowita
    // 
    public asInt<K extends keyof PropertiesByTheType<T, number | IRawData>>(
        field: K,
        el: HTMLElement | undefined,
        mapper?: THtmlParserMapper<number>,
        type?: 'text' | { attributeName: string },
    ): Record<K, number | IRawData> {

        const options: IElReaderOptions = {
            errorWhenEmpty: true,
            mustExist: true
        };

        const defaultMapper: THtmlParserMapper<number> = (rawText) => {
            const parsedNumber = Number.parseInt(rawText || '', 10);
            return isNaN(parsedNumber)
                ? null
                : parsedNumber;
        };

        return this.asCustom(field, el, mapper || defaultMapper, type, options);
    }

    // oczekiwana niepusta wartosc zmiennoprzecinkowa
    // 
    public asFloat<K extends keyof PropertiesByTheType<T, number | IRawData>>(
        field: K,
        el: HTMLElement | undefined,
        mapper?: THtmlParserMapper<number>,
        type?: 'text' | { attributeName: string },
    ) {
        const options: IElReaderOptions = {
            errorWhenEmpty: true,
            mustExist: true
        };

        const defaultMapper: THtmlParserMapper<number> = (rawText) => {
            const parsedNumber = Number.parseFloat(rawText || '');
            return isNaN(parsedNumber)
                ? null
                : parsedNumber;
        };

        return this.asCustom(field, el, mapper || defaultMapper, type, options);
    }

    public asFloatOptional<K extends keyof PropertiesByTheType<T, number | IRawData | undefined>>(
        field: K,
        el: HTMLElement | undefined,
        mapper?: THtmlParserMapper<number>,
        type?: 'text' | { attributeName: string },
    ) {
        const options: IElReaderOptions = {
            errorWhenEmpty: true,
            mustExist: true
        };

        const defaultMapper: THtmlParserMapper<number> = (rawText) => {
            const parsedNumber = Number.parseFloat(rawText || '');
            return isNaN(parsedNumber)
                ? null
                : parsedNumber;
        };

        return this.asCustomOptional(field, el, mapper || defaultMapper, type, options);
    }

    public asCustom<Type, K extends keyof PropertiesByTheType<T, Type | IRawData>>(
        field: K,
        el: HTMLElement | undefined,
        mapper: THtmlParserMapper<Type>,
        type?: 'text' | { attributeName: string },
        options?: IElReaderOptions,
    ) {
        const _options = { ...options, fieldInfo: field };
        const val = this.readAndMapValueOf(el, type || 'text', mapper, _options);

        return val !== undefined && val !== null
            ? this.asRecord<K, Type | IRawData>(field, val)
            : this.asRecord<K, Type | IRawData>(field, { raw: null });
    }

    public asCustomOptional<Type, K extends keyof PropertiesByTheType<T, Type | IRawData | undefined>>(
        field: K,
        el: HTMLElement | undefined,
        mapper: THtmlParserMapper<Type>,
        type?: 'text' | { attributeName: string },
        options?: IElReaderOptions,
    ) {
        const _options = { mustExist: false, ...options, fieldInfo: field };
        const val = this.readAndMapValueOf(el, type || 'text', mapper, _options);

        return val === undefined
            ? {}
            : val === null
                ? this.asRecord<K, Type | IRawData | undefined>(field, { raw: null })
                : this.asRecord<K, Type | IRawData | undefined>(field, val);
    }

    public asMap<Type extends object, K extends keyof PropertiesByTheType<T, MapWithRawType<Type>>>(
        field: K,
        elList: Array<HTMLElement | string> | undefined | null,
        mapper: THtmlParserMapMapper<Type>,
        options?: IElReaderOptions,
        type?: 'text' | { attributeName: string },
    ): Record<K, MapWithRawType<Type>> {
        const result: MapWithRawType<Type> = { data: {}, raw: [] };

        if (!elList?.length) {
            if (options?.mustExist || options?.mustExist === undefined) {
                this.addError(field, `Lista elementów jest pusta!`);
            }
        }
        else {
            elList
                .map(el => typeof el === 'string'
                    ? el
                    : this.readValueOf(el, type || 'text', { fieldInfo: field, ...options })
                )
                .filter(TypeUtils.notEmpty)
                .map(rawText => ({ data: mapper(rawText), raw: rawText }))
                .forEach(val => {
                    if (val.data === null || val.data === undefined) {
                        result.raw?.push(val.raw);
                    }
                    else if (typeof val.data === 'string') {
                        result.raw?.push(val.data);
                    }
                    else {
                        result.data = { ...result.data, ...val.data }
                    }
                });
        }

        if (!result.raw?.length) {
            delete result.raw;
        }
        return this.asRecord<K, MapWithRawType<Type>>(field, result);
    }

    public readValueOf(
        el: HTMLElement | undefined,
        type: 'text' | { attributeName: string },
        props: {
            fieldInfo: keyof T | { fieldName?: keyof T, comment: string }
        } & IElReaderOptions,
    ) {
        return type === 'text' || type === undefined
            ? this.readTextOf(el, props)
            : this.readAttributeOf(el, type.attributeName, props);
    }

    public readAndMapValueOf<R>(
        el: HTMLElement | undefined,
        type: 'text' | { attributeName: string },
        mapper: THtmlParserMapper<R>,
        props: {
            fieldInfo: keyof T | { fieldName?: keyof T, comment: string }
        } & IElReaderOptions
    ): R | IRawData | null | undefined {
        const value = this.readValueOf(el, type, props);

        if (value === null || value === undefined) {
            return value;
        }

        try {
            const mappedValue = mapper(value);
            if (mappedValue === null) {
                return { raw: value };
            }
            else if (mappedValue === undefined) {
                return { raw: null };
            }
            return mappedValue;
        } catch (err) {
            this.addError(props.fieldInfo, JSON.stringify(err));
            return { raw: value };
        }
    }

    /**
     * wyciąga wartość tekstową z zadanego elementu (lub atrybutu) i trimuje ją przed zwróceniem
     * undefined - jeśli element nie istnieje
     * null      - jeśli element lub atrybut nie maja zadnej wartosci i flaga errorWhenEmpty
     * string    - w.p.p.
     */
    public readTextOf(
        el: HTMLElement | undefined,
        props: {
            fieldInfo: keyof T | { fieldName?: keyof T, comment: string }
        } & IElReaderOptions
    ): string | null | undefined {
        if (!el) {
            if (props.mustExist || props.mustExist === undefined) {
                this.addError(props.fieldInfo, `Element musi istnieć!`);
            }
            return undefined;
        }

        let rawText: string | undefined = el.structuredText?.trim();

        if (!rawText) {
            if (props.errorWhenEmpty || props.errorWhenEmpty === undefined) {
                this.addError(props.fieldInfo, 'wartośc elementu jest pusta!');
            }
            return null;
        }

        return rawText;
    }

    /**
     * wyciąga wartość tekstową z zadanego elementu (lub atrybutu) i trimuje ją przed zwróceniem
     * undefined - jeśli element nie istnieje. lub atrybut nie istnieje
     * null      - jeśli atrybut jest pusty
     * string    - wartość atrybutu
     */
    public readAttributeOf(
        el: HTMLElement | undefined,
        attributeName: string,
        props: {
            fieldInfo: keyof T | { fieldName?: keyof T, comment: string }
        } & IElReaderOptions
    ): string | null | undefined {
        if (!el) {
            if (props.mustExist || props.mustExist === undefined) {
                this.addError(props.fieldInfo, `Element musi istnieć!`);
            }
            return undefined;
        }

        if (!el.hasAttribute(attributeName)) {
            if (props.mustExist || props.mustExist === undefined) {
                this.addError(props.fieldInfo, `Atrybut "${attributeName}" nie istnieje!`);
            }
            return undefined;
        }

        let rawText: string | undefined = el.getAttribute(attributeName)?.trim();

        if (!rawText) {
            if (props.errorWhenEmpty || props.errorWhenEmpty === undefined) {
                this.addError(props.fieldInfo, 'wartośc atrybutu jest pusta!');
            }
            return null;
        }

        return rawText;
    }

    protected asRecord<K extends keyof PropertiesByTheType<T, TYPE>, TYPE>(
        field: K,
        value: TYPE): Record<K, TYPE> {
        return { [field]: value } as any;
    }

}
