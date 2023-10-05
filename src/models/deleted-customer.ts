import { Customer } from "@medusajs/medusa";
import { Entity } from "typeorm"

@Entity({ name: 'deleted_customer' })
export class DeletedCustomer extends Customer {

}