import { IStringMap } from "@src/utils/IMap";
import { IDataProvider } from "../core/oferta/IOfertaProvider";
import Archipelag from "./Domapart/Archipelag";
import Idea from "./EuroStyl/Idea";
import NaszeMiejsce from "./EuroStyl/NaszeMiejsce";
import OsiedleBeauforta from "./EuroStyl/OsiedleBeauforta";
import OsiedleCis from "./EuroStyl/OsiedleCis";
import OsiedleLocus from "./EuroStyl/OsiedleLocus";
import OsiedlePerspektywa from "./EuroStyl/OsiedlePerspektywa";
import OsiedlePrzyBloniach from "./EuroStyl/OsiedlePrzyBloniach";
import ZielonyPoludnik from "./EuroStyl/ZielonyPoludnik";
import { GarvenaPark } from "./Garvena/GarvenaPark";
import HSDom_Bratkowa from "./HSDom/HSDom_Bratkowa";
import HSDom_Novum from "./HSDom/HSDom_Novum";
import InproAzymut from "./Inpro/InproAzymut";
import InproBravo from "./Inpro/InproBravo";
import InproDebiut from "./Inpro/InproDebiut";
import InproHarmoniaOliwska from "./Inpro/InproHarmoniaOliwska";
import InproOptima from "./Inpro/InproOptima";
import InproOstoja from "./Inpro/InproOstoja";
import InproStart from "./Inpro/InproStart";
import OsiedleKocanki from "./Loker/OsiedleKocanki";
import OsiedlePrimula from "./Loker/OsiedlePrimula";
import VelaPark from "./Loker/VelaPark";
import ZielonaDolina from "./Loker/ZielonaDolina";
import LesnaZatoka from "./MaskoInvest/LesnaZatoka";
import Rodziewiczowny from "./MaskoInvest/Rodziewiczowny";
import LesneTarasy from "./MatBud/LesneTarasy";
import PrzystanRumia from "./MatBud/PrzystanRumia";
import ApartamentyMarengo from "./Multidom/ApartamentyMarengo";
import LipovaParkIEtap from "./Multidom/LipovaParkIEtap";
import LipovaParkIIEtap from "./Multidom/LipovaParkIIEtap";
import Formeli17 from "./NorthStarDevelopment/Formeli17";
import Sikorskiego36 from "./NorthStarDevelopment/Sikorskiego36";
import Osiedle3Towers from "./OrlexInvest/Osiedle3Towers";
import OsiedleKosciuszkiV from "./OrlexInvest/OsiedleKosciuszkiV";
import OsiedleNoweGoscicino from "./OrlexInvest/OsiedleNoweGoscicino";
import OsiedleNoweJanowo from "./OrlexInvest/OsiedleNoweJanowo";
import OsiedlePolna from "./OrlexInvest/OsiedlePolna";
import OsiedleZacisze from "./OsiedleZacisze/OsiedleZacisze";
import SemekoAquasfera from "./Semeko/SemekoAquasfera";
import SemekoCubic from "./Semeko/SemekoCubic";
import SemekoHoryzonty from "./Semeko/SemekoHoryzonty";
import SemekoLightTower from "./Semeko/SemekoLightTower";
import SemekoOsiedleMarine from "./Semeko/SemekoOsiedleMarine";
import SemekoPortoBianco3 from "./Semeko/SemekoPortoBianco3";
import SemekoPrimaReda from "./Semeko/SemekoPrimaReda";
import SemekoRemoda from "./Semeko/SemekoRemoda";
import SemekoZielonaLaguna2 from "./Semeko/SemekoZielonaLaguna2";

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
    HSDom_Novum,
    HSDom_Bratkowa,
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
    OsiedleZacisze,
    // Osiedle Zacisze Sp. z.o.o. -->

    // <-- Domapart
    Archipelag,
    // Domapart -->

];

export const inwestycjeMap: IStringMap<IDataProvider> = {};

inwestycje.forEach(i => inwestycjeMap[i.inwestycjaId] = i);