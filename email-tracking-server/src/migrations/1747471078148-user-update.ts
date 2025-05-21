import { MigrationInterface, QueryRunner } from "typeorm";

export class UserUpdate1747471078148 implements MigrationInterface {
    name = 'UserUpdate1747471078148'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "id_token"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "scopes"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "idToken" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "scope" character varying`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "refreshTokenExpiresIn"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "refreshTokenExpiresIn" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "refreshTokenExpiresIn"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "refreshTokenExpiresIn" integer`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "scope"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "idToken"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "scopes" text`);
        await queryRunner.query(`ALTER TABLE "users" ADD "id_token" character varying`);
    }

}
