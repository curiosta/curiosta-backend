import { MigrationInterface, QueryRunner } from "typeorm"

export class UpdateFieldDeleteCustomer1696520782799 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "deleted_customer" ALTER COLUMN "phone" DROP NOT NULL`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
