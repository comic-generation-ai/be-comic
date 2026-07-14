import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFieldsToUser1783924296160 implements MigrationInterface {
    name = 'AddFieldsToUser1783924296160'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "COMIC_USER" ADD "full_name" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "COMIC_USER" ADD "username" character varying(50)`);
        await queryRunner.query(`ALTER TABLE "COMIC_USER" ADD CONSTRAINT "UQ_9a066023bb13ac180bf80fb42df" UNIQUE ("username")`);
        await queryRunner.query(`ALTER TABLE "COMIC_USER" ADD "avatar_url" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "COMIC_USER" ADD "subscription_renews_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "COMIC_USER" ADD CONSTRAINT "UQ_ae86a4152ec20e474ca95ba05e2" UNIQUE ("email")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "COMIC_USER" DROP CONSTRAINT "UQ_ae86a4152ec20e474ca95ba05e2"`);
        await queryRunner.query(`ALTER TABLE "COMIC_USER" DROP COLUMN "subscription_renews_at"`);
        await queryRunner.query(`ALTER TABLE "COMIC_USER" DROP COLUMN "avatar_url"`);
        await queryRunner.query(`ALTER TABLE "COMIC_USER" DROP CONSTRAINT "UQ_9a066023bb13ac180bf80fb42df"`);
        await queryRunner.query(`ALTER TABLE "COMIC_USER" DROP COLUMN "username"`);
        await queryRunner.query(`ALTER TABLE "COMIC_USER" DROP COLUMN "full_name"`);
    }

}
