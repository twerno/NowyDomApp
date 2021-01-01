
import { devOfertaOpeService, dynamoDbOfertaOpeService } from "@src/core/aws/DynamoDbOfertaOpeService"
import { dynamoDbOfertaStateService, devOfertaStateService } from "@src/core/aws/DynamoDbOfertaStanService"
import { s3FileService } from "@src/core/aws/S3FileService"
import { devFileService } from "@src/core/oferta/service/IFileService"
import { dummyOfertaOpeService } from "@src/core/oferta/service/IOfertaOpeService"
import { dummyOfertaStateService } from "@src/core/oferta/service/IOfertaStateService"
import { IEnv } from "@src/core/oferta/tasks/IEnv"

// read and write to the aws
export const awsEnv: IEnv = {
    stanService: dynamoDbOfertaStateService,
    opeService: dynamoDbOfertaOpeService,
    fileService: s3FileService,
}

// reads from aws write locally
export const devEnv: IEnv = {
    stanService: devOfertaStateService,
    opeService: devOfertaOpeService,
    fileService: devFileService,
}

// write locally, does not read anything (return empty array or undefined)
export const dummyEnv: IEnv = {
    stanService: dummyOfertaStateService,
    opeService: dummyOfertaOpeService,
    fileService: devFileService,
}
