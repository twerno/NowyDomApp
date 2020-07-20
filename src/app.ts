// tslint:disable-next-line:no-var-requires
require('module-alias/register');
import Methods from "./Methods";
import { buildExcel } from "./core/oferta/excel/OfferExcelBuilder";
import { dynamoDbOfertaStateService } from "./core/oferta/service/IOfertaStateService";
import { devEnv, prodEnv } from "./core/oferta/tasks/IEnv";
import { OfertaStanRecomputeService } from "./fix/OfertaStanRecomputeService";
import { inwestycje } from "./inwestycje/inwestycje";
import ApartamentyMarengo from "./inwestycje/Multidom/ApartamentyMarengo";

// Methods.runAll(devEnv);

Methods.runAll(prodEnv)
    .then(() => buildExcel(devEnv))
    .catch(console.error);

// buildExcel(devEnv);

// Methods.runOne(ApartamentyMarengo, devEnv);

// new OfertaStanRecomputeService(prodEnv).garvenaFix();
// new OfertaStanRecomputeService(prodEnv).recomputeStan('GarvenaPark');
// new OfertaStanRecomputeService(prodEnv).recomputeMany(inwestycje.map(i => i.inwestycjaId))
// .then(() => buildExcel(prodEnv))
// .catch(console.error);