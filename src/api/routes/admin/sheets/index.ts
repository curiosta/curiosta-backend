import { ProductStatus, authenticate } from "@medusajs/medusa"
import express, { Router } from "express";
import CategoryService from "../../../../services/category";
import GoogleSheetAPIService, { ProductData } from "../../../../services/google-sheet-api";
import ProductService from "../../../../services/product";
import { mapSheetProduct } from "./helpers/mapSheetProduct";

type CategoriesID = { id: string }[];

type SheetProductWithCategories = ProductData & { categories: CategoriesID };

export const SheetsRouter = (router: Router) => {
  router.use('/admin/sheets', express.json(), authenticate());

  router.get('/admin/sheets', async (req, res) => {
    const googleSheetService = req.scope.resolve('googleSheetApiService') as GoogleSheetAPIService;
    const categoryService = req.scope.resolve('categoryService') as CategoryService;
    const productService = req.scope.resolve('productService') as ProductService

    googleSheetService.sheetId = (req.query.sheetId as string) || '1TaiFMTqYGirhLrjUkEfCGbV3hCrX9po_tduFw_sETUg';

    try {
      const sheetData = await googleSheetService.getProductDataBySheetId();

      const promises = sheetData.map(async (entry) => {
        const location = await categoryService.getCategoryByName(entry.Location);
        const category = await categoryService.getCategoryByName(entry.Category);

        const categories: { id: string }[] = []

        if (location) {
          categories.push({ id: location.id })
        }
        if (category) {
          categories.push({ id: category.id })
        }

        return { ...entry, categories }
      });

      let results = (await Promise.allSettled(promises)).filter(r => r.status === 'fulfilled').map((r: any) => r.value)

      results = results.map((product: SheetProductWithCategories) => {
        return mapSheetProduct({
          id: product['Product ID'],
          title: product['Product title'],
          description: product.Description,
          stock: product.Stocks,
          categories: product.categories,
          rowNumber: product.rowNumber,
          status: product.Draft ? ProductStatus.DRAFT : ProductStatus.PUBLISHED
        })
      });

      const bulkAddResult = await productService.addBulkProducts(results)
      const savedProductIdAndRowNumber = bulkAddResult.saved.map((p) => ({ id: p.id, rowNumber: p.rowNumber }))

      const affectedCellsCount = await googleSheetService.updateProductId(savedProductIdAndRowNumber)

      return res.json({ status: 'ok', affectedCellsCount })
    } catch (error) {
      return res.status(500).json({ status: 500, message: 'An error occurred!', error: error instanceof Error ? error.message : error })
    }
  })
}