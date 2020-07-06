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
import { Ostoja } from "./Ostoja/Ostoja";
import { GarvenaPark } from "./Garvena/GarvenaPark";
import ApartamentyMarengo from "./Multidom/ApartamentyMarengo";
import LipovaParkIEtap from "./Multidom/LipovaParkIEtap";
import LipovaParkIIEtap from "./Multidom/LipovaParkIIEtap";

export const inwestycje: IDataProvider<any, any>[] = [
    Ostoja,
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
