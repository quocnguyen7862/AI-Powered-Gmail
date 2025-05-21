import { MigrationInterface, QueryRunner } from "typeorm";

export class UserUpdate1746938078759 implements MigrationInterface {
    name = 'UserUpdate1746938078759'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "code" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "code"`);
    }

}
