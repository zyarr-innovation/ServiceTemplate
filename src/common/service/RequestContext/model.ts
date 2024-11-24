export class RequestContext {
  tenantId: string | null = null;
  tenantName: string | null = null;
  traceparent: string | null = null;
  databaseConnection: any | null = null;
}
