import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateModel1747761730685 implements MigrationInterface {
    name = 'UpdateModel1747761730685'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "models" ADD "apiKeyType" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "models" ADD CONSTRAINT "UQ_db548fbeca426bd79a497ce90b1" UNIQUE ("apiKey")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "models" DROP CONSTRAINT "UQ_db548fbeca426bd79a497ce90b1"`);
        await queryRunner.query(`ALTER TABLE "models" DROP COLUMN "apiKeyType"`);
    }

}
