import { ProductCategory, authenticate } from "@medusajs/medusa"
import express, { Router } from "express";
import CategoryService from "../../../../services/category";
import GoogleSheetAPIService from "../../../../services/google-sheet-api";
import ProductService from "../../../../services/product";

export const SheetsRouter = (router: Router) => {
  router.use('/admin/sheets', express.json(), authenticate());

  router.get('/admin/sheets', async (req, res) => {
    const googleSheetService = req.scope.resolve('googleSheetApiService') as GoogleSheetAPIService;
    const categoryService = req.scope.resolve('categoryService') as CategoryService;
    const productService = req.scope.resolve('productService') as ProductService
    try {
      const sheetData = await googleSheetService.getProductDataBySheetId('1TaiFMTqYGirhLrjUkEfCGbV3hCrX9po_tduFw_sETUg');

      const promises = sheetData.map(async (entry) => {
        const location = await categoryService.getCategoryByName(entry.Location);
        const category = await categoryService.getCategoryByName(entry.Category);

        const categories: ProductCategory[] = []

        if (location) {
          categories.push(location)
        }
        if (category) {
          categories.push(category)
        }

        return { ...entry, categories }
      });

      const results = (await Promise.allSettled(promises)).filter(r => r.status === 'fulfilled').map((r: any) => r.value);

      console.log('results: ', results);

      const bulkAddResult = await productService.addBulkProducts(results)
      console.log('bulk results:', bulkAddResult);

      return res.json({ status: 'ok' })
    } catch (error) {
      return res.status(500).json({ status: 500, message: 'An error occurred!', error: error instanceof Error ? error.message : error })
    }
  })
}