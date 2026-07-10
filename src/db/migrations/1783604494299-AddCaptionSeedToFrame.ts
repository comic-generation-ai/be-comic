import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCaptionSeedToFrame1783604494299 implements MigrationInterface {
    name = 'AddCaptionSeedToFrame1783604494299'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "COMIC_GENERATION_JOB" ADD "caption_vi" text`);
        await queryRunner.query(`ALTER TABLE "COMIC_GENERATION_JOB" ADD "seed" bigint`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "COMIC_GENERATION_JOB" DROP COLUMN "seed"`);
        await queryRunner.query(`ALTER TABLE "COMIC_GENERATION_JOB" DROP COLUMN "caption_vi"`);
    }

}
