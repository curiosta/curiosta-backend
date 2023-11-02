import { authenticate } from "@medusajs/medusa";
import express, { Router } from "express";
import CategoryService from "../../../../services/category";
import GoogleSheetAPIService from "../../../../services/google-sheet-api";


export const SheetsSyncLocationsRouter = (router: Router) => {
  router.use('/admin/sheets/sync-locations', express.json(), authenticate());

  router.get('/admin/sheets/sync-locations', async (req, res) => {
    const googleSheetService = req.scope.resolve('googleSheetApiService') as GoogleSheetAPIService;
    const categoryService = req.scope.resolve('categoryService') as CategoryService;

    if (typeof req.query.sheetId === 'string') {
      googleSheetService.sheetId = req.query.sheetId
    }

    try {

      const lastLocations = await categoryService.retrieveAllLastLocationsName()


      if (lastLocations.length) {
        await googleSheetService.syncLocations(lastLocations)
      }

      return res.json({ status: lastLocations.length ? 'ok' : 'failed, no locations available!' })
    } catch (error) {
      return res.status(500).json({ status: 500, message: 'An error occurred!', error: error instanceof Error ? error.message : error })
    }
  })
}