import { MigrationInterface, QueryRunner } from "typeorm";

export class Classify1749353800063 implements MigrationInterface {
    name = 'Classify1749353800063'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "classifies" ADD CONSTRAINT "UQ_6ff0fb159c7233a7166710da671" UNIQUE ("messageId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "classifies" DROP CONSTRAINT "UQ_6ff0fb159c7233a7166710da671"`);
    }

}
