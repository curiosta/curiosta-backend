import { authenticate } from "@medusajs/medusa"
import { Router } from "express";
import CustomerService from "../../services/customer";

export const listDeletedCustomers = (router: Router) => {
  router.use('/admin/customers/list-deleted', authenticate());

  router.get('/admin/customers/list-deleted', async (req, res) => {
    const customerService = req.scope.resolve('customerService') as CustomerService
    try {
      const result = await customerService.retrieveDeletedCustomer()
      return res.json(result)
    } catch (error) {
      return res.status(500).json({ status: 500, message: 'An error occurred!', error: error instanceof Error ? error.message : error })
    }
  })
}