import { MigrationInterface, QueryRunner } from 'typeorm';

export class Updatecatalog1758337467694 implements MigrationInterface {
  name = 'Updatecatalog1758337467694';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "brands" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying, "logoUrl" character varying, "websiteUrl" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_96db6bbbaa6f23cad26871339b6" UNIQUE ("name"), CONSTRAINT "PK_b0c437120b624da1034a81fc561" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_96db6bbbaa6f23cad26871339b" ON "brands" ("name") `,
    );
    await queryRunner.query(
      `CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "parent_id" uuid, CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878" UNIQUE ("name"), CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8b0be371d28245da6e4f4b6187" ON "categories" ("name") `,
    );
    await queryRunner.query(
      `CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "price" numeric(10,2) NOT NULL, "description" character varying(500), "image" character varying, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "category_id" uuid NOT NULL, "brand_id" uuid NOT NULL, CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4dcd2cd0cf988da1681469a0f4" ON "products" ("is_active") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_75895eeb1903f8a17816dafe0a" ON "products" ("price") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4c9fb58de893725258746385e1" ON "products" ("name") `,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ADD CONSTRAINT "FK_88cea2dc9c31951d06437879b40" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "FK_9a5f6868c96e0069e699f33e124" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "FK_1530a6f15d3c79d1b70be98f2be" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "FK_1530a6f15d3c79d1b70be98f2be"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "FK_9a5f6868c96e0069e699f33e124"`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" DROP CONSTRAINT "FK_88cea2dc9c31951d06437879b40"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4c9fb58de893725258746385e1"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_75895eeb1903f8a17816dafe0a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4dcd2cd0cf988da1681469a0f4"`,
    );
    await queryRunner.query(`DROP TABLE "products"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8b0be371d28245da6e4f4b6187"`,
    );
    await queryRunner.query(`DROP TABLE "categories"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_96db6bbbaa6f23cad26871339b"`,
    );
    await queryRunner.query(`DROP TABLE "brands"`);
  }
}
