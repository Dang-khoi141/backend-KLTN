import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTableOrder1760324376841 implements MigrationInterface {
    name = 'UpdateTableOrder1760324376841'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ADD "order_number" character varying(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "UQ_75eba1c6b1a66b09f2a97e6927b" UNIQUE ("order_number")`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "payment_method" character varying(50) NOT NULL DEFAULT 'COD'`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "shipping_address" text`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "notes" text`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "payos_order_code" integer`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "status"`);
        await queryRunner.query(`CREATE TYPE "public"."orders_status_enum" AS ENUM('PENDING', 'PAID', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELED')`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "status" "public"."orders_status_enum" NOT NULL DEFAULT 'PENDING'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."orders_status_enum"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "status" character varying(20) NOT NULL DEFAULT 'PENDING'`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "payos_order_code"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "notes"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "shipping_address"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "payment_method"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "UQ_75eba1c6b1a66b09f2a97e6927b"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "order_number"`);
    }

}
