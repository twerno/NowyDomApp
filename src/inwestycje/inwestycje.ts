import { IDataProvider } from "../core/oferta/IOfertaProvider";

export const inwestycje: IDataProvider<any, any>[] = [];

export function registerInwestycja(inwestycja: IDataProvider<any, any>) {
    inwestycje.push(inwestycja);
}