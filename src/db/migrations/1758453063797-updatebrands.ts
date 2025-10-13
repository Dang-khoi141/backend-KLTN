import { MigrationInterface, QueryRunner } from 'typeorm';

export class Updatebrands1758453063797 implements MigrationInterface {
  name = 'Updatebrands1758453063797';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "order_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "quantity" integer NOT NULL, "unit_price" numeric(10,2) NOT NULL, "order_id" uuid, "product_id" uuid, CONSTRAINT "PK_005269d8574e6fac0493715c308" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" character varying(20) NOT NULL DEFAULT 'PENDING', "total" numeric(10,2) NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "cart_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "quantity" integer NOT NULL DEFAULT '1', "unit_price" numeric(10,2), "cart_id" uuid, "product_id" uuid, CONSTRAINT "PK_6fccf5ec03c172d27a28a82928b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "carts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, CONSTRAINT "PK_b5f695a59f5ebb50af3c8160816" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "brands" DROP COLUMN "description"`);
    await queryRunner.query(`ALTER TABLE "brands" DROP COLUMN "logoUrl"`);
    await queryRunner.query(`ALTER TABLE "brands" DROP COLUMN "websiteUrl"`);
    await queryRunner.query(
      `ALTER TABLE "brands" ADD "contact_name" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "brands" ADD "phone" character varying(20)`,
    );
    await queryRunner.query(
      `ALTER TABLE "brands" ADD "email" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "brands" ADD "address" character varying(500)`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_96db6bbbaa6f23cad26871339b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "brands" DROP CONSTRAINT "UQ_96db6bbbaa6f23cad26871339b6"`,
    );
    await queryRunner.query(`ALTER TABLE "brands" DROP COLUMN "name"`);
    await queryRunner.query(
      `ALTER TABLE "brands" ADD "name" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "brands" ADD CONSTRAINT "UQ_96db6bbbaa6f23cad26871339b6" UNIQUE ("name")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_96db6bbbaa6f23cad26871339b" ON "brands" ("name") `,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "FK_145532db85752b29c57d2b7b1f1" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "FK_9263386c35b6b242540f9493b00" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "FK_a922b820eeef29ac1c6800e826a" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD CONSTRAINT "FK_6385a745d9e12a89b859bb25623" FOREIGN KEY ("cart_id") REFERENCES "carts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD CONSTRAINT "FK_30e89257a105eab7648a35c7fce" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "carts" ADD CONSTRAINT "FK_2ec1c94a977b940d85a4f498aea" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "carts" DROP CONSTRAINT "FK_2ec1c94a977b940d85a4f498aea"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" DROP CONSTRAINT "FK_30e89257a105eab7648a35c7fce"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" DROP CONSTRAINT "FK_6385a745d9e12a89b859bb25623"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "FK_a922b820eeef29ac1c6800e826a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "FK_9263386c35b6b242540f9493b00"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "FK_145532db85752b29c57d2b7b1f1"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_96db6bbbaa6f23cad26871339b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "brands" DROP CONSTRAINT "UQ_96db6bbbaa6f23cad26871339b6"`,
    );
    await queryRunner.query(`ALTER TABLE "brands" DROP COLUMN "name"`);
    await queryRunner.query(
      `ALTER TABLE "brands" ADD "name" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "brands" ADD CONSTRAINT "UQ_96db6bbbaa6f23cad26871339b6" UNIQUE ("name")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_96db6bbbaa6f23cad26871339b" ON "brands" ("name") `,
    );
    await queryRunner.query(`ALTER TABLE "brands" DROP COLUMN "address"`);
    await queryRunner.query(`ALTER TABLE "brands" DROP COLUMN "email"`);
    await queryRunner.query(`ALTER TABLE "brands" DROP COLUMN "phone"`);
    await queryRunner.query(`ALTER TABLE "brands" DROP COLUMN "contact_name"`);
    await queryRunner.query(
      `ALTER TABLE "brands" ADD "websiteUrl" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "brands" ADD "logoUrl" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "brands" ADD "description" character varying`,
    );
    await queryRunner.query(`DROP TABLE "carts"`);
    await queryRunner.query(`DROP TABLE "cart_items"`);
    await queryRunner.query(`DROP TABLE "orders"`);
    await queryRunner.query(`DROP TABLE "order_items"`);
  }
}
