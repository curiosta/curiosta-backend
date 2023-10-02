import { CustomerService, authenticate } from "@medusajs/medusa"
import express, { Router } from "express";

export const restrictUser = (router: Router) => {
  router.use('/admin/restrict-user', express.json());

  router.post('/admin/restrict-user', authenticate(), async (req, res) => {
    const customerService = req.scope.resolve('customerService') as CustomerService;
    try {
      const result = await customerService.retrieveRegisteredByEmail(req.body.email)
      await customerService.delete(result.id);
      return res.json({ status: 200, message: 'User has been deleted!' })
    } catch (error) {
      return res.status(500).json({ status: 500, message: 'An error occurred!', error: error instanceof Error ? error.message : error })
    }

  })
}