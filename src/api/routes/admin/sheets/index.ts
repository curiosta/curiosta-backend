import { Product, ProductStatus, authenticate } from "@medusajs/medusa"
import express, { Router } from "express";
import CategoryService from "../../../../services/category";
import GoogleSheetAPIService, { ProductData } from "../../../../services/google-sheet-api";
import ProductService from "../../../../services/product";
import { CreateProductInput } from "@medusajs/medusa/dist/types/product";
import { ulid } from "ulid";

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

        const categories: { id: string }[] = []

        if (location) {
          categories.push({ id: location.id })
        }
        if (category) {
          categories.push({ id: category.id })
        }

        return { ...entry, categories }
      });

      const results = (await Promise.allSettled(promises)).filter(r => r.status === 'fulfilled').map((r: any) => r.value).map<CreateProductInput & { id: string; rowNumber: number; }>((product: ProductData & { categories: { id: string }[] }) => {
        return ({
          id: product["Product ID"],
          title: product["Product title"],
          handle: `${product["Product title"].toLowerCase().replace(/-/g, '').replace(/ /g, '-')}_${ulid()}`,
          description: product.Description,
          status: (!product.Stocks || product.Draft) ? ProductStatus.DRAFT : ProductStatus.PUBLISHED,
          categories: product.categories,
          variants: [
            {
              title: 'one size',
              inventory_quantity: product.Stocks || 0,
              prices: [
                {
                  amount: 10000,
                  currency_code: 'usd'
                }
              ]
            }
          ],

          rowNumber: product.rowNumber
        }) as CreateProductInput & { id: string; rowNumber: number; }
      });

      const bulkAddResult = await productService.addBulkProducts(results)
      const savedProductIdAndRowNumber = bulkAddResult.saved.map((p) => ({ id: p.id, rowNumber: p.rowNumber }))

      const affectedCellsCount = await googleSheetService.updateProductId('1TaiFMTqYGirhLrjUkEfCGbV3hCrX9po_tduFw_sETUg', savedProductIdAndRowNumber)

      return res.json({ status: 'ok', affectedCellsCount })
    } catch (error) {
      return res.status(500).json({ status: 500, message: 'An error occurred!', error: error instanceof Error ? error.message : error })
    }
  })
}