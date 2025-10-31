import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePromotion1760629371314 implements MigrationInterface {
  name = 'CreatePromotion1760629371314';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "promotions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying NOT NULL, "description" character varying(255), "discountPercent" numeric(5,2), "discountAmount" numeric(10,0), "minOrderValue" numeric(10,0), "startDate" TIMESTAMP, "endDate" TIMESTAMP, "isActive" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_8ab10e580f70c3d2e2e4b31ebf2" UNIQUE ("code"), CONSTRAINT "PK_380cecbbe3ac11f0e5a7c452c34" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "discountAmount" numeric(10,0)`,
    );
    await queryRunner.query(`ALTER TABLE "orders" ADD "promotion_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "FK_ef840932f45535891306fc3f327" FOREIGN KEY ("promotion_id") REFERENCES "promotions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "FK_ef840932f45535891306fc3f327"`,
    );
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "promotion_id"`);
    await queryRunner.query(
      `ALTER TABLE "orders" DROP COLUMN "discountAmount"`,
    );
    await queryRunner.query(`DROP TABLE "promotions"`);
  }
}
