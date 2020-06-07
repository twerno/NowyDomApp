import { IListElement } from "dataProvider/IOfertaProvider";

export interface INovumListElement extends IListElement {
    budynek: string;
    nrLokalu: string;
    piętro: number;
    metraż: number;
    liczbaPokoi: number;
    odbiór: string;
    status: string;
    cena?: number;
}

export interface INovumDetails {
    udogodnienia: string;
    stronyŚwiata: string;
    pdfUrl?: string;
}