import { ProductCategory, ProductCategoryService } from "@medusajs/medusa";


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
    const categories = await this.listAndCount({})
    const res = await Promise.all(categories[0].map((c) => {
      return this.productCategoryRepo_.findDescendantsTree(c)
    }))

    const childCategories = res.filter(r => !r.category_children?.length && r.handle.startsWith('loc:'));

    const categoriesWithParent = await Promise.all(childCategories.map((c) => this.productCategoryRepo_.findAncestorsTree(c)))


    return categoriesWithParent.map((category) => {
      const list = [];

      const getParent = (pcat: ProductCategory) => {
        if (pcat.parent_category) {
          list.unshift(pcat.name)
          getParent(pcat.parent_category)
        }
      }

      getParent(category);

      return list.join(' / ');
    })
  }


  async getCategoryByName(name: string) {
    const queryByName = `
      SELECT * FROM product_category WHERE name ILIKE $1
    `;
    const result = await this.activeManager_.query(queryByName, [name]);
    return result[0] as ProductCategory
  }


  async getLocationWithParentNames(id: string) {
    const locations: ProductCategory[] = []

    const getLocation = async (locationId: string) => {
      const location = await this.retrieve(locationId);
      if (location.parent_category_id) {
        locations.unshift(location)
        await getLocation(location.parent_category_id)
      }
    }

    await getLocation(id)

    return locations.map(l => l.name).join(' / ')
  }

}
export default CategoryService