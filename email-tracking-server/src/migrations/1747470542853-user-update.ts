import { MigrationInterface, QueryRunner } from "typeorm";

export class UserUpdate1747470542853 implements MigrationInterface {
    name = 'UserUpdate1747470542853'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "id_token" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "refreshTokenExpiresIn" integer`);
        await queryRunner.query(`ALTER TABLE "users" ADD "scopes" text`);
        await queryRunner.query(`ALTER TABLE "users" ADD "tokenType" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "tokenType"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "scopes"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "refreshTokenExpiresIn"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "id_token"`);
    }

}
