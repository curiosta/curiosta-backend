import { CustomerService as BaseCustomerService, Customer, FindConfig } from '@medusajs/medusa'

export default class CustomerService extends BaseCustomerService {
  constructor(container) {
    super(container)
  }

  async retrieveDeletedCustomer() {
    const deletedCustomerQuery = `
      SELECT id, email, first_name, last_name, billing_address_id, phone, has_account, metadata, created_at, updated_at, deleted_at FROM customer WHERE deleted_at IS NOT NULL
    `

    const listOfDeletedCustomers = await this.activeManager_.query(deletedCustomerQuery)

    return listOfDeletedCustomers
  }

  async restoreCustomer(email: string) {
    // check if email exists!

    const customerByEmailQuery = `
      SELECT * FROM customer WHERE email = $1
    `

    const customerResult = await this.activeManager_.query(customerByEmailQuery, [email]) as Customer[]

    if (!customerResult.length) {
      console.log(customerResult);
      throw new Error('Customer not found with this email!')
    }

    const restoreCustomerQuery = `
      UPDATE customer SET deleted_at = NULL WHERE email = $1
    `

    await this.activeManager_.query(restoreCustomerQuery, [email])
  }
}