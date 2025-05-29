import { MigrationInterface, QueryRunner } from "typeorm";

export class Label1748137403904 implements MigrationInterface {
    name = 'Label1748137403904'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "labels" ("id" SERIAL NOT NULL, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "name" character varying NOT NULL, "description" character varying NOT NULL, "color" character varying, "userId" character varying NOT NULL, CONSTRAINT "PK_c0c4e97f76f1f3a268c7a70b925" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "labels" ADD CONSTRAINT "FK_f31f88025417e09223ea9a66b0b" FOREIGN KEY ("userId") REFERENCES "users"("userId") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "labels" DROP CONSTRAINT "FK_f31f88025417e09223ea9a66b0b"`);
        await queryRunner.query(`DROP TABLE "labels"`);
    }

}
