import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropComicCharacter1784100000001 implements MigrationInterface {
  name = 'DropComicCharacter1784100000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "COMIC_CHARACTER" DROP CONSTRAINT IF EXISTS "FK_46dd428b0f27138acc9254157c6"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "COMIC_CHARACTER"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "COMIC_CHARACTER" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "project_id" uuid NOT NULL, "name" character varying(255) NOT NULL, "appearance_desc" text, "clothing_desc" text, "reference_image_url" character varying(500), CONSTRAINT "PK_c77cf4758617a64611e1386e8e7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "COMIC_CHARACTER" ADD CONSTRAINT "FK_46dd428b0f27138acc9254157c6" FOREIGN KEY ("project_id") REFERENCES "COMIC_PROJECT"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
