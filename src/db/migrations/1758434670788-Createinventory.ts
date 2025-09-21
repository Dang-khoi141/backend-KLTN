import { MigrationInterface, QueryRunner } from "typeorm";

export class Createinventory1758434670788 implements MigrationInterface {
    name = 'Createinventory1758434670788'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE VIEW "inventory_report_entity" AS 
    SELECT 
      p.id as "product_id",
      p.name as "product_name",
      b.name as "brand_name",
      c.name as "category_name",
      i.stock as "stock",
      i.low_stock_threshold as "low_stock_threshold"
    FROM products p
    JOIN inventory i ON i.product_id = p.id
    LEFT JOIN brands b ON b.id = p.brand_id
    LEFT JOIN categories c ON c.id = p.category_id
  `);
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`, ["public","VIEW","inventory_report_entity","SELECT \n      p.id as \"product_id\",\n      p.name as \"product_name\",\n      b.name as \"brand_name\",\n      c.name as \"category_name\",\n      i.stock as \"stock\",\n      i.low_stock_threshold as \"low_stock_threshold\"\n    FROM products p\n    JOIN inventory i ON i.product_id = p.id\n    LEFT JOIN brands b ON b.id = p.brand_id\n    LEFT JOIN categories c ON c.id = p.category_id"]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`, ["VIEW","inventory_report_entity","public"]);
        await queryRunner.query(`DROP VIEW "inventory_report_entity"`);
    }

}
