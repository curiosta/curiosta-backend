import { EventBusService, ProductService } from "@medusajs/medusa";
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY, // Replace with your API key
});

class ProductDescriptionSubscriber {
  productService: ProductService;

  constructor({ productService, eventBusService }: { productService: ProductService, eventBusService: EventBusService }) {
    this.productService = productService;
    eventBusService.subscribe(ProductService.Events.CREATED, this.handleDescription);
    eventBusService.subscribe(ProductService.Events.CREATED, this.handleMetaDescription);


    // update all existing products

    this.productService.list({}).then((products) => {
      products.map((p) => {

        // Do Your Task Here.

        // console.log(`Generating meta description of ${p.title}`);
        this.handleMetaDescription({ id: p.id })
      });
    })
  }

  handleMetaDescription = async ({ id }: { id: string }) => {
    let metaDescription = (productName: string, productFeatures: string[]) => `max 160 characters including spaces, write a meta description for ${productName} with following features: ${productFeatures.join(', ')}`;
    const product = await this.productService.retrieve(id);

    let prompt;

    try {

      prompt = await this.prepareDescription(metaDescription(product.title, [product.subtitle, product.material]), { maxTokens: 160 });

    } catch (error) {
      prompt = `${product.title}: ${[product.subtitle, product.material].join(', ')}`
    }


    if (product.metadata) {
      product.metadata.meta_description = prompt;
    } else {
      product.metadata = { meta_description: prompt };
    }

    try {
      // await this.productService.update(product.id, product as any);
    } catch (error) { }
  }

  handleDescription = async (data) => {
    let productDescription = "";
    const product = await this.productService.retrieve(data.id);
    if (product.description == null) {
      try {
        const productName = product.title;
        const productFeatures = [product.subtitle, product.material];
        const prompt = `Write a product description for ${productName}, which has the following features: ${productFeatures.join(
          ", "
        )}.`;
        try {
          productDescription = await this.prepareDescription(prompt);
        } catch (error) {
          productDescription = error.message
        }
      } catch (error) {
        const errorMessage = error.response?.data.error.message;
        console.error("Error: " + errorMessage);
        return;
      }

      product.description = productDescription;
      await this.productService.update(product.id, product as any);
    }
  };

  prepareDescription = async (
    prompt: string,
    {
      retries = 0,
      model = "gpt-3.5-turbo",
      maxTokens = 256 } = {}
  ) => {
    const openai = new OpenAIApi(configuration);
    try {
      const response = await openai.createChatCompletion({ messages: [{ role: 'system', content: prompt }], model, max_tokens: maxTokens });

      return response.data.choices[0].message.content

    } catch (error) {
      if (!(retries >= 3)) {
        this.prepareDescription(prompt, { retries: retries + 1 });
      } else {
        throw new Error('No description provided!');
      }
    }
  };
}

export default ProductDescriptionSubscriber