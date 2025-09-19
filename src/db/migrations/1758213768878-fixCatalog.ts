import { MigrationInterface, QueryRunner } from "typeorm";

export class FixCatalog1758213768878 implements MigrationInterface {
    name = 'FixCatalog1758213768878'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "FK_9a6f051e66982b5f0318981bcaa"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_ff56834e735fa78a15d0cf21926"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_ea86d0c514c4ecbb5694cbf57df"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "parentId"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "categoryId"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "brandId"`);
        await queryRunner.query(`ALTER TABLE "brands" ADD "description" character varying`);
        await queryRunner.query(`ALTER TABLE "brands" ADD "logoUrl" character varying`);
        await queryRunner.query(`ALTER TABLE "brands" ADD "websiteUrl" character varying`);
        await queryRunner.query(`ALTER TABLE "categories" ADD "description" character varying`);
        await queryRunner.query(`ALTER TABLE "categories" ADD "parent_id" uuid`);
        await queryRunner.query(`ALTER TABLE "products" ADD "category_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "products" ADD "brand_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "brands" ADD CONSTRAINT "UQ_96db6bbbaa6f23cad26871339b6" UNIQUE ("name")`);
        await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878" UNIQUE ("name")`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "image"`);
        await queryRunner.query(`ALTER TABLE "products" ADD "image" character varying`);
        await queryRunner.query(`CREATE INDEX "IDX_96db6bbbaa6f23cad26871339b" ON "brands" ("name") `);
        await queryRunner.query(`CREATE INDEX "IDX_8b0be371d28245da6e4f4b6187" ON "categories" ("name") `);
        await queryRunner.query(`CREATE INDEX "IDX_4dcd2cd0cf988da1681469a0f4" ON "products" ("is_active") `);
        await queryRunner.query(`CREATE INDEX "IDX_75895eeb1903f8a17816dafe0a" ON "products" ("price") `);
        await queryRunner.query(`CREATE INDEX "IDX_4c9fb58de893725258746385e1" ON "products" ("name") `);
        await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "FK_88cea2dc9c31951d06437879b40" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_9a5f6868c96e0069e699f33e124" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_1530a6f15d3c79d1b70be98f2be" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_1530a6f15d3c79d1b70be98f2be"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_9a5f6868c96e0069e699f33e124"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "FK_88cea2dc9c31951d06437879b40"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4c9fb58de893725258746385e1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_75895eeb1903f8a17816dafe0a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4dcd2cd0cf988da1681469a0f4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8b0be371d28245da6e4f4b6187"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_96db6bbbaa6f23cad26871339b"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "image"`);
        await queryRunner.query(`ALTER TABLE "products" ADD "image" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878"`);
        await queryRunner.query(`ALTER TABLE "brands" DROP CONSTRAINT "UQ_96db6bbbaa6f23cad26871339b6"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "brand_id"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "category_id"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "parent_id"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "brands" DROP COLUMN "websiteUrl"`);
        await queryRunner.query(`ALTER TABLE "brands" DROP COLUMN "logoUrl"`);
        await queryRunner.query(`ALTER TABLE "brands" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "products" ADD "brandId" uuid`);
        await queryRunner.query(`ALTER TABLE "products" ADD "categoryId" uuid`);
        await queryRunner.query(`ALTER TABLE "categories" ADD "parentId" uuid`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_ea86d0c514c4ecbb5694cbf57df" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_ff56834e735fa78a15d0cf21926" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "FK_9a6f051e66982b5f0318981bcaa" FOREIGN KEY ("parentId") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
