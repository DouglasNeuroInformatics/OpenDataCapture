export type GetRequest<T> = (...args: any[]) => Promise<T>;

export type PostRequest<T, U = void> = (requestBody: T) => Promise<U>;

export default abstract class BaseAPI {
  protected static host = import.meta.env.VITE_API_HOST;
}
