import { MigrationInterface, QueryRunner } from "typeorm";

export class Model1747663012938 implements MigrationInterface {
    name = 'Model1747663012938'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "models" ("id" SERIAL NOT NULL, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "userId" character varying NOT NULL, "model" character varying NOT NULL, "modelProvider" character varying NOT NULL, "apiKey" character varying NOT NULL, CONSTRAINT "PK_ef9ed7160ea69013636466bf2d5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "models" ADD CONSTRAINT "FK_bd0eee09c3dde57cc3b9ac1512a" FOREIGN KEY ("userId") REFERENCES "users"("userId") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "models" DROP CONSTRAINT "FK_bd0eee09c3dde57cc3b9ac1512a"`);
        await queryRunner.query(`DROP TABLE "models"`);
    }

}
