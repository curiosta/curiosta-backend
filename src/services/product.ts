import { ProductService as BaseProductService, Product, ProductVariantService } from "@medusajs/medusa";
import { CreateProductInput, UpdateProductInput } from "@medusajs/medusa/dist/types/product";
import axios from 'axios';

class ProductService extends BaseProductService {
  productVariantService: ProductVariantService;
  base_url?: string | null;
  token?: string;
  credentials: {
    email?: string | null;
    password?: string | null;
  }

  constructor(container) {
    super(container);
    this.productVariantService = container.productVariantService as ProductVariantService
    this.base_url = process.env.BASE_URL;
    this.credentials = {
      email: process.env.MEDUSA_BACKEND_SERVICE_EMAIL,
      password: process.env.MEDUSA_BACKEND_SERVICE_PASSWORD
    }
  }

  private async loginAdmin() {

    if (!this.base_url) {
      throw new Error('Backend service host url is missing!. Please add them or contact administrator!')
    }

    if (!this.credentials.email || !this.credentials.password) {
      throw new Error('Backend service credentials are missing!. Please add them or contact administrator!')
    }

    try {
      // login system user to admin
      const result = await axios.post(`${process.env.BASE_URL}/admin/auth/token`, {
        'email': this.credentials.email,
        'password': this.credentials.password
      });

      this.token = result.data?.access_token;

    } catch (error) {
      console.log(error);
      throw new Error('Failed to login as backend service!. ensure credentials are correct and stable network connection!')
    }
  }

  private async createProductWithFetch(product: CreateProductInput) {
    const response = await axios.post<{ product: Product }>(`${this.base_url}/admin/products`, product, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
    return response.data;
  }

  private async updateProductWithFetch(id: string, product: UpdateProductInput) {
    const response = await axios.post<{ product: Product }>(`${this.base_url}/admin/products/${id}`, product, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
    return response.data;
  }

  async addBulkProducts(products: ((CreateProductInput | UpdateProductInput) & { id: string; rowNumber: number; })[]) {
    await this.loginAdmin();

    const promises = products.map((product, i) => {
      return new Promise<Partial<Product & { rowNumber: number }>>(async (resolve, reject) => {
        if (product.id) {
          let productExists;
          try {
            await this.retrieve(product.id)
            productExists = true
          } catch (error) {
            productExists = false;
          }

          if (productExists) {
            const { id, rowNumber, ...updateProduct } = product as UpdateProductInput & { id: string; rowNumber: number; };
            const { product: updatedProduct } = await this.updateProductWithFetch(id, updateProduct)
            resolve({ ...updatedProduct, rowNumber });
          } else {

            const { id, rowNumber, ...createProduct } = product as CreateProductInput & { id: string; rowNumber: number; }

            const { product: createdProduct } = await this.createProductWithFetch(createProduct);

            resolve({ ...createdProduct, rowNumber })
          }
        } else {
          const { id, rowNumber, ...createProduct } = product as CreateProductInput & { id: string, rowNumber: number; }

          const { product: createdProduct } = await this.createProductWithFetch(createProduct)

          resolve({ ...createdProduct, rowNumber })
        }
      })
    });

    try {
      const saved: Partial<Product & { rowNumber: number }>[] = []
      const failed: Error[] = [];

      (await Promise.allSettled(promises)).forEach((promiseProduct) => promiseProduct.status === 'fulfilled' ? saved.push(promiseProduct.value) : failed.push(promiseProduct.reason))

      return {
        saved,
        failed
      }

    } catch (error) {
      console.log(error);
    }
  }
}

export default ProductService