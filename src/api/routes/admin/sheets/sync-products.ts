import { authenticate } from "@medusajs/medusa"
import express, { Router } from "express";
import GoogleSheetAPIService from "../../../../services/google-sheet-api";
import ProductService from "../../../../services/product";


export const SheetsSyncProductsRouter = (router: Router) => {
  router.use('/admin/sheets/sync-products', express.json(), authenticate());

  router.get('/admin/sheets/sync-products', async (req, res) => {
    const googleSheetService = req.scope.resolve('googleSheetApiService') as GoogleSheetAPIService;
    const productService = req.scope.resolve('productService') as ProductService;

    if (typeof req.query.sheetId === 'string') {
      googleSheetService.sheetId = req.query.sheetId
    }

    try {
      const products = await productService.list({}, { relations: ['categories', 'variants'] })

      googleSheetService.syncProducts(products)

      return res.json({ status: products.length ? 'ok' : 'failed, no categories available!' })
    } catch (error) {
      return res.status(500).json({ status: 500, message: 'An error occurred!', error: error instanceof Error ? error.message : error })
    }
  })
}