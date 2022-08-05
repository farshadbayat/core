export interface IResponse<T = any> {
  data?: T;
  message?: string;
  success: boolean;
}
