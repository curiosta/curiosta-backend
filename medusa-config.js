const dotenv = require("dotenv");

let ENV_FILE_NAME = ".env";
switch (process.env.NODE_ENV) {
  case "production":
    ENV_FILE_NAME = ".env.production";
    break;
  case "staging":
    ENV_FILE_NAME = ".env.staging";
    break;
  case "test":
    ENV_FILE_NAME = ".env.test";
    break;
  case "development":
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
  {
    resolve: "medusa-file-s3",
    options: {
      s3_url: process.env.S3_URL,
      bucket: process.env.S3_BUCKET,
      region: "ap-south-1",
      access_key_id: process.env.S3_ACCESS_KEY_ID,
      secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
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
            const price = product.variants[0].prices.reduce((_, price) => {
              prices[price.currency_code] = price.amount;
              if (price.currency_code === "inr") {
                return price.amount;
              }
            });
            const categoriesArr = product.categories.map((categ) => categ.id);
            return {
              id,
              price,
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
      capture: true,
      automatic_payment_methods: true,
    },
  },
  {
    resolve: "medusa-plugin-sendgrid",
    options: {
      api_key: process.env.SENDGRID_API_KEY,
      from: process.env.SENDGRID_FROM,
      user_password_reset_template: "d-0ff7f800872c4caeadb250116b0ce3b9",
    },
  },
  {
    resolve: "@medusajs/admin",
    /** @type {import('@medusajs/admin').PluginOptions} */
    options: {
      autoRebuild: true,
      path: "app",
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
