type BackendSecrets = {
  MEDUSA_BACKEND_SERVICE_EMAIL: string,
  MEDUSA_BACKEND_SERVICE_PASSWORD: string
}

type DatabaseEnv = {
  REDIS_URL: string;
  DATABASE_TYPE: string;
  DATABASE_URL: string;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_HOST: string;
  DB_PORT: string;
  DB_NAME: string;
}


type SessionSecret = {
  JWT_SECRET: string;
  COOKIE_SECRET: string
}

type CORSSecret = {
  STORE_CORS: string;
  ADMIN_CORS: string;
}

type ServicesAPIKeys = {
  // openai
  OPENAI_API_KEY: string;

  // sendgrid
  SENDGRID_API_KEY: string;
  SENDGRID_FROM: string;
  SEGMENT_WRITE_KEY: string;

  // meilisearch
  MEILISEARCH_API_KEY: string;
  MEILISEARCH_HOST: string;

  // google
  KEY_FILE_PATH: string;
}

type AWSEnv = {
  AWS_ACCESS_KEY_ID: string,
  AWS_BUCKET: string,
  AWS_REGION: string,
  AWS_SECRET_ACCESS_KEY: string,
  AWS_URL: string,
}

type GoogleSheetEnv = {
  GSHEET_ID: string;
  PRODUCT_SHEET_NAME: string;
  DROPDOWN_LIST_SHEET_NAME: string;
}

declare namespace NodeJS {
  interface ProcessEnv extends BackendSecrets, DatabaseEnv, SessionSecret, CORSSecret, ServicesAPIKeys, AWSEnv, GoogleSheetEnv {
    BASE_URL: string;
  }
}