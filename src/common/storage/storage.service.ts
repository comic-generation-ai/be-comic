import * as Minio from 'minio';
import { Injectable } from '@nestjs/common';
import { minioConfig } from '../config';


@Injectable()
export class StorageService {
    private client = new Minio.Client({
        endPoint: minioConfig.endPoint,
        port: minioConfig.port,
        useSSL: minioConfig.useSSL,
        accessKey: minioConfig.accessKey,
        secretKey: minioConfig.secretKey,
    });

    /**
     * Object key trong DB có dạng "comic-images/comic_abc.jpg"
     * (bucket/tên-file) — tách ra rồi xin presigned URL mới.
     */
    presignFromKey(objectKey: string): Promise<string> {
        const [bucket, ...rest] = objectKey.split('/');
        const objectName = rest.join('/');
        return this.client.presignedGetObject(bucket, objectName, minioConfig.presignExpirySec);
    }
}
