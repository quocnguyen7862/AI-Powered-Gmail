import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateReceiver1743611884802 implements MigrationInterface {
    name = 'UpdateReceiver1743611884802'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "receiver" ("id" SERIAL NOT NULL, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "threadId" character varying NOT NULL, "receiverAddress" character varying NOT NULL, "isRead" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_c49c8583f3bebce9c6a3403ed30" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tracking" ("id" SERIAL NOT NULL, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "userId" character varying NOT NULL, "userAddress" character varying NOT NULL, "messageId" character varying NOT NULL, "threadId" character varying NOT NULL, "trackingId" character varying NOT NULL, "isSent" boolean NOT NULL DEFAULT false, "openedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_261e536c45e64a47e1164d1f4cb" UNIQUE ("threadId"), CONSTRAINT "UQ_3d123d2c415a67fde1bc89bc750" UNIQUE ("trackingId"), CONSTRAINT "PK_c6d380f3abe9852840e5aff1439" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "receiver" ADD CONSTRAINT "FK_0dadb7fbae5ae15557a7b5e856a" FOREIGN KEY ("threadId") REFERENCES "tracking"("threadId") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "receiver" DROP CONSTRAINT "FK_0dadb7fbae5ae15557a7b5e856a"`);
        await queryRunner.query(`DROP TABLE "tracking"`);
        await queryRunner.query(`DROP TABLE "receiver"`);
    }

}
