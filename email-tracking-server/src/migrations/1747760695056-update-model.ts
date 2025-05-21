import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateModel1747760695056 implements MigrationInterface {
    name = 'UpdateModel1747760695056'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "models" ADD "isSelected" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "models" DROP COLUMN "isSelected"`);
    }

}
