import { Router } from "express"
import {
  getConfigFile,
} from "medusa-core-utils";
import { ConfigModule } from "@medusajs/medusa";
import cors from 'cors'
import { restrictUser } from "./routes/admin/restrict-user";

export default (rootDirectory: string): Router | Router[] => {
  const { configModule: { projectConfig } } = getConfigFile<ConfigModule>(rootDirectory, "medusa-config")
  const storefrontCorsConfig = {
    origin: [...(projectConfig.admin_cors || "")?.split(','), ...(projectConfig.store_cors || "").split(',')],
    credentials: true,
  }

  const router = Router();
  router.use(cors(storefrontCorsConfig))

  const endpointHandlers = [restrictUser]


  endpointHandlers.forEach(endpointHandle => endpointHandle(router))

  return router
}