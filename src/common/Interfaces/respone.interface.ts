export class IResponse<T> {
  success: boolean;
  code: number;
  message: string;
  errorMessage: string;
  data: T;
}

/** Dùng cho ProductAttributeService / luồng createProduct */
export interface IResponseV2 {
  success: boolean;
  code?: number;
  message?: string;
  data?: any;
}
