import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUser1747935674145 implements MigrationInterface {
    name = 'UpdateUser1747935674145'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "fullName" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "fullName"`);
    }

}
