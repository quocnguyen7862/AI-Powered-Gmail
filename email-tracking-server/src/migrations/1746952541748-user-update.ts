import { MigrationInterface, QueryRunner } from "typeorm";

export class UserUpdate1746952541748 implements MigrationInterface {
    name = 'UserUpdate1746952541748'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "accessToken" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "accessToken" SET NOT NULL`);
    }

}
