import { IListElement } from "dataProvider/IOfertaProvider";
import { IRawData } from "../../dataProvider/IOfertaRecord";

export interface INovumListElement extends IListElement {
    budynek: string;
    nrLokalu: string;
    piętro: number | IRawData;
    metraż: number | IRawData;
    liczbaPokoi: number | IRawData;
    odbiór: string;
    status: string;
    cena?: number | IRawData;
    detailsUrl: string;
}

export interface INovumDetails {
    udogodnienia: string;
    stronyŚwiata: string;
    pdfUrl?: string;
}