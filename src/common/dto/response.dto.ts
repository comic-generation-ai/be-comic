import { HttpStatus } from '@nestjs/common';
import { IResponse } from '../Interfaces/respone.interface';

/**
 * Envelope chuẩn cho response thành công: { success, code, message, data }.
 * Dùng static factory (ResponseCommon.ok / .created) thay vì gọi constructor
 * trực tiếp — tránh nhầm thứ tự tham số (code, success, message đều cùng kiểu
 * dễ hoán đổi).
 */
export class ResponseCommon<T = null> implements IResponse<T> {
    readonly success: boolean;
    readonly code: number;
    readonly message: string;
    readonly data: T | null;

    protected constructor(code: number, success: boolean, message: string, data: T | null) {
        this.code = code;
        this.success = success;
        this.message = message;
        this.data = data;
    }

    static ok<T>(data: T, message = 'OK'): ResponseCommon<T> {
        return new ResponseCommon(HttpStatus.OK, true, message, data);
    }

    static created<T>(data: T, message = 'Created'): ResponseCommon<T> {
        return new ResponseCommon(HttpStatus.CREATED, true, message, data);
    }

    static fail(code: number, message: string): ResponseCommon<null> {
        return new ResponseCommon(code, false, message, null);
    }
}
