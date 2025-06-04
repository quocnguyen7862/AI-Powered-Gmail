import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUser1748776149554 implements MigrationInterface {
    name = 'UpdateUser1748776149554'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "enabledTracking" boolean NOT NULL DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "enabledTracking"`);
    }

}
