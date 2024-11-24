export interface IRequestHeaders {
  tenantid: string;
  traceparent: string;
  authorization: string;
}

export interface IError {
  code: number;
  message: string;
}
