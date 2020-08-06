import { IDataProvider } from "../core/oferta/IOfertaProvider";
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

export const inwestycje: IDataProvider<any, any>[] = [
    //<-- Inpro
    InproOstoja,
    InproBravo,
    InproStart,
    InproOptima,
    InproHarmoniaOliwska,
    InproDebiut,
    InproAzymut,
    // Inpro -->

    //<-- HS
    Novum,
    // HS -->

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
    Rodziewiczowny
    // MaskoInvest -->
];

export const inwestycjeMap: IStringMap<IDataProvider<any, any>> = {};

inwestycje.forEach(i => inwestycjeMap[i.inwestycjaId] = i);