import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDiscountPercentage1761823474778 implements MigrationInterface {
  name = 'AddDiscountPercentage1761823474778';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP COLUMN "is_verified_purchase"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD "discount_percentage" numeric(5,2) NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" DROP COLUMN "discount_percentage"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD "is_verified_purchase" boolean NOT NULL DEFAULT false`,
    );
  }
}
