import { ITenant } from "../service/tenant/0.model";

const options = {
  dialect: "mysql",
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};

const tenantList: ITenant[] = readTenantConfiguration();

const serverConfig = {
  serviceName: "student-service",
  environment: "development",
  port: process.env.PORT || "3000",
  healthPort: process.env.HEALTH_PORT || "3001",
  limit: process.env.REQUEST_PAYLOAD_LIMIT || "1mb",

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
    level: process.env.LOG_LEVEL || "debug",
    timeFormat: process.env.TIMESTAMP_FORMAT || "yyyy-mm-dd",
  },

  STRICT_TRANSPORT_SECURITY: "Strict-Transport-Security",
  MAX_AGE: "max-age=31536000; includeSubDomains",
  CONTENT_TYPE: "Content-Type=application/json",
  CLIENT_PATH: "dashboard",

  tenantList: tenantList,
};

function readTenantConfiguration(): ITenant[] {
  const tenantList: ITenant[] = [];
  const tenantCount = 1; // Adjust based on number of tenants

  for (let i = 1; i <= tenantCount; i++) {
    if (
      !process.env[`TENANT_${i}_ID`] ||
      !process.env[`TENANT_${i}_NAME`] ||
      !process.env[`TENANT_${i}_AUTH_SERVER`] ||
      !process.env[`TENANT_${i}_CLIENT_ID`] ||
      !process.env[`TENANT_${i}_CLIENT_SECRET`] ||
      !process.env[`TENANT_${i}_DB_URI`] ||
      !process.env[`TENANT_${i}_DB_USERNAME`] ||
      !process.env[`TENANT_${i}_DB_PASSWORD`]
    ) {
      throw new Error("Incomplete configuration. Check environment");
    }

    tenantList.push({
      id: i,
      name: process.env[`TENANT_${i}_NAME`] || "",
      authentication: {
        authServer: process.env[`TENANT_${i}_AUTH_SERVER`] || "",
        clientId: process.env[`TENANT_${i}_CLIENT_ID`] || "",
        clientSecret: process.env[`TENANT_${i}_CLIENT_SECRET`] || "",
      },
      database: {
        sqlDBName: process.env[`TENANT_${i}_NAME`] || "",
        connectionUri: process.env[`TENANT_${i}_DB_URI`] || "",
        username: process.env[`TENANT_${i}_DB_USERNAME`] || "",
        password: process.env[`TENANT_${i}_DB_PASSWORD`] || "",
        options: {
          dialect: process.env[`TENANT_${i}_DB_DIALECT`] || "mysql",
          pool: {
            max: parseInt(process.env[`TENANT_${i}_DB_POOL_MAX`] || "10", 10),
            min: parseInt(process.env[`TENANT_${i}_DB_POOL_MIN`] || "0", 10),
            acquire: parseInt(
              process.env[`TENANT_${i}_DB_POOL_ACQUIRE`] || "30000",
              10
            ),
            idle: parseInt(
              process.env[`TENANT_${i}_DB_POOL_IDLE`] || "10000",
              10
            ),
          },
        },
        connection: null,
      },
    });
  }

  return tenantList;
}
export { serverConfig };
