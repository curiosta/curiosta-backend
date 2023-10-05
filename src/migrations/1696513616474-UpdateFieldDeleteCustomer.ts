import { MigrationInterface, QueryRunner } from "typeorm"

export class UpdateFieldDeleteCustomer1696513616474 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "deleted_customer" ALTER COLUMN "billing_address_id" DROP NOT NULL`
        );
    }
    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
