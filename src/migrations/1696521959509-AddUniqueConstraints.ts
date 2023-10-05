import { MigrationInterface, QueryRunner } from "typeorm"

export class AddUniqueConstraints1696521959509 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE deleted_customer ADD CONSTRAINT unique_email_id_constraint UNIQUE (email, id);`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
