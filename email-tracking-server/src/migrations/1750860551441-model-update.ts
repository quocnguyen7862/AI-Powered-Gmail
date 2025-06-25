import { MigrationInterface, QueryRunner } from "typeorm";

export class ModelUpdate1750860551441 implements MigrationInterface {
    name = 'ModelUpdate1750860551441'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "classifies" DROP CONSTRAINT "FK_fa6f7c41c1c2f85d36117e65d49"`);
        await queryRunner.query(`ALTER TABLE "classifies" DROP CONSTRAINT "UQ_fa6f7c41c1c2f85d36117e65d49"`);
        await queryRunner.query(`ALTER TABLE "models" DROP CONSTRAINT "UQ_db548fbeca426bd79a497ce90b1"`);
        await queryRunner.query(`ALTER TABLE "classifies" ADD CONSTRAINT "FK_fa6f7c41c1c2f85d36117e65d49" FOREIGN KEY ("labelId") REFERENCES "labels"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "classifies" DROP CONSTRAINT "FK_fa6f7c41c1c2f85d36117e65d49"`);
        await queryRunner.query(`ALTER TABLE "models" ADD CONSTRAINT "UQ_db548fbeca426bd79a497ce90b1" UNIQUE ("apiKey")`);
        await queryRunner.query(`ALTER TABLE "classifies" ADD CONSTRAINT "UQ_fa6f7c41c1c2f85d36117e65d49" UNIQUE ("labelId")`);
        await queryRunner.query(`ALTER TABLE "classifies" ADD CONSTRAINT "FK_fa6f7c41c1c2f85d36117e65d49" FOREIGN KEY ("labelId") REFERENCES "labels"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

}
