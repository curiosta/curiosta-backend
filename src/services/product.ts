import { ProductService as BaseProductService, ProductVariantService } from "@medusajs/medusa";
import { CreateProductInput } from "@medusajs/medusa/dist/types/product";
import axios from 'axios';


class ProductService extends BaseProductService {
  productVariantService: ProductVariantService;
  base_url?: string | null;
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

      console.log(result.data);

    } catch (error) {
      console.log(error);
      throw new Error('Failed to login as backend service!. ensure credentials are correct and stable network connection!')
    }
  }

  async addBulkProducts(products: CreateProductInput[]) {
    await this.loginAdmin();
    // const promises = products.map(product => {
    //   return new Promise((resolve, reject) => {
    //     axios.post(`${this.base_url}/admin/products`, product, {
    //       withCredentials: true,
    //     })
    //   })
    // });
    // console.log(await Promise.all(promises));
  }
}

export default ProductService