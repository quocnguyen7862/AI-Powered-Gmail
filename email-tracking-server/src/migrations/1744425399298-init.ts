import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1744425399298 implements MigrationInterface {
    name = 'Init1744425399298'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "readed" ("id" SERIAL NOT NULL, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "trackingId" character varying NOT NULL, "isRead" boolean NOT NULL DEFAULT false, "readedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_ebfbeb435abfcf8bf1a9941b86f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tracking" ("id" SERIAL NOT NULL, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "userId" character varying NOT NULL, "userAddress" character varying NOT NULL, "messageId" character varying NOT NULL, "threadId" character varying NOT NULL, "trackingId" character varying NOT NULL, "isSent" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_261e536c45e64a47e1164d1f4cb" UNIQUE ("threadId"), CONSTRAINT "UQ_3d123d2c415a67fde1bc89bc750" UNIQUE ("trackingId"), CONSTRAINT "PK_c6d380f3abe9852840e5aff1439" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "readed" ADD CONSTRAINT "FK_37fb8fd73fa745bf43641d8cf8e" FOREIGN KEY ("trackingId") REFERENCES "tracking"("trackingId") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "readed" DROP CONSTRAINT "FK_37fb8fd73fa745bf43641d8cf8e"`);
        await queryRunner.query(`DROP TABLE "tracking"`);
        await queryRunner.query(`DROP TABLE "readed"`);
    }

}
