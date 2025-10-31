import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateReview1761654032269 implements MigrationInterface {
  name = 'UpdateReview1761654032269';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD "is_verified_purchase" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP COLUMN "is_verified_purchase"`,
    );
  }
}
