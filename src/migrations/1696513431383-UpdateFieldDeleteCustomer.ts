import { MigrationInterface, QueryRunner } from "typeorm"

export class UpdateFieldDeleteCustomer1696513431383 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "deleted_customer" ADD COLUMN "deleted_at" TIMESTAMP WITH TIME ZONE`
        );
    }


    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
