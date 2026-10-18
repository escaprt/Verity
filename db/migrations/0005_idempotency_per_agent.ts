import { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  // An idempotency key is scoped to the caller that chose it: two unrelated
  // agents may legitimately pick the same key (e.g. "order-1"). The new
  // composite index is strictly weaker than the old global one, so it cannot
  // fail on existing data.
  await db.schema
    .createIndex("submission_agent_idem_uq")
    .on("submission")
    .columns(["agent_id", "idempotency_key"])
    .unique()
    .where("idempotency_key", "is not", null)
    .execute();

  await db.schema.dropIndex("submission_idem_uq").execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Fails if two agents already share a key — the expected consequence of
  // rolling back to global uniqueness.
  await db.schema.dropIndex("submission_agent_idem_uq").execute();

  await db.schema
    .createIndex("submission_idem_uq")
    .on("submission")
    .column("idempotency_key")
    .unique()
    .where("idempotency_key", "is not", null)
    .execute();
}
