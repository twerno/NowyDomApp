import ProvideOfferTask1 from './dataProvider/ProvideOfferTask1';
import { NovumDataProvider } from './inwestycje/Novum/NovumDataProvider';
import { OstojaDataProvider } from './inwestycje/Ostoja/OstojaDataProvider';
import SemekoAquasfera from './inwestycje/Semeko/SemekoAquasfera';
import { AsyncTaskRunner } from './utils/asyncTask/AsyncTaskRunner';
import SemekoCubic from './inwestycje/Semeko/SemekoCubic';
import SemekoHoryzonty from './inwestycje/Semeko/SemekoHoryzonty';
import SemekoLightTower from './inwestycje/Semeko/SemekoLightTower';
import SemekoOsiedleMarine from './inwestycje/Semeko/SemekoOsiedleMarine';
import SemekoPortoBianco3 from './inwestycje/Semeko/SemekoPortoBianco3';
import SemekoPrimaReda from './inwestycje/Semeko/SemekoPrimaReda';
import SemekoZielonaLaguna2 from './inwestycje/Semeko/SemekoZielonaLaguna2';

console.log('start');

const errors: any[] = [];

AsyncTaskRunner(
    [
        new ProvideOfferTask1(OstojaDataProvider, 1),
        new ProvideOfferTask1(NovumDataProvider, 2),
        new ProvideOfferTask1(SemekoAquasfera, 3),
        new ProvideOfferTask1(SemekoCubic, 4),
        new ProvideOfferTask1(SemekoHoryzonty, 5),
        new ProvideOfferTask1(SemekoLightTower, 6),
        new ProvideOfferTask1(SemekoOsiedleMarine, 7),
        new ProvideOfferTask1(SemekoPortoBianco3, 8),
        new ProvideOfferTask1(SemekoPrimaReda, 9),
        new ProvideOfferTask1(SemekoZielonaLaguna2, 10),
    ],
    {
        concurency: 10,
    }, errors)
    .catch(err => console.error(err, errors))
    .then(v => console.log('done', JSON.stringify(errors)));
