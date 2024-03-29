const dotenv = require("dotenv");
const { existsSync } = require("fs");

let ENV_FILE_NAME = ".env";
switch (process.env.NODE_ENV) {
  case "production":
    ENV_FILE_NAME = existsSync('./.env.production') ? '.env.production' : '.env'
    break;
  case "staging":
    ENV_FILE_NAME = ".env.staging";
    break;
  case "test":
    ENV_FILE_NAME = ".env.test";
    break;
  case "development":
    ENV_FILE_NAME = existsSync('./.env.development') ? '.env.development' : '.env'
    break;
  default:
    ENV_FILE_NAME = ".env";
    break;
}

try {
  dotenv.config({ path: process.cwd() + "/" + ENV_FILE_NAME });
} catch (e) {}

// CORS when consuming Medusa from admin
const ADMIN_CORS =
  process.env.ADMIN_CORS || "http://localhost:7000,http://localhost:7001";

// CORS to avoid issues when consuming Medusa from a client
const STORE_CORS = process.env.STORE_CORS || "http://localhost:8000";

const DATABASE_TYPE = process.env.DATABASE_TYPE || "sqlite";
const DATABASE_URL =
  process.env.DATABASE_URL || "postgres://localhost/medusa-store";


const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

const plugins = [
  "medusa-fulfillment-manual",
  "medusa-payment-manual",
  {
    resolve: "medusa-file-s3",
    options: {
      s3_url: process.env.AWS_URL,
      bucket: process.env.AWS_BUCKET,
      region: process.env.AWS_REGION,
      access_key_id: process.env.AWS_ACCESS_KEY_ID,
      secret_access_key: process.env.AWS_SECRET_ACCESS_KEY,
    },
  },
  {
    resolve: "medusa-plugin-meilisearch",
    options: {
      config: {
        host: process.env.MEILISEARCH_HOST,
        apiKey: process.env.MEILISEARCH_API_KEY,
      },
      settings: {
        products: {
          indexSettings: {
            searchableAttributes: ["title", "description", "variant_sku"],
            displayedAttributes: [
              "title",
              "description",
              "variant_sku",
              "thumbnail",
              "prices",
              "handle",
              "id",
            ],
          },
          primaryKey: "id",
          transformer: (product) => {
            const { id, title, description, thumbnail, handle } = product;
            const prices = {};

            product.variants?.[0]?.prices.forEach((price) => {
              prices[price.currency_code] = price.amount;
            });

            const categoriesArr = product?.categories?.map((categ) => categ.id);

            if (!prices || !id || Object.values(prices).length < 3) {
              return null;
            }
            return {
              id,
              prices,
              title,
              description,
              thumbnail,
              handle,
              categories: categoriesArr,
            };
          },
        },
      },
    },
  },
  {
    resolve: "medusa-plugin-segment",
    options: {
      write_key: process.env.SEGMENT_WRITE_KEY,
    },
  },
  {
    resolve: "medusa-payment-stripe",
    options: {
      api_key: process.env.STRIPE_API_KEY,
      webhook_secret: process.env.STRIPE_WEBHOOK_SECRET,
      payment_description: "Order for local manufacturing and fabrication",
      automatic_payment_methods: true,
      capture: true,
    },
  },
  {
    resolve: "medusa-plugin-sendgrid",
    options: {
      api_key: process.env.SENDGRID_API_KEY,
      from: process.env.SENDGRID_FROM,
      user_password_reset_template: "d-685a5cda106d4db9b11e77af3c0e6090",
      customer_password_reset_template: "d-0ff7f800872c4caeadb250116b0ce3b9",
      order_placed_template: "d-a0093ed5b002403ba5655c2535493490",
    },
  },
  {
    resolve: "@medusajs/admin",
    /** @type {import('@medusajs/admin').PluginOptions} */
    options: {
      autoRebuild: true,
      path: "/app",
    },
  },
];

const modules = {
  eventBus: {
    resolve: "@medusajs/event-bus-redis",
    options: {
      redisUrl: REDIS_URL,
    },
  },
  cacheService: {
    resolve: "@medusajs/cache-redis",
    options: {
      redisUrl: REDIS_URL,
    },
  },
};

/** @type {import('@medusajs/medusa').ConfigModule["projectConfig"]} */
const projectConfig = {
  jwtSecret: process.env.JWT_SECRET,
  cookieSecret: process.env.COOKIE_SECRET,
  database_database: "./medusa-db.sql",
  database_type: DATABASE_TYPE,
  store_cors: STORE_CORS,
  admin_cors: ADMIN_CORS,
  redis_url: REDIS_URL,
};

if (DATABASE_URL && DATABASE_TYPE === "postgres") {
  projectConfig.database_url = DATABASE_URL;
  delete projectConfig["database_database"];
} 

/** @type {import('@medusajs/medusa').ConfigModule} */
module.exports = {
  projectConfig,
  plugins,
  modules,
};
