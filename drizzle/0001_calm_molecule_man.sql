PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`name` text NOT NULL,
	`archived` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	CONSTRAINT "categories_type_check" CHECK("__new_categories"."type" in ('income', 'expense'))
);
--> statement-breakpoint
INSERT INTO `__new_categories`("id", "type", "name", "archived", "created_at") SELECT "id", "type", "name", "archived", "created_at" FROM `categories`;--> statement-breakpoint
DROP TABLE `categories`;--> statement-breakpoint
ALTER TABLE `__new_categories` RENAME TO `categories`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `categories_type_name_idx` ON `categories` (`type`,`name`);--> statement-breakpoint
CREATE TABLE `__new_transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`item_id` integer NOT NULL,
	`type` text NOT NULL,
	`amount_cents` integer NOT NULL,
	`month` text NOT NULL,
	`note` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "transactions_type_check" CHECK("__new_transactions"."type" in ('income', 'expense')),
	CONSTRAINT "transactions_amount_positive" CHECK("__new_transactions"."amount_cents" > 0),
	CONSTRAINT "transactions_month_format" CHECK(length("__new_transactions"."month") = 7
      and substr("__new_transactions"."month", 5, 1) = '-'
      and cast(substr("__new_transactions"."month", 1, 4) as integer) between 1900 and 2100
      and cast(substr("__new_transactions"."month", 6, 2) as integer) between 1 and 12)
);
--> statement-breakpoint
INSERT INTO `__new_transactions`("id", "item_id", "type", "amount_cents", "month", "note", "created_at") SELECT "id", "item_id", "type", "amount_cents", "month", "note", "created_at" FROM `transactions`;--> statement-breakpoint
DROP TABLE `transactions`;--> statement-breakpoint
ALTER TABLE `__new_transactions` RENAME TO `transactions`;