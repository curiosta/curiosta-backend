import { MigrationInterface, QueryRunner } from "typeorm"

export class DeletedCustomer1696512365971 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE IF NOT EXISTS "deleted_customer" (
            "id" character varying NOT NULL,
            "email" character varying NOT NULL,
            "first_name" character varying NOT NULL,
            "last_name" character varying NOT NULL,
            "billing_address_id" character varying NOT NULL,
            "password_hash" character varying NOT NULL,
            "phone" character varying NOT NULL,
            "has_account" boolean NOT NULL,
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "metadata" jsonb,
            PRIMARY KEY ("id"),
            CONSTRAINT "FK_deleted_customer_billing_address_id" FOREIGN KEY ("billing_address_id") REFERENCES "address"("id"))`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
