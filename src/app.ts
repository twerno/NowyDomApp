import Methods from "./Methods";
import { buildExcel } from "./core/oferta/excel/OfferExcelBuilder";
import { dynamoDbOfertaStateService } from "./core/oferta/service/IOfertaStateService";
import { devEnv } from "./core/oferta/tasks/IEnv";

Methods.runAll(devEnv);

// Methods.runOne('Remoda', devEnv);

// buildExcel(dynamoDbOfertaStateService);