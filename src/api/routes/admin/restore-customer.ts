import { authenticate } from "@medusajs/medusa"
import express, { Router } from "express";
import CustomerService from "../../../services/customer";

export const restoreCustomer = (router: Router) => {
  router.use('/admin/customers/restore', express.json(), authenticate());

  router.post('/admin/customers/restore', async (req, res) => {

    if (!req.body.email) return res.status(422).json({ status: 422, message: 'Insufficient payload!' })

    try {
      const customerService = req.scope.resolve('customerService') as CustomerService
      await customerService.restoreCustomer(req.body.email);

      return res.json({ status: 200, message: 'User has been restored!' })
    } catch (error) {
      return res.status(500).json({ status: 500, message: 'An error occurred!', error: error instanceof Error ? error.message : error })
    }
  })
}