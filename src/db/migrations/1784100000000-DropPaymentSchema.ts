import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropPaymentSchema1784100000000 implements MigrationInterface {
  name = 'DropPaymentSchema1784100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "COMIC_TRANSACTION" DROP CONSTRAINT IF EXISTS "FK_dea49ffac6936d49ae14d69ecec"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "COMIC_TRANSACTION"`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."COMIC_TRANSACTION_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."COMIC_TRANSACTION_status_enum"`,
    );

    await queryRunner.query(
      `ALTER TABLE "COMIC_USER" DROP COLUMN IF EXISTS "credits_balance"`,
    );
    await queryRunner.query(
      `ALTER TABLE "COMIC_USER" DROP COLUMN IF EXISTS "subscription_tier"`,
    );
    await queryRunner.query(
      `ALTER TABLE "COMIC_USER" DROP COLUMN IF EXISTS "subscription_renews_at"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."COMIC_USER_subscription_tier_enum"`,
    );

    await queryRunner.query(
      `ALTER TABLE "COMIC_PROJECT" DROP COLUMN IF EXISTS "credits_used"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."COMIC_USER_subscription_tier_enum" AS ENUM('FREE', 'BASIC', 'PRO', 'ENTERPRISE')`,
    );
    await queryRunner.query(
      `ALTER TABLE "COMIC_USER" ADD "subscription_tier" "public"."COMIC_USER_subscription_tier_enum" NOT NULL DEFAULT 'FREE'`,
    );
    await queryRunner.query(
      `ALTER TABLE "COMIC_USER" ADD "subscription_renews_at" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "COMIC_USER" ADD "credits_balance" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "COMIC_PROJECT" ADD "credits_used" integer NOT NULL DEFAULT '0'`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."COMIC_TRANSACTION_type_enum" AS ENUM('TOP_UP', 'REFUND', 'DEDUCTION')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."COMIC_TRANSACTION_status_enum" AS ENUM('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "COMIC_TRANSACTION" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "amount" numeric(10,2) NOT NULL, "type" "public"."COMIC_TRANSACTION_type_enum" NOT NULL, "status" "public"."COMIC_TRANSACTION_status_enum" NOT NULL DEFAULT 'PENDING', "payment_gateway_ref" character varying(255), "credit_delta" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_0b5e30b7e65f0f53565caa59cec" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "COMIC_TRANSACTION" ADD CONSTRAINT "FK_dea49ffac6936d49ae14d69ecec" FOREIGN KEY ("user_id") REFERENCES "COMIC_USER"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
