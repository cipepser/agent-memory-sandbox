import { getDriver } from "./db"

export async function ensureConstraints() {
  const driver = getDriver();
  const session = driver.session()

  try {
    await session.run(`
      CREATE CONSTRAINT user_id_unique IF NOT EXISTS
      FOR (u:User) REQUIRE u.id IS UNIQUE
    `);

    // User.nameにindexを張る
    await session.run(`
      CREATE INDEX user_name_idx IF NOT EXISTS
      FOR (u:User) ON (u.name)
    `)

    // FOLLOWSリレーションの作成日時にindex
    await session.run(`
      CREATE INDEX follows_since_idx IF NOT EXISTS
      FOR ()-[r:FOLLOWS]-() ON (r.since)
    `);

  } finally {
    await session.close()
  }
}