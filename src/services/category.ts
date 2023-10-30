import { ProductCategory, ProductCategoryService } from "@medusajs/medusa";
import { buildLocationTree, getLastLocationPath } from "../utils/convertIntoNestedLocations";

class CategoryService extends ProductCategoryService {
  constructor(container) {
    super(container)
  }
  async retrieveAllCategoriesName() {
    const retrieveAllCategories = `
      SELECT name FROM product_category WHERE handle NOT LIKE 'loc:%'
    `

    const result = await this.activeManager_.query(retrieveAllCategories) as { name: string }[]
    return result?.filter(c => c.name !== 'Location master').map(category => category.name)
  }

  async retrieveAllLastLocationsName() {
    const retrieveAllLocations = `
      SELECT name, id, parent_category_id FROM "product_category" WHERE handle LIKE 'loc:%'
    `

    const result = await this.activeManager_.query(retrieveAllLocations) as { name: string, id: string, parent_category_id: string }[]

    // Convert the location tree to slash-separated strings

    const nestedLocations = buildLocationTree(result);
    const locationStrings: string[] = getLastLocationPath(nestedLocations)
    return locationStrings
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