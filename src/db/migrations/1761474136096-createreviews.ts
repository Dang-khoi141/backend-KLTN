import { MigrationInterface, QueryRunner } from "typeorm";

export class Createreviews1761474136096 implements MigrationInterface {
    name = 'Createreviews1761474136096'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "reviews" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "rating" integer NOT NULL, "comment" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "product_id" uuid, "user_id" uuid, CONSTRAINT "PK_231ae565c273ee700b283f15c1d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "reviews" ADD CONSTRAINT "FK_9482e9567d8dcc2bc615981ef44" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reviews" ADD CONSTRAINT "FK_728447781a30bc3fcfe5c2f1cdf" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reviews" DROP CONSTRAINT "FK_728447781a30bc3fcfe5c2f1cdf"`);
        await queryRunner.query(`ALTER TABLE "reviews" DROP CONSTRAINT "FK_9482e9567d8dcc2bc615981ef44"`);
        await queryRunner.query(`DROP TABLE "reviews"`);
    }

}
