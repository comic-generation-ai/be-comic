import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterAvatarUrlToText1784098300000 implements MigrationInterface {
  name = 'AlterAvatarUrlToText1784098300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "COMIC_USER" ALTER COLUMN "avatar_url" TYPE text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "COMIC_USER" ALTER COLUMN "avatar_url" TYPE character varying(255)`,
    );
  }
}
