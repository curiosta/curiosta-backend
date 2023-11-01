import { ProductOption, ProductStatus, authenticate } from "@medusajs/medusa"
import express, { Router } from "express";
import CategoryService from "../../../../services/category";
import GoogleSheetAPIService, { ProductData } from "../../../../services/google-sheet-api";
import ProductService from "../../../../services/product";
import { mapSheetProduct } from "./helpers/mapSheetProduct";

type CategoriesID = { id: string }[];

type SheetProductWithExtras = ProductData & { categories: CategoriesID, options?: ProductOption[] };

export const SheetsRouter = (router: Router) => {
  router.use('/admin/sheets', express.json(), authenticate());

  router.get('/admin/sheets', async (req, res) => {
    const googleSheetService = req.scope.resolve('googleSheetApiService') as GoogleSheetAPIService;
    const categoryService = req.scope.resolve('categoryService') as CategoryService;
    const productService = req.scope.resolve('productService') as ProductService

    if (typeof req.query.sheetId === 'string') {
      googleSheetService.sheetId = req.query.sheetId
    }
    try {
      const sheetData = await googleSheetService.getProductDataBySheetId();

      const promises = sheetData.map(async (entry) => {
        const location = await categoryService.getCategoryByName(entry.Location.split('/').pop().trim());
        const category = await categoryService.getCategoryByName(entry.Category);
        let options: ProductOption[];
        try {
          const product = await productService.retrieve(entry["Product ID"], { relations: ['options'] })
          options = product.options;
        } catch (error) {
        }
        const categories: { id: string }[] = []

        if (location) {
          categories.push({ id: location.id })
        }
        if (category) {
          categories.push({ id: category.id })
        }

        return { ...entry, categories, options }
      });

      let results = (await Promise.allSettled(promises)).filter(r => r.status === 'fulfilled').map((r: any) => r.value)

      results = results.map((product: SheetProductWithExtras) => {
        return mapSheetProduct({
          id: product['Product ID'],
          title: product['Product title'],
          description: product.Description,
          stock: product.Stocks,
          categories: product.categories,
          rowNumber: product.rowNumber,
          status: product.Draft ? ProductStatus.DRAFT : ProductStatus.PUBLISHED,
          options: product.options
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