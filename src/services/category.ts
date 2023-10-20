import { ProductCategory, ProductCategoryService } from "@medusajs/medusa";

class CategoryService extends ProductCategoryService {
  constructor(container) {
    super(container)
  }

  async getCategoryByName(name: string) {
    const queryByName = `
      SELECT * FROM product_category WHERE name ILIKE $1
    `;
    const result = await this.activeManager_.query(queryByName, [name]);
    return result[0] as ProductCategory
  }
}
export default CategoryService