export interface IResponse<T = any>
{
  Data?: T;
  Messages: string[];
  Success: boolean;
}
