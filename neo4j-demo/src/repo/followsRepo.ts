import { getDriver } from "../db";
import { Follow, User } from "../types";

export async function followUser(fromId: string, toId: string): Promise<Follow> {
  const driver = getDriver();
  const session = driver.session();
  try {
    const since = new Date().toISOString();
    await session.executeWrite(async tx => {
      await tx.run(
        `
        MATCH (a:User {id: $fromId}), (b:User {id: $toId})
        MERGE (a)-[r:FOLLOWS]->(b)
        ON CREATE SET r.since = $since
        `,
        { fromId, toId, since }
      );
    });
    return { fromId, toId, since };
  } finally {
    await session.close();
  }
}

export async function getFollowers(ofUserId: string): Promise<User[]> {
  const driver = getDriver();
  const session = driver.session();
  try {
    const res = await session.run(
      `
      MATCH (f:User)-[:FOLLOWS]->(u:User {id: $id})
      RETURN f
      ORDER BY f.createdAt DESC
      `,
      { id: ofUserId }
    );
    return res.records.map(r => {
      const node = r.get("f");
      return {
        id: node.properties.id,
        name: node.properties.name,
        email: node.properties.email,
        createdAt: node.properties.createdAt,
      } as User;
    });
  } finally {
    await session.close();
  }
}