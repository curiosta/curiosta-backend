import { CustomerService, authenticate } from "@medusajs/medusa"
import express, { Router } from "express";

export const deleteCustomer = (router: Router) => {
  router.use('/admin/customers/delete', express.json(), authenticate());

  router.post('/admin/customers/delete', async (req, res) => {
    try {
      const customerService = req.scope.resolve('customerService') as CustomerService;
      const customer = await customerService.retrieveRegisteredByEmail(req.body.email)
      await customerService.delete(customer.id)
      return res.json({ status: 200, message: 'User has been deleted!' })
    } catch (error) {
      return res.status(500).json({ status: 500, message: 'An error occurred!', error: error instanceof Error ? error.message : error })
    }
  })
}