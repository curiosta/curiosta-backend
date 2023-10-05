import { CustomerService } from "@medusajs/medusa";
import { NextFunction, Request, Response } from "express";

const validateUserNotDeactivated = async (req: Request, res: Response, next: NextFunction) => {
  const customerService = req.scope.resolve('customerService') as CustomerService;

  if (req.method.toLowerCase() === 'post' && req.body.email) {
    const customer = await customerService.retrieveRegisteredByEmail(req.body.email);
    console.log(customer);
  }

  next();
}

export default validateUserNotDeactivated;