import { ProductService } from "@medusajs/medusa";

class ProductSubscriber {
  constructor({ eventBusService }) {
    eventBusService.subscribe(ProductService.Events.CREATED, async (data) => {
      console.log('\n\n\n<><><><><>\nProduct Created\n\n\n', data.id)
    });
    eventBusService.subscribe(ProductService.Events.UPDATED, async (data) => {
      console.log('\n\n\n<><><><><>\nProduct Updated\n\n\n', data.id)
    });

    eventBusService.subscribe(ProductService.Events.DELETED, async (data) => {
      console.log('\n\n\n<><><><><>\nProduct Deleted\n\n\n', data.id)
    });
  }
}

export default ProductSubscriber;