import { Product, ProductStatus } from "@medusajs/medusa";
import { CreateProductInput } from "@medusajs/medusa/dist/types/product";
import { ulid } from "ulid";


type ExtraProps = {
  stock: number,
  categories: { id: string }[],
  rowNumber: number;
}

export type CreateProduct = Omit<Partial<Product>, 'variants' | 'categories'> & ExtraProps

export type CreateProductResponse = CreateProductInput & { id: string, rowNumber: number }

export const mapSheetProduct = (product: CreateProduct): CreateProductResponse => {
  return ({
    id: product.id,
    rowNumber: product.rowNumber,
    title: product.title,
    handle: `${product.title.toLowerCase().replace(/-/g, '').replace(/ /g, '-')}_${ulid()}`,
    description: product.description,
    status: !product.stock ? ProductStatus.DRAFT : product.status,
    categories: product.categories,
    variants: [
      {
        title: 'one size',
        inventory_quantity: product.stock || 0,
        prices: [
          {
            amount: 10000,
            currency_code: 'usd'
          }
        ]
      }
    ],
  })
}