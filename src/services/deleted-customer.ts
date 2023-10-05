import { Customer, CustomerService, TransactionBaseService } from '@medusajs/medusa'
import { DeletedCustomer } from '../models/deleted-customer';
import { Repository } from 'typeorm';
import DeletedCustomerRepository from '../repositories/deleted-customer';

export default class DeletedCustomerService extends TransactionBaseService {
  protected readonly deletedCustomerRepository: Repository<DeletedCustomer>;
  protected readonly customerService: CustomerService;

  constructor(container) {
    // @ts-ignore
    super(container);
    this.customerService = container.customerService;
    this.deletedCustomerRepository = this.activeManager_.withRepository(DeletedCustomerRepository)
  }

  async deleteCustomer(email: string) {
    try {
      // Manually moving customer field to deleted_customer since medusa does not provides password hash in API.
      const insertQuery = `
        INSERT INTO deleted_customer (id, email, first_name, last_name, billing_address_id, password_hash, phone, has_account, created_at, updated_at, metadata)
        SELECT id, email, first_name, last_name, billing_address_id, password_hash, phone, has_account, created_at, updated_at, metadata::jsonb
        FROM customer
        WHERE email = $1
        ON CONFLICT (email, id) DO NOTHING;
      `;
      await this.activeManager_.query(insertQuery, [email]);


      // delete customer from customer table

      const customer = await this.customerService.retrieveRegisteredByEmail(email);

      await this.customerService.delete(customer.id) as Customer

      // update time of delete in deleted_customer

      const updateDeleteTimestampQuery = `
        UPDATE deleted_customer
        SET deleted_at = now()
        WHERE email = $1;
      `;
      const result = await this.activeManager_.query(updateDeleteTimestampQuery, [email])

      return result;
    } catch (error) {
      // Handle any errors that may occur during the query.
      console.error(error);
      throw error;
    }
  }

}