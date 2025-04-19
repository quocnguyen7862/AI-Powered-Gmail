import { MigrationInterface, QueryRunner } from "typeorm";

export class UserUpdate1745031497315 implements MigrationInterface {
    name = 'UserUpdate1745031497315'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "sessionId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_b0e7bc1c369a84a77ed966c9fd7"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_b0e7bc1c369a84a77ed966c9fd7" UNIQUE ("sessionId")`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "sessionId" SET NOT NULL`);
    }

}
