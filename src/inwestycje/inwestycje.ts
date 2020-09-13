import { IDataProvider, IListElement } from "../core/oferta/IOfertaProvider";
import { Novum } from "./Novum/Novum";
import SemekoZielonaLaguna2 from "./Semeko/SemekoZielonaLaguna2";
import SemekoRemoda from "./Semeko/SemekoRemoda";
import SemekoPrimaReda from "./Semeko/SemekoPrimaReda";
import SemekoPortoBianco3 from "./Semeko/SemekoPortoBianco3";
import SemekoOsiedleMarine from "./Semeko/SemekoOsiedleMarine";
import SemekoLightTower from "./Semeko/SemekoLightTower";
import SemekoHoryzonty from "./Semeko/SemekoHoryzonty";
import SemekoCubic from "./Semeko/SemekoCubic";
import SemekoAquasfera from "./Semeko/SemekoAquasfera";
import { GarvenaPark } from "./Garvena/GarvenaPark";
import ApartamentyMarengo from "./Multidom/ApartamentyMarengo";
import LipovaParkIEtap from "./Multidom/LipovaParkIEtap";
import LipovaParkIIEtap from "./Multidom/LipovaParkIIEtap";
import InproBravo from "./Inpro/InproBravo";
import InproOstoja from "./Inpro/InproOstoja";
import InproStart from "./Inpro/InproStart";
import InproOptima from "./Inpro/InproOptima";
import InproHarmoniaOliwska from "./Inpro/InproHarmoniaOliwska";
import InproDebiut from "./Inpro/InproDebiut";
import InproAzymut from "./Inpro/InproAzymut";
import OsiedleBeauforta from "./EuroStyl/OsiedleBeauforta";
import OsiedlePrzyBloniach from "./EuroStyl/OsiedlePrzyBloniach";
import OsiedleLocus from "./EuroStyl/OsiedleLocus";
import NaszeMiejsce from "./EuroStyl/NaszeMiejsce";
import ZielonyPoludnik from "./EuroStyl/ZielonyPoludnik";
import OsiedlePerspektywa from "./EuroStyl/OsiedlePerspektywa";
import OsiedleCis from "./EuroStyl/OsiedleCis";
import Idea from "./EuroStyl/Idea";
import { IStringMap } from "@src/utils/IMap";
import LesnaZatoka from "./MaskoInvest/LesnaZatoka";
import Rodziewiczowny from "./MaskoInvest/Rodziewiczowny";
import OsiedleKosciuszkiV from "./OrlexInvest/OsiedleKosciuszkiV";
import OsiedleNoweJanowo from "./OrlexInvest/OsiedleNoweJanowo";
import Osiedle3Towers from "./OrlexInvest/Osiedle3Towers";
import OsiedleNoweGoscicino from "./OrlexInvest/OsiedleNoweGoscicino";
import OsiedlePolna from "./OrlexInvest/OsiedlePolna";
import PrzystanRumia from "./MatBud/PrzystanRumia";
import LesneTarasy from "./MatBud/LesneTarasy";
import OsiedleKocanki from "./Loker/OsiedleKocanki";
import VelaPark from "./Loker/VelaPark";
import OsiedlePrimula from "./Loker/OsiedlePrimula";
import ZielonaDolina from "./Loker/ZielonaDolina";
import Formeli17 from "./NorthStarDevelopment/Formeli17";
import Sikorskiego36 from "./NorthStarDevelopment/Sikorskiego36";
import OsiedleZacisze from "./OsiedleZacisze/OsiedleZacisze";
import HsDom_Novum from "./HSDom/HSDom_Novum";

export const inwestycje: IDataProvider<any>[] = [
    //<-- Inpro
    InproOstoja,
    InproBravo,
    InproStart,
    InproOptima,
    InproHarmoniaOliwska,
    InproDebiut,
    InproAzymut,
    // Inpro -->

    //<-- HSDom
    HsDom_Novum,
    // HSDom -->

    //<-- DS Development
    GarvenaPark,
    // DS Development -->

    //<-- Semeko
    SemekoRemoda,
    SemekoPrimaReda,
    SemekoPortoBianco3,
    SemekoOsiedleMarine,
    SemekoLightTower,
    SemekoHoryzonty,
    SemekoCubic,
    SemekoAquasfera,
    SemekoZielonaLaguna2,
    // Semeko -->

    //<-- MultiDom
    ApartamentyMarengo,
    LipovaParkIEtap,
    LipovaParkIIEtap,
    // MultiDom -->

    //<-- EuroStyl
    OsiedleBeauforta,
    OsiedlePrzyBloniach,
    OsiedleLocus,
    NaszeMiejsce,
    ZielonyPoludnik,
    OsiedlePerspektywa,
    OsiedleCis,
    Idea,

    // EuroStyl -->

    //<-- MaskoInvest
    LesnaZatoka,
    Rodziewiczowny,
    // MaskoInvest -->

    //<-- OrlexInvest
    Osiedle3Towers,
    OsiedleKosciuszkiV,
    OsiedleNoweGoscicino,
    OsiedleNoweJanowo,
    OsiedlePolna,
    // OrlexInvest -->

    //<-- MatBud
    PrzystanRumia,
    LesneTarasy,
    // MatBud -->

    //<-- Loker
    OsiedleKocanki,
    VelaPark,
    OsiedlePrimula,
    ZielonaDolina,
    // Loker -->

    //<-- North Star Development
    Formeli17,
    Sikorskiego36,
    // North Star Development -->

    // <-- Osiedle Zacisze Sp. z.o.o.
    OsiedleZacisze
    // Osiedle Zacisze Sp. z.o.o. -->

];

export const inwestycjeMap: IStringMap<IDataProvider> = {};

inwestycje.forEach(i => inwestycjeMap[i.inwestycjaId] = i);