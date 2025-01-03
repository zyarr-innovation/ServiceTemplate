import { ITenant } from "../service/tenant.service";
import { getEnvVariable, validateEnvVariables } from "../utility/env-utils";

const DEFAULT_OPTIONS = {
  dialect: "mysql",
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};

const serverConfig = {
  serviceName: "student-service",
  environment: process.env.NODE_ENV || "development",
  port: getEnvVariable("PORT", "3000"),
  healthPort: getEnvVariable("HEALTH_PORT", "3001"),
  limit: getEnvVariable("REQUEST_PAYLOAD_LIMIT", "1mb"),

  corsOption: {
    origin: process.env.CORSURL,
    methods: "GET, POST, PUT, DELETE",
    credentials: true,
    allowedHeaders:
      "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  },
  helmet: {
    contentSecurityPolicy: {
      directives: {
        "default-src": ["'self'"],
        "img-src": ["'self'"],
        "frame-ancestors": ["'none'"],
        //"upgrade-insecure-requests": [], ==> Enforce TLS
      },
    },
  },

  log: {
    level: getEnvVariable("LOG_LEVEL", "debug"),
    timeFormat: getEnvVariable("TIMESTAMP_FORMAT", "yyyy-mm-dd"),
  },

  STRICT_TRANSPORT_SECURITY: "Strict-Transport-Security",
  MAX_AGE: "max-age=31536000; includeSubDomains",
  CONTENT_TYPE: "Content-Type=application/json",
  CLIENT_PATH: "dashboard",

  tenantList: readTenantConfiguration(),
};

function readTenantConfiguration(): ITenant[] {
  const tenantCount = parseInt(getEnvVariable("TENANT_COUNT", "1"), 10);
  const tenants: ITenant[] = [];

  for (let i = 1; i <= tenantCount; i++) {
    const tenantEnvPrefix = `TENANT_${i}`;
    validateEnvVariables([
      `${tenantEnvPrefix}_ID`,
      `${tenantEnvPrefix}_AUTH_SERVER`,
      `${tenantEnvPrefix}_CLIENT_ID`,
      `${tenantEnvPrefix}_CLIENT_SECRET`,
      `${tenantEnvPrefix}_DB_URI`,
      `${tenantEnvPrefix}_DB_USERNAME`,
      `${tenantEnvPrefix}_DB_PASSWORD`,
    ]);

    tenants.push({
      id: process.env[`${tenantEnvPrefix}_ID`] || "",
      authentication: {
        authServer: process.env[`${tenantEnvPrefix}_AUTH_SERVER`] || "",
        clientId: process.env[`${tenantEnvPrefix}_CLIENT_ID`] || "",
        clientSecret: process.env[`${tenantEnvPrefix}_CLIENT_SECRET`] || "",
      },
      database: {
        sqlDBName: process.env[`${tenantEnvPrefix}_NAME`] || "",
        connectionUri: process.env[`${tenantEnvPrefix}_DB_URI`] || "",
        username: process.env[`${tenantEnvPrefix}_DB_USERNAME`] || "",
        password: process.env[`${tenantEnvPrefix}_DB_PASSWORD`] || "",
        options: {
          dialect:
            process.env[`${tenantEnvPrefix}_DB_DIALECT`] ||
            DEFAULT_OPTIONS.dialect,
          pool: {
            max: parseInt(
              process.env[`${tenantEnvPrefix}_DB_POOL_MAX`] ||
                DEFAULT_OPTIONS.pool.max.toString(),
              10
            ),
            min: parseInt(
              process.env[`${tenantEnvPrefix}_DB_POOL_MIN`] ||
                DEFAULT_OPTIONS.pool.min.toString(),
              10
            ),
            acquire: parseInt(
              process.env[`${tenantEnvPrefix}_DB_POOL_ACQUIRE`] ||
                DEFAULT_OPTIONS.pool.acquire.toString(),
              10
            ),
            idle: parseInt(
              process.env[`${tenantEnvPrefix}_DB_POOL_IDLE`] ||
                DEFAULT_OPTIONS.pool.idle.toString(),
              10
            ),
          },
        },
        connection: null,
      },
    });
  }

  return tenants;
}

export { serverConfig };
