import { EventBusService, ProductService } from "@medusajs/medusa";
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY, // Replace with your API key
});

class ProductDescriptionSubscriber {
  productService: ProductService;

  constructor({ productService, eventBusService }: { productService: ProductService, eventBusService: EventBusService }) {
    this.productService = productService;
    console.log('<><><><><><><><><><><><><><><>Initializing<><><><><><><><><><><><><><><>');
    eventBusService.subscribe(ProductService.Events.CREATED, this.handleDescription);
  }
  handleDescription = async (data) => {
    console.log('<><><><><><><><><><><><><><><>Handling<><><><><><><><><><><><><><><>');
    let productDescription = "";
    const product = await this.productService.retrieve(data.id);
    console.log('<><><><><><><><><><><><><><><>Product<><><><><><><><><><><><><><><>');
    console.log(JSON.stringify(product, undefined, 4), '<><><><>');
    if (product.description == null) {
      try {
        const productName = product.title;
        const productFeatures = [product.subtitle, product.material];
        const prompt = `Write a product description for ${productName}, which has the following features: ${productFeatures.join(
          ", "
        )}.`;

        productDescription = await this.prepareDescription(prompt);
      } catch (error) {
        const errorMessage = error.response.data.error.message;
        console.error("Error: " + errorMessage);
        return;
      }

      product.description = productDescription;
      await this.productService.update(product.id, product as any);
    }
  };

  prepareDescription = async (
    prompt,
    model = "text-davinci-003",
    temperature = 0.7,
    maxTokens = 256,
    topP = 1,
    frequencyPenalty = 0,
    presencePenalty = 0
  ) => {
    const openai = new OpenAIApi(configuration);
    const response = await openai.createCompletion({
      model,
      prompt,
      temperature,
      max_tokens: maxTokens,
      top_p: topP,
      frequency_penalty: frequencyPenalty,
      presence_penalty: presencePenalty,
    });

    console.log('\n\n\n\n\n\n\nResponse:', JSON.stringify(response, undefined, 2), '\n\n\n\n\n\n');

    return response.data.choices[0].text.trim();
  };
}

export default ProductDescriptionSubscriber