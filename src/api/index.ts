import { Router } from "express"
import {
  getConfigFile,
} from "medusa-core-utils";
import { ConfigModule } from "@medusajs/medusa";
import cors from 'cors'
import { deleteCustomer } from "./routes/admin/delete-customer";
import { listDeletedCustomers } from "./routes/admin/list-deleted";
import { restoreCustomer } from "./routes/admin/restore-customer";
import { uploadFile } from "./routes/global/uploads";
import { S3Client } from "@aws-sdk/client-s3";
import { SheetsRouter } from "./routes/admin/sheets";

export default (rootDirectory: string): Router | Router[] => {
  const { configModule: { projectConfig } } = getConfigFile<ConfigModule>(rootDirectory, "medusa-config")

  // aws s3 initialization
  const s3Client = new S3Client({ region: process.env.AWS_REGION })

  const storefrontCorsConfig = {
    origin: [...(projectConfig.admin_cors || "")?.split(','), ...(projectConfig.store_cors || "").split(',')],
    credentials: true,
  }

  const router = Router();
  router.use(cors(storefrontCorsConfig))

  // endpoints
  const endpointHandlers = [
    deleteCustomer,
    listDeletedCustomers,
    restoreCustomer,
    uploadFile,
    SheetsRouter
  ]
  endpointHandlers.forEach(endpointHandle => endpointHandle(router, { s3Client }))

  return router
}