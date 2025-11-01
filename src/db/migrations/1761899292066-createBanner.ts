import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBanner1761899292066 implements MigrationInterface {
    name = 'CreateBanner1761899292066'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."banners_placement_enum" AS ENUM('hero_slider', 'sidebar', 'popup', 'category')`);
        await queryRunner.query(`CREATE TABLE "banners" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(255) NOT NULL, "description" text, "imageUrl" character varying(500) NOT NULL, "mobileImageUrl" character varying(500), "placement" "public"."banners_placement_enum" NOT NULL DEFAULT 'hero_slider', "sortOrder" integer NOT NULL DEFAULT '0', "linkUrl" character varying(500), "backgroundColor" character varying(50), "textColor" character varying(50), "promotionId" uuid, "startDate" TIMESTAMP, "endDate" TIMESTAMP, "isActive" boolean NOT NULL DEFAULT true, "clickCount" integer NOT NULL DEFAULT '0', "viewCount" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e9b186b959296fcb940790d31c3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "reviews" ADD "is_verified_purchase" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "description" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "banners" ADD CONSTRAINT "FK_51b08ec8fb6e2879cc27ac36e9f" FOREIGN KEY ("promotionId") REFERENCES "promotions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "banners" DROP CONSTRAINT "FK_51b08ec8fb6e2879cc27ac36e9f"`);
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "description" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "reviews" DROP COLUMN "is_verified_purchase"`);
        await queryRunner.query(`DROP TABLE "banners"`);
        await queryRunner.query(`DROP TYPE "public"."banners_placement_enum"`);
    }

}
