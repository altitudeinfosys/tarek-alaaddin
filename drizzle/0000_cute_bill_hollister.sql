CREATE TABLE "sends" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_slug" text NOT NULL,
	"post_title" text NOT NULL,
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL,
	"recipient_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sent_to" (
	"subscriber_id" uuid NOT NULL,
	"send_id" uuid NOT NULL,
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resend_email_id" text,
	CONSTRAINT "sent_to_subscriber_id_send_id_pk" PRIMARY KEY("subscriber_id","send_id")
);
--> statement-breakpoint
CREATE TABLE "subscribers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"first_name" text,
	"status" text DEFAULT 'active' NOT NULL,
	"source" text DEFAULT 'unknown' NOT NULL,
	"unsubscribe_token" text NOT NULL,
	"interest_productivity" boolean DEFAULT true NOT NULL,
	"interest_ai" boolean DEFAULT true NOT NULL,
	"interest_marketing" boolean DEFAULT true NOT NULL,
	"subscribed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"unsubscribed_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "sent_to" ADD CONSTRAINT "sent_to_subscriber_id_subscribers_id_fk" FOREIGN KEY ("subscriber_id") REFERENCES "public"."subscribers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sent_to" ADD CONSTRAINT "sent_to_send_id_sends_id_fk" FOREIGN KEY ("send_id") REFERENCES "public"."sends"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "sends_post_slug_idx" ON "sends" USING btree ("post_slug");--> statement-breakpoint
CREATE UNIQUE INDEX "subscribers_email_idx" ON "subscribers" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "subscribers_token_idx" ON "subscribers" USING btree ("unsubscribe_token");