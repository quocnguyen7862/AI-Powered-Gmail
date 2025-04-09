import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTracking1744207605575 implements MigrationInterface {
    name = 'UpdateTracking1744207605575'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tracking" ADD "isRead" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tracking" DROP COLUMN "isRead"`);
    }

}
