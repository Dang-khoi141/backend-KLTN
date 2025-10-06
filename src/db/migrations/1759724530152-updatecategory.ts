import { MigrationInterface, QueryRunner } from "typeorm";

export class Updatecategory1759724530152 implements MigrationInterface {
    name = 'Updatecategory1759724530152'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "categories" ADD "image_url" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "image_url"`);
    }

}
