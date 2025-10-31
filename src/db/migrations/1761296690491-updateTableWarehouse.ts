import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTableWarehouse1761296690491 implements MigrationInterface {
  name = 'UpdateTableWarehouse1761296690491';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "warehouses" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "warehouses" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "warehouses" DROP COLUMN "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "warehouses" DROP COLUMN "created_at"`,
    );
  }
}
