CREATE TABLE `sync_tokens` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sync_token` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP)
);
