import { authenticate } from "@medusajs/medusa"
import express, { Router } from "express";
import CategoryService from "../../../../services/category";
import GoogleSheetAPIService from "../../../../services/google-sheet-api";


export const SheetsSyncCategoriesRouter = (router: Router) => {
  router.use('/admin/sheets/sync-categories', express.json(), authenticate());

  router.get('/admin/sheets/sync-categories', async (req, res) => {
    const googleSheetService = req.scope.resolve('googleSheetApiService') as GoogleSheetAPIService;
    const categoryService = req.scope.resolve('categoryService') as CategoryService;

    googleSheetService.sheetId = (req.query.sheetId as string) || '1TaiFMTqYGirhLrjUkEfCGbV3hCrX9po_tduFw_sETUg'

    try {

      const categories = await categoryService.retrieveAllCategoriesName()

      if (categories.length) {
        await googleSheetService.syncCategories(categories)
      }

      return res.json({ status: categories.length ? 'ok' : 'failed, no categories available!' })
    } catch (error) {
      return res.status(500).json({ status: 500, message: 'An error occurred!', error: error instanceof Error ? error.message : error })
    }
  })
}