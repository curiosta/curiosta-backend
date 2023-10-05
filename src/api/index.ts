import express, { Router } from "express"
import {
  getConfigFile,
} from "medusa-core-utils";
import { ConfigModule } from "@medusajs/medusa";
import cors from 'cors'
import { restrictUser } from "./routes/admin/restrict-user";
import validateUserNotDeactivated from "./middlewares/user-deactivation";
import { deleteCustomer } from "./routes/admin/delete-customer";

export default (rootDirectory: string): Router | Router[] => {
  const { configModule: { projectConfig } } = getConfigFile<ConfigModule>(rootDirectory, "medusa-config")
  const storefrontCorsConfig = {
    origin: [...(projectConfig.admin_cors || "")?.split(','), ...(projectConfig.store_cors || "").split(',')],
    credentials: true,
  }

  const router = Router();
  router.use(cors(storefrontCorsConfig))

  // middlewares
  router.use('/store/auth', express.json(), validateUserNotDeactivated);

  // endpoints
  const endpointHandlers = [restrictUser, deleteCustomer]
  endpointHandlers.forEach(endpointHandle => endpointHandle(router))

  return router
}