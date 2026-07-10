import { MigrationInterface, QueryRunner } from "typeorm";

export class DropOldOrderIndexUnique1783650383764 implements MigrationInterface {
    name = 'DropOldOrderIndexUnique1783650383764'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."idx_comicframe_project_id_order_index"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE UNIQUE INDEX "idx_comicframe_project_id_order_index" ON "COMIC_FRAME" USING btree ("order_index") `);
    }

}
