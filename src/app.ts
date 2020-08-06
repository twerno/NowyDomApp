// tslint:disable-next-line:no-var-requires
require('module-alias/register');
import { buildExcel } from "./core/oferta/excel/OfferExcelBuilder";
import { devEnv, prodEnv } from "./core/oferta/tasks/IEnv";
import Methods from "./Methods";

Methods.runAll(prodEnv)
    .then(() => buildExcel(devEnv))
    .catch(console.error);

// buildExcel(devEnv);

// Methods.runOne(Rodziewiczowny, devEnv);

// new OfertaStanRecomputeService(prodEnv).garvenaFix();
// new OfertaStanRecomputeService(prodEnv).recomputeStan('GarvenaPark');
// new OfertaStanRecomputeService(prodEnv).recomputeMany(inwestycje.map(i => i.inwestycjaId))
// .then(() => buildExcel(prodEnv))
// .catch(console.error);