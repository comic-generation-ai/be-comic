import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1781493480257 implements MigrationInterface {
    name = 'InitialSchema1781493480257'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."COMIC_TRANSACTION_type_enum" AS ENUM('TOP_UP', 'REFUND', 'DEDUCTION')`);
        await queryRunner.query(`CREATE TYPE "public"."COMIC_TRANSACTION_status_enum" AS ENUM('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED')`);
        await queryRunner.query(`CREATE TABLE "COMIC_TRANSACTION" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "amount" numeric(10,2) NOT NULL, "type" "public"."COMIC_TRANSACTION_type_enum" NOT NULL, "status" "public"."COMIC_TRANSACTION_status_enum" NOT NULL DEFAULT 'PENDING', "payment_gateway_ref" character varying(255), "credit_delta" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_0b5e30b7e65f0f53565caa59cec" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."COMIC_USER_subscription_tier_enum" AS ENUM('FREE', 'BASIC', 'PRO', 'ENTERPRISE')`);
        await queryRunner.query(`CREATE TABLE "COMIC_USER" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(255) NOT NULL, "password_hash" character varying(255) NOT NULL, "subscription_tier" "public"."COMIC_USER_subscription_tier_enum" NOT NULL DEFAULT 'FREE', "credits_balance" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_e8a3a86e5c7e531063d9ae7445f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."COMIC_SPEECH_BUBBLE_bubble_type_enum" AS ENUM('SPEECH', 'THOUGHT', 'NARRATION', 'SHOUT')`);
        await queryRunner.query(`CREATE TABLE "COMIC_SPEECH_BUBBLE" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "frame_id" uuid NOT NULL, "text_content" text NOT NULL, "bubble_type" "public"."COMIC_SPEECH_BUBBLE_bubble_type_enum" NOT NULL, "pos_x" real NOT NULL, "pos_y" real NOT NULL, "width" real NOT NULL, "height" real NOT NULL, "tail_direction" character varying(20), "style_config" jsonb NOT NULL DEFAULT '{}', CONSTRAINT "PK_3e06ec90463c6286a2a798d85ca" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."COMIC_GENERATION_JOB_job_type_enum" AS ENUM('SCRIPT_GENERATION', 'IMAGE_GENERATION', 'LAYOUT_RENDERING')`);
        await queryRunner.query(`CREATE TYPE "public"."COMIC_GENERATION_JOB_status_enum" AS ENUM('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED')`);
        await queryRunner.query(`CREATE TABLE "COMIC_GENERATION_JOB" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "project_id" uuid NOT NULL, "frame_id" uuid, "job_type" "public"."COMIC_GENERATION_JOB_job_type_enum" NOT NULL, "status" "public"."COMIC_GENERATION_JOB_status_enum" NOT NULL, "error_message" text, "retry_count" smallint NOT NULL, "started_at" TIMESTAMP WITH TIME ZONE, "completed_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_b4c93f34617422d3d290deb968a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."COMIC_FRAME_status_enum" AS ENUM('PENDING', 'GENERATING', 'COMPLETED', 'FAILED')`);
        await queryRunner.query(`CREATE TABLE "COMIC_FRAME" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "project_id" uuid NOT NULL, "script_id" uuid, "order_index" smallint NOT NULL, "image_prompt" text, "image_url" character varying(500), "thumbnail_url" character varying(500), "status" "public"."COMIC_FRAME_status_enum" NOT NULL DEFAULT 'PENDING', CONSTRAINT "PK_78983f366d507741f35c9540070" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "idx_comicframe_project_id_order_index" ON "COMIC_FRAME"  ("order_index") `);
        await queryRunner.query(`CREATE TABLE "COMIC_SCRIPT" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "project_id" uuid NOT NULL, "structured_data" jsonb NOT NULL DEFAULT '{}', "version" smallint NOT NULL DEFAULT '1', CONSTRAINT "PK_5e6fa0b1ff2e9e4923f954ca1f1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."COMIC_PROJECT_status_enum" AS ENUM('DRAFT', 'PROCESSING', 'COMPLETED', 'FAILED', 'ARCHIVED')`);
        await queryRunner.query(`CREATE TABLE "COMIC_PROJECT" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "title" character varying(255), "genre" character varying(100), "art_style" character varying(100), "layout_type" character varying(100), "raw_prompt" text NOT NULL, "status" "public"."COMIC_PROJECT_status_enum" NOT NULL DEFAULT 'DRAFT', "credits_used" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_c08a503483800096d67f0e019a9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "COMIC_CHARACTER" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "project_id" uuid NOT NULL, "name" character varying(255) NOT NULL, "appearance_desc" text, "clothing_desc" text, "reference_image_url" character varying(500), CONSTRAINT "PK_c77cf4758617a64611e1386e8e7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "COMIC_TRANSACTION" ADD CONSTRAINT "FK_dea49ffac6936d49ae14d69ecec" FOREIGN KEY ("user_id") REFERENCES "COMIC_USER"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "COMIC_SPEECH_BUBBLE" ADD CONSTRAINT "FK_3ba5f1a3a49a3cdd4a4c051820c" FOREIGN KEY ("frame_id") REFERENCES "COMIC_FRAME"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "COMIC_GENERATION_JOB" ADD CONSTRAINT "FK_23b4b9a4bb44133f6d8b98da041" FOREIGN KEY ("project_id") REFERENCES "COMIC_PROJECT"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "COMIC_GENERATION_JOB" ADD CONSTRAINT "FK_535030cbfb635b5e5eb4e6317e5" FOREIGN KEY ("frame_id") REFERENCES "COMIC_FRAME"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "COMIC_FRAME" ADD CONSTRAINT "FK_3d6611e7223cfab34ce099e6289" FOREIGN KEY ("project_id") REFERENCES "COMIC_PROJECT"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "COMIC_FRAME" ADD CONSTRAINT "FK_db1f1ddaeebd9026d13801c2570" FOREIGN KEY ("script_id") REFERENCES "COMIC_SCRIPT"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "COMIC_SCRIPT" ADD CONSTRAINT "FK_45ea67721dfdcfbb84239022152" FOREIGN KEY ("project_id") REFERENCES "COMIC_PROJECT"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "COMIC_PROJECT" ADD CONSTRAINT "FK_2fc99908a234e3b14ba01ae4b9b" FOREIGN KEY ("user_id") REFERENCES "COMIC_USER"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "COMIC_CHARACTER" ADD CONSTRAINT "FK_46dd428b0f27138acc9254157c6" FOREIGN KEY ("project_id") REFERENCES "COMIC_PROJECT"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "COMIC_CHARACTER" DROP CONSTRAINT "FK_46dd428b0f27138acc9254157c6"`);
        await queryRunner.query(`ALTER TABLE "COMIC_PROJECT" DROP CONSTRAINT "FK_2fc99908a234e3b14ba01ae4b9b"`);
        await queryRunner.query(`ALTER TABLE "COMIC_SCRIPT" DROP CONSTRAINT "FK_45ea67721dfdcfbb84239022152"`);
        await queryRunner.query(`ALTER TABLE "COMIC_FRAME" DROP CONSTRAINT "FK_db1f1ddaeebd9026d13801c2570"`);
        await queryRunner.query(`ALTER TABLE "COMIC_FRAME" DROP CONSTRAINT "FK_3d6611e7223cfab34ce099e6289"`);
        await queryRunner.query(`ALTER TABLE "COMIC_GENERATION_JOB" DROP CONSTRAINT "FK_535030cbfb635b5e5eb4e6317e5"`);
        await queryRunner.query(`ALTER TABLE "COMIC_GENERATION_JOB" DROP CONSTRAINT "FK_23b4b9a4bb44133f6d8b98da041"`);
        await queryRunner.query(`ALTER TABLE "COMIC_SPEECH_BUBBLE" DROP CONSTRAINT "FK_3ba5f1a3a49a3cdd4a4c051820c"`);
        await queryRunner.query(`ALTER TABLE "COMIC_TRANSACTION" DROP CONSTRAINT "FK_dea49ffac6936d49ae14d69ecec"`);
        await queryRunner.query(`DROP TABLE "COMIC_CHARACTER"`);
        await queryRunner.query(`DROP TABLE "COMIC_PROJECT"`);
        await queryRunner.query(`DROP TYPE "public"."COMIC_PROJECT_status_enum"`);
        await queryRunner.query(`DROP TABLE "COMIC_SCRIPT"`);
        await queryRunner.query(`DROP INDEX "public"."idx_comicframe_project_id_order_index"`);
        await queryRunner.query(`DROP TABLE "COMIC_FRAME"`);
        await queryRunner.query(`DROP TYPE "public"."COMIC_FRAME_status_enum"`);
        await queryRunner.query(`DROP TABLE "COMIC_GENERATION_JOB"`);
        await queryRunner.query(`DROP TYPE "public"."COMIC_GENERATION_JOB_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."COMIC_GENERATION_JOB_job_type_enum"`);
        await queryRunner.query(`DROP TABLE "COMIC_SPEECH_BUBBLE"`);
        await queryRunner.query(`DROP TYPE "public"."COMIC_SPEECH_BUBBLE_bubble_type_enum"`);
        await queryRunner.query(`DROP TABLE "COMIC_USER"`);
        await queryRunner.query(`DROP TYPE "public"."COMIC_USER_subscription_tier_enum"`);
        await queryRunner.query(`DROP TABLE "COMIC_TRANSACTION"`);
        await queryRunner.query(`DROP TYPE "public"."COMIC_TRANSACTION_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."COMIC_TRANSACTION_type_enum"`);
    }

}
