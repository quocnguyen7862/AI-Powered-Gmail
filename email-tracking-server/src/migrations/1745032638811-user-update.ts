import { MigrationInterface, QueryRunner } from "typeorm";

export class UserUpdate1745032638811 implements MigrationInterface {
    name = 'UserUpdate1745032638811'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3"`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_147e4444865ba0462b869220eff" UNIQUE ("userId", "email")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_147e4444865ba0462b869220eff"`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email")`);
    }

}
