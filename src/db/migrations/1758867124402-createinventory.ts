import { MigrationInterface, QueryRunner } from "typeorm";

export class Createinventory1758867124402 implements MigrationInterface {
    name = 'Createinventory1758867124402'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "warehouses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "address" character varying, CONSTRAINT "PK_56ae21ee2432b2270b48867e4be" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "stockreceiptdetails" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "quantity" integer NOT NULL, "unitCost" numeric(12,2) NOT NULL, "receipt_id" uuid, "product_id" uuid, CONSTRAINT "PK_65f6f7d65e0d71e0b921283fcf6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "stockreceipts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "receiptDate" TIMESTAMP NOT NULL, "receivedBy" uuid NOT NULL, "totalValue" numeric(14,2) NOT NULL, "warehouse_id" uuid, CONSTRAINT "PK_1a1c4d7234c8e8e74086843a2f9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "stockissues" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "orderId" uuid, "issueDate" TIMESTAMP NOT NULL, "issuedBy" uuid NOT NULL, "warehouse_id" uuid, CONSTRAINT "PK_a43871787707d42d35984f89e5d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "stockissuedetails" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "quantity" integer NOT NULL, "issue_id" uuid, "product_id" uuid, CONSTRAINT "PK_4ba5ae0050e686e65d603b1d7bc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "inventory" ("product_id" uuid NOT NULL, "stock" integer NOT NULL DEFAULT '0', "low_stock_threshold" integer NOT NULL DEFAULT '10', CONSTRAINT "PK_732fdb1f76432d65d2c136340dc" PRIMARY KEY ("product_id"))`);
        await queryRunner.query(`CREATE TABLE "inventorycheckdetails" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "systemQuantity" integer NOT NULL, "actualQuantity" integer NOT NULL, "variance" integer NOT NULL, "check_id" uuid, "product_id" uuid, CONSTRAINT "PK_5bea829522ca9db56d85f3f6b5f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "inventorychecks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "checkDate" TIMESTAMP NOT NULL, "checkedBy" uuid NOT NULL, "warehouse_id" uuid, CONSTRAINT "PK_80b11f3d55c11d7c0a81f92a23f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "stockreceiptdetails" ADD CONSTRAINT "FK_86850755396a05b9ef6a911e530" FOREIGN KEY ("receipt_id") REFERENCES "stockreceipts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stockreceiptdetails" ADD CONSTRAINT "FK_45ab9086fbe954fc26a3fbde9c0" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stockreceipts" ADD CONSTRAINT "FK_9f175e865a0143bbcac4815c5ab" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stockissues" ADD CONSTRAINT "FK_218cfd5922fa8511e098b251d6b" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stockissuedetails" ADD CONSTRAINT "FK_4b9b6e2a435c44f420d9ab6de07" FOREIGN KEY ("issue_id") REFERENCES "stockissues"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stockissuedetails" ADD CONSTRAINT "FK_7b0c9c326091850ea871bf16d15" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "inventory" ADD CONSTRAINT "FK_732fdb1f76432d65d2c136340dc" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "inventorycheckdetails" ADD CONSTRAINT "FK_040db7e0d47bcb72ecaea03eddb" FOREIGN KEY ("check_id") REFERENCES "inventorychecks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "inventorycheckdetails" ADD CONSTRAINT "FK_f746dad3ccace277c774e0daad4" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "inventorychecks" ADD CONSTRAINT "FK_43642989278f2f163a3948eae77" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "inventorychecks" DROP CONSTRAINT "FK_43642989278f2f163a3948eae77"`);
        await queryRunner.query(`ALTER TABLE "inventorycheckdetails" DROP CONSTRAINT "FK_f746dad3ccace277c774e0daad4"`);
        await queryRunner.query(`ALTER TABLE "inventorycheckdetails" DROP CONSTRAINT "FK_040db7e0d47bcb72ecaea03eddb"`);
        await queryRunner.query(`ALTER TABLE "inventory" DROP CONSTRAINT "FK_732fdb1f76432d65d2c136340dc"`);
        await queryRunner.query(`ALTER TABLE "stockissuedetails" DROP CONSTRAINT "FK_7b0c9c326091850ea871bf16d15"`);
        await queryRunner.query(`ALTER TABLE "stockissuedetails" DROP CONSTRAINT "FK_4b9b6e2a435c44f420d9ab6de07"`);
        await queryRunner.query(`ALTER TABLE "stockissues" DROP CONSTRAINT "FK_218cfd5922fa8511e098b251d6b"`);
        await queryRunner.query(`ALTER TABLE "stockreceipts" DROP CONSTRAINT "FK_9f175e865a0143bbcac4815c5ab"`);
        await queryRunner.query(`ALTER TABLE "stockreceiptdetails" DROP CONSTRAINT "FK_45ab9086fbe954fc26a3fbde9c0"`);
        await queryRunner.query(`ALTER TABLE "stockreceiptdetails" DROP CONSTRAINT "FK_86850755396a05b9ef6a911e530"`);
        await queryRunner.query(`DROP TABLE "inventorychecks"`);
        await queryRunner.query(`DROP TABLE "inventorycheckdetails"`);
        await queryRunner.query(`DROP TABLE "inventory"`);
        await queryRunner.query(`DROP TABLE "stockissuedetails"`);
        await queryRunner.query(`DROP TABLE "stockissues"`);
        await queryRunner.query(`DROP TABLE "stockreceipts"`);
        await queryRunner.query(`DROP TABLE "stockreceiptdetails"`);
        await queryRunner.query(`DROP TABLE "warehouses"`);
    }

}
