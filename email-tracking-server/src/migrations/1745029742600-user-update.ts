import { MigrationInterface, QueryRunner } from "typeorm";

export class UserUpdate1745029742600 implements MigrationInterface {
    name = 'UserUpdate1745029742600'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "refreshToken" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "expiresAt" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "expiresAt" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "refreshToken" SET NOT NULL`);
    }

}
