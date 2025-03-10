import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTracking1741613311819 implements MigrationInterface {
    name = 'UpdateTracking1741613311819'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tracking" ADD "userId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tracking" ADD "isRead" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "tracking" ADD "isSent" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "tracking" ADD CONSTRAINT "UQ_9266f38223125833cc30ccc9552" UNIQUE ("emailId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tracking" DROP CONSTRAINT "UQ_9266f38223125833cc30ccc9552"`);
        await queryRunner.query(`ALTER TABLE "tracking" DROP COLUMN "isSent"`);
        await queryRunner.query(`ALTER TABLE "tracking" DROP COLUMN "isRead"`);
        await queryRunner.query(`ALTER TABLE "tracking" DROP COLUMN "userId"`);
    }

}
