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
import Bravo from "./Inpro/InproBravo";
import InproBravo from "./Inpro/InproBravo";
import InproOstoja from "./Inpro/InproOstoja";
import InproStart from "./Inpro/InproStart";
import InproOptima from "./Inpro/InproOptima";
import InproHarmoniaOliwska from "./Inpro/InproHarmoniaOliwska";
import InproDebiut from "./Inpro/InproDebiut";
import InproAzymut from "./Inpro/InproAzymut";

export const inwestycje: IDataProvider<any, any>[] = [
    //<-- Inpro
    InproOstoja,
    InproBravo,
    InproStart,
    InproOptima,
    InproHarmoniaOliwska,
    InproDebiut,
    InproAzymut,
    // Inpro -->,
    Novum,
    GarvenaPark,

    SemekoRemoda,
    SemekoPrimaReda,
    SemekoPortoBianco3,
    SemekoOsiedleMarine,
    SemekoLightTower,
    SemekoHoryzonty,
    SemekoCubic,
    SemekoAquasfera,
    SemekoZielonaLaguna2,
    ApartamentyMarengo,
    LipovaParkIEtap,
    LipovaParkIIEtap,
];
