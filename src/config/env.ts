
import { devOfertaOpeService, dynamoDbOfertaOpeService } from "@src/core/aws/DynamoDbOfertaOpeService"
import { dynamoDbOfertaStateService, devOfertaStateService } from "@src/core/aws/DynamoDbOfertaStanService"
import { s3FileService } from "@src/core/aws/S3FileService"
import { devFileService } from "@src/core/oferta/service/IFileService"
import { IEnv } from "@src/core/oferta/tasks/IEnv"

export const awsEnv: IEnv = {
    stanService: dynamoDbOfertaStateService,
    opeService: dynamoDbOfertaOpeService,
    fileService: s3FileService,
}

export const devEnv: IEnv = {
    stanService: devOfertaStateService,
    opeService: devOfertaOpeService,
    fileService: devFileService,
}