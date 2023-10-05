import { authenticate } from "@medusajs/medusa"
import express, { Router } from "express";
import DeletedCustomerService from "../../../services/deleted-customer";

export const deleteCustomer = (router: Router) => {
  router.use('/admin/delete-customer', express.json());

  router.post('/admin/delete-customer', authenticate(), async (req, res) => {
    const deletedCustomerService = req.scope.resolve('deletedCustomerService') as DeletedCustomerService;
    try {
      await deletedCustomerService.deleteCustomer(req.body.email);
      return res.json({ status: 200, message: 'User has been deleted!' })
    } catch (error) {
      return res.status(500).json({ status: 500, message: 'An error occurred!', error: error instanceof Error ? error.message : error })
    }

  })
}