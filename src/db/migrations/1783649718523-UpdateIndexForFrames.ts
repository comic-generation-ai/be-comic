import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateIndexForFrames1783649718523 implements MigrationInterface {
    name = 'UpdateIndexForFrames1783649718523'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE UNIQUE INDEX "idx_comicframe_project_order" ON "COMIC_FRAME"  ("project_id", "order_index") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."idx_comicframe_project_order"`);
    }

}
