import { Router } from "express"
import {
  getConfigFile,
} from "medusa-core-utils";
import { ConfigModule } from "@medusajs/medusa";
import cors from 'cors'
import { deleteCustomer } from "./routes/admin/delete-customer";
import { listDeletedCustomers } from "./routes/admin/list-deleted";
import { restoreCustomer } from "./routes/admin/restore-customer";

export default (rootDirectory: string): Router | Router[] => {
  const { configModule: { projectConfig } } = getConfigFile<ConfigModule>(rootDirectory, "medusa-config")
  const storefrontCorsConfig = {
    origin: [...(projectConfig.admin_cors || "")?.split(','), ...(projectConfig.store_cors || "").split(',')],
    credentials: true,
  }

  const router = Router();
  router.use(cors(storefrontCorsConfig))

  // endpoints
  const endpointHandlers = [deleteCustomer, listDeletedCustomers, restoreCustomer]
  endpointHandlers.forEach(endpointHandle => endpointHandle(router))

  return router
}