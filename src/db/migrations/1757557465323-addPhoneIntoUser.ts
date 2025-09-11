import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPhoneIntoUser1757557465323 implements MigrationInterface {
    name = 'AddPhoneIntoUser1757557465323'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "phone" integer NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "phone"`);
    }

}
