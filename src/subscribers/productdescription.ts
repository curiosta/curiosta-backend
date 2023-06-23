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
  }

  handleMetaDescription = async ({ id }: { id: string }) => {
    let metaDescription = (productName: string, productFeatures: string[]) => `max 160 characters including spaces, write a meta description for ${productName} with following features: ${productFeatures.join(', ')}`;
    const product = await this.productService.retrieve(id);

    let prompt;

    try {

      prompt = await this.prepareDescription(metaDescription(product.title, [product.subtitle, product.material]));
    } catch (error) {
      prompt = `${product.title}: ${[product.subtitle, product.material].join(', ')}`
    }

    if (product.metadata) {
      product.metadata.meta_description = prompt;
    } else {
      product.metadata = { meta_description: prompt };
    }
    try {
      await this.productService.update(product.id, product as any);
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
    prompt,
    retries = 0,
    model = "text-davinci-003",
    temperature = 0.7,
    maxTokens = 256,
    topP = 1,
    frequencyPenalty = 0,
    presencePenalty = 0,
  ) => {
    const openai = new OpenAIApi(configuration);
    try {
      const response = await openai.createCompletion({
        model,
        prompt,
        temperature,
        max_tokens: maxTokens,
        top_p: topP,
        frequency_penalty: frequencyPenalty,
        presence_penalty: presencePenalty,
      });

      return response.data.choices[0].text.trim();

    } catch (error) {
      if (!(retries >= 3)) {
        this.prepareDescription(prompt, retries + 1);
      } else {
        throw new Error('No description provided!');
      }
    }
  };
}

export default ProductDescriptionSubscriber