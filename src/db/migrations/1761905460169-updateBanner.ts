import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateBanner1761905460169 implements MigrationInterface {
    name = 'UpdateBanner1761905460169'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "banners" DROP CONSTRAINT "FK_51b08ec8fb6e2879cc27ac36e9f"`);
        await queryRunner.query(`ALTER TABLE "banners" DROP COLUMN "title"`);
        await queryRunner.query(`ALTER TABLE "banners" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "banners" DROP COLUMN "mobileImageUrl"`);
        await queryRunner.query(`ALTER TABLE "banners" DROP COLUMN "backgroundColor"`);
        await queryRunner.query(`ALTER TABLE "banners" DROP COLUMN "textColor"`);
        await queryRunner.query(`ALTER TABLE "banners" DROP COLUMN "promotionId"`);
        await queryRunner.query(`ALTER TABLE "banners" DROP COLUMN "startDate"`);
        await queryRunner.query(`ALTER TABLE "banners" DROP COLUMN "endDate"`);
        await queryRunner.query(`ALTER TYPE "public"."banners_placement_enum" RENAME TO "banners_placement_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."banners_placement_enum" AS ENUM('hero_slider', 'sidebar', 'popup')`);
        await queryRunner.query(`ALTER TABLE "banners" ALTER COLUMN "placement" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "banners" ALTER COLUMN "placement" TYPE "public"."banners_placement_enum" USING "placement"::"text"::"public"."banners_placement_enum"`);
        await queryRunner.query(`ALTER TABLE "banners" ALTER COLUMN "placement" SET DEFAULT 'hero_slider'`);
        await queryRunner.query(`DROP TYPE "public"."banners_placement_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."banners_placement_enum_old" AS ENUM('hero_slider', 'sidebar', 'popup', 'category')`);
        await queryRunner.query(`ALTER TABLE "banners" ALTER COLUMN "placement" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "banners" ALTER COLUMN "placement" TYPE "public"."banners_placement_enum_old" USING "placement"::"text"::"public"."banners_placement_enum_old"`);
        await queryRunner.query(`ALTER TABLE "banners" ALTER COLUMN "placement" SET DEFAULT 'hero_slider'`);
        await queryRunner.query(`DROP TYPE "public"."banners_placement_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."banners_placement_enum_old" RENAME TO "banners_placement_enum"`);
        await queryRunner.query(`ALTER TABLE "banners" ADD "endDate" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "banners" ADD "startDate" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "banners" ADD "promotionId" uuid`);
        await queryRunner.query(`ALTER TABLE "banners" ADD "textColor" character varying(50)`);
        await queryRunner.query(`ALTER TABLE "banners" ADD "backgroundColor" character varying(50)`);
        await queryRunner.query(`ALTER TABLE "banners" ADD "mobileImageUrl" character varying(500)`);
        await queryRunner.query(`ALTER TABLE "banners" ADD "description" text`);
        await queryRunner.query(`ALTER TABLE "banners" ADD "title" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "banners" ADD CONSTRAINT "FK_51b08ec8fb6e2879cc27ac36e9f" FOREIGN KEY ("promotionId") REFERENCES "promotions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
