import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCaptionSeedToFrame1783608110550 implements MigrationInterface {
    name = 'AddCaptionSeedToFrame1783608110550'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "COMIC_GENERATION_JOB" DROP COLUMN "caption_vi"`);
        await queryRunner.query(`ALTER TABLE "COMIC_GENERATION_JOB" DROP COLUMN "seed"`);
        await queryRunner.query(`ALTER TABLE "COMIC_FRAME" ADD "caption_vi" text`);
        await queryRunner.query(`ALTER TABLE "COMIC_FRAME" ADD "seed" bigint`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "COMIC_FRAME" DROP COLUMN "seed"`);
        await queryRunner.query(`ALTER TABLE "COMIC_FRAME" DROP COLUMN "caption_vi"`);
        await queryRunner.query(`ALTER TABLE "COMIC_GENERATION_JOB" ADD "seed" bigint`);
        await queryRunner.query(`ALTER TABLE "COMIC_GENERATION_JOB" ADD "caption_vi" text`);
    }

}
