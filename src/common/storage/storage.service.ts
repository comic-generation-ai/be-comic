import * as Minio from 'minio';
import { Injectable } from '@nestjs/common';


@Injectable()
export class StorageService {
    private client = new Minio.Client({
        endPoint: process.env.MINIO_ENDPOINT ?? '127.0.0.1',
        port: parseInt(process.env.MINIO_PORT ?? '9000', 10),
        useSSL: false,
        accessKey: process.env.MINIO_ACCESS_KEY ?? '',
        secretKey: process.env.MINIO_SECRET_KEY ?? '',
    });

    /**
     * Object key trong DB có dạng "comic-images/comic_abc.jpg"
     * (bucket/tên-file) — tách ra rồi xin presigned URL mới.
     */
    presignFromKey(objectKey: string): Promise<string> {
        const [bucket, ...rest] = objectKey.split('/');
        const objectName = rest.join('/');
        const expiry = parseInt(process.env.MINIO_PRESIGN_EXPIRY_SEC ?? '3600', 10);
        return this.client.presignedGetObject(bucket, objectName, expiry);
    }
}