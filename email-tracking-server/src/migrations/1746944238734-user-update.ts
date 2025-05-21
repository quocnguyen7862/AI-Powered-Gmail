import { MigrationInterface, QueryRunner } from "typeorm";

export class UserUpdate1746944238734 implements MigrationInterface {
    name = 'UserUpdate1746944238734'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "code"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "code" character varying`);
    }

}
