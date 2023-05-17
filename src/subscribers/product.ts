import { EventBusService, ProductService } from "@medusajs/medusa";

class ProductSubscriber {
  constructor({ eventBusService }: { productService: ProductService, eventBusService: EventBusService }) {
    eventBusService.subscribe(ProductService.Events.CREATED, async (data: any) => {
      console.log('\n\n\n<><><><><>\nProduct Created\n\n\n', data.id)
    });
    eventBusService.subscribe(ProductService.Events.UPDATED, async (data: any) => {
      console.log('\n\n\n<><><><><>\nProduct Updated\n\n\n', data.id)
    });

    eventBusService.subscribe(ProductService.Events.DELETED, async (data: any) => {
      console.log('\n\n\n<><><><><>\nProduct Deleted\n\n\n', data.id)
    });

  }
}

export default ProductSubscriber;