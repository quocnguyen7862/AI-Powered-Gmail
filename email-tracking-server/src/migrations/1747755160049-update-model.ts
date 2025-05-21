import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateModel1747755160049 implements MigrationInterface {
    name = 'UpdateModel1747755160049'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "models" ADD "name" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "models" DROP COLUMN "name"`);
    }

}
