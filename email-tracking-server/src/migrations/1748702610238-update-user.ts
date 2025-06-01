import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUser1748702610238 implements MigrationInterface {
    name = 'UpdateUser1748702610238'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "summaryLanguage" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "summaryLanguage"`);
    }

}
