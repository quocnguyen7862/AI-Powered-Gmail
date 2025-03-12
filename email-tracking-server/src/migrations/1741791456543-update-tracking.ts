import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTracking1741791456543 implements MigrationInterface {
    name = 'UpdateTracking1741791456543'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tracking" ADD "trackingId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tracking" ADD CONSTRAINT "UQ_3d123d2c415a67fde1bc89bc750" UNIQUE ("trackingId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tracking" DROP CONSTRAINT "UQ_3d123d2c415a67fde1bc89bc750"`);
        await queryRunner.query(`ALTER TABLE "tracking" DROP COLUMN "trackingId"`);
    }

}
