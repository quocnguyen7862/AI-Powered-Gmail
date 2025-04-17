import { MigrationInterface, QueryRunner } from "typeorm";

export class UserUpdate1744902156103 implements MigrationInterface {
    name = 'UserUpdate1744902156103'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "sessionId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_b0e7bc1c369a84a77ed966c9fd7" UNIQUE ("sessionId")`);
        await queryRunner.query(`ALTER TABLE "users" ADD "expiresAt" TIMESTAMP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "expiresAt"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_b0e7bc1c369a84a77ed966c9fd7"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "sessionId"`);
    }

}
