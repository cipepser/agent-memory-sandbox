import { getDriver } from "../db";
import { randomUUID } from "crypto";
import { User } from "../types";

const toUser = (record: any): User => {
  const node = record.get("u");
  return {
    id: node.properties.id,
    name: node.properties.name,
    email: node.properties.email,
    createdAt: node.properties.createdAt,
  };
};

export async function createUser(input: Omit<User, "id"|"createdAt">): Promise<User> {
  const driver = getDriver();
  const session = driver.session();
  try {
    const id = randomUUID();
    const createdAt = new Date().toISOString();
    const res = await session.run(
      `
      CREATE (u:User {
        id: $id, name: $name, email: $email, createdAt: $createdAt
      })
      RETURN u
      `,
      { id, name: input.name, email: input.email, createdAt }
    );
    return toUser(res.records[0]);
  } finally {
    await session.close()
  }
}

export async function getUserById(id: string): Promise<User | null> {
  const driver = getDriver();
  const session = driver.session();
  try {
    const res = await session.run(
      `MATCH (u:User {id: $id}) RETURN u LIMIT 1`,
      { id }
    );
    if (res.records.length === 0) return null;
    return toUser(res.records[0]);
  } finally {
    await session.close();
  }
}

export async function updateUserName(id: string, name: string): Promise<User | null> {
  const driver = getDriver();
  const session = driver.session();
  try {
    const res = await session.run(
      `
      MATCH (u:User {id: $id})
      SET u.name = $name
      RETURN u
      `,
      { id, name }
    );
    if (res.records.length === 0) return null;
    return toUser(res.records[0]);
  } finally {
    await session.close();
  }
}

export async function deleteUser(id: string): Promise<boolean> {
  const driver = getDriver();
  const session = driver.session();
  try {
    const res = await session.run(
      `
      MATCH (u:User {id: $id})
      DETACH DELETE u
      RETURN count(*) as deleted
      `,
      { id }
    );
    if (res.records.length === 0) return false;
    const deleted = res.records[0]!.get("deleted").toNumber?.() ?? res.records[0]!.get("deleted");
    return deleted > 0;
  } finally {
    await session.close();
  }
}

export async function findUsersByNameLike(q: string): Promise<User[]> {
  const driver = getDriver();
  const session = driver.session();
  try {
    const res = await session.run(
      `
      MATCH (u:User)
      WHERE toLower(u.name) CONTAINS toLower($q)
      RETURN u
      ORDER BY u.createdAt DESC
      LIMIT 50
      `,
      { q }
    );
    return res.records.map(toUser);
  } finally {
    await session.close();
  }
}