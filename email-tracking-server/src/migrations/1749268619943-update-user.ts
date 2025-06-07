import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUser1749268619943 implements MigrationInterface {
    name = 'UpdateUser1749268619943'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "lastHistoryId" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "lastHistoryId"`);
    }

}
