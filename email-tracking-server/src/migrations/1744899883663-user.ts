import { MigrationInterface, QueryRunner } from "typeorm";

export class User1744899883663 implements MigrationInterface {
    name = 'User1744899883663'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "userId" character varying NOT NULL, "email" character varying NOT NULL, "accessToken" character varying NOT NULL, "refreshToken" character varying NOT NULL, CONSTRAINT "UQ_8bf09ba754322ab9c22a215c919" UNIQUE ("userId"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "tracking" DROP COLUMN "userAddress"`);
        await queryRunner.query(`ALTER TABLE "tracking" ADD CONSTRAINT "FK_f8ebfed851c59339b56222a479e" FOREIGN KEY ("userId") REFERENCES "users"("userId") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tracking" DROP CONSTRAINT "FK_f8ebfed851c59339b56222a479e"`);
        await queryRunner.query(`ALTER TABLE "tracking" ADD "userAddress" character varying NOT NULL`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
