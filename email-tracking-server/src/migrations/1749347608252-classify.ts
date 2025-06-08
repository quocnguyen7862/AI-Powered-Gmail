import { MigrationInterface, QueryRunner } from "typeorm";

export class Classify1749347608252 implements MigrationInterface {
    name = 'Classify1749347608252'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "classifies" ("id" SERIAL NOT NULL, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "messageId" character varying NOT NULL, "labelId" integer NOT NULL, CONSTRAINT "PK_92d44791341f14518a22190070f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "classifies" ADD CONSTRAINT "FK_fa6f7c41c1c2f85d36117e65d49" FOREIGN KEY ("labelId") REFERENCES "labels"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "classifies" DROP CONSTRAINT "FK_fa6f7c41c1c2f85d36117e65d49"`);
        await queryRunner.query(`DROP TABLE "classifies"`);
    }

}
