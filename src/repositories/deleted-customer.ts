import {
  dataSource,
} from "@medusajs/medusa/dist/loaders/database"
import { DeletedCustomer } from "../models/deleted-customer"

export const DeletedCustomerRepository = dataSource.getRepository(DeletedCustomer)
export default DeletedCustomerRepository