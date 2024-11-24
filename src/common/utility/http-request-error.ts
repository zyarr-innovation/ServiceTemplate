export class BaseError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    Object.setPrototypeOf(this, BaseError.prototype);
  }
}

export class HttpRequestError extends BaseError {
  constructor(public status: number, public message: string) {
    super();
  }
}
