## neo4j起動
```sh
docker compose up -d
```

## 環境変数

```sh
cp .env.example .env
```

パスワードは`docker-compose.yml`と揃える

## 実行

`pnpm dev`の実行結果（処理自体は`index.ts`を参照）

```sh
Created: {
  alice: {
    id: 'ed7fee3d-3014-44bb-8e3a-19f76750a803',
    name: 'Alice',
    email: 'alice@example.com',
    createdAt: '2025-08-27T06:35:20.651Z'
  },
  bob: {
    id: '516ccfe4-d0d5-4515-a2d2-6a0abac433a6',
    name: 'Bob',
    email: 'bob@example.com',
    createdAt: '2025-08-27T06:35:21.125Z'
  }
}
Get by id: {
  id: 'ed7fee3d-3014-44bb-8e3a-19f76750a803',
  name: 'Alice',
  email: 'alice@example.com',
  createdAt: '2025-08-27T06:35:20.651Z'
}
Followers of Bob: [
  {
    id: 'ed7fee3d-3014-44bb-8e3a-19f76750a803',
    name: 'Alice',
    email: 'alice@example.com',
    createdAt: '2025-08-27T06:35:20.651Z'
  }
]
Updated name: {
  id: 'ed7fee3d-3014-44bb-8e3a-19f76750a803',
  name: 'Alice Cooper',
  email: 'alice@example.com',
  createdAt: '2025-08-27T06:35:20.651Z'
}
Name like 'ali': [
  {
    id: 'ed7fee3d-3014-44bb-8e3a-19f76750a803',
    name: 'Alice Cooper',
    email: 'alice@example.com',
    createdAt: '2025-08-27T06:35:20.651Z'
  }
]
Deleted Bob: true
```

## neo4jにCLIからアクセスする

接続

```sh
❯ docker exec -it neo4j cypher-shell -u neo4j -p password
```

user一覧

```sh
neo4j@neo4j> MATCH (u:User) RETURN u LIMIT 5;
+-----------------------------------------------------------------------------------------------------------------------------------------------+
| u                                                                                                                                             |
+-----------------------------------------------------------------------------------------------------------------------------------------------+
| (:User {name: "Alice Cooper", createdAt: "2025-08-27T06:35:20.651Z", id: "ed7fee3d-3014-44bb-8e3a-19f76750a803", email: "alice@example.com"}) |
| (:User {name: "Alice Cooper", createdAt: "2025-08-27T06:39:19.829Z", id: "81bd25b5-2c9f-4914-b5de-888ce7f666a2", email: "alice@example.com"}) |
+-----------------------------------------------------------------------------------------------------------------------------------------------+

2 rows
```

名前で検索して、update

```sh
neo4j@neo4j> MATCH (u:User) WHERE toLower(u.name) CONTAINS toLower("ali") SET u.name = "Alice" RETURN u;
+----------------------------------------------------------------------------------------------------------------------------------------+
| u                                                                                                                                      |
+----------------------------------------------------------------------------------------------------------------------------------------+
| (:User {name: "Alice", createdAt: "2025-08-27T06:35:20.651Z", id: "ed7fee3d-3014-44bb-8e3a-19f76750a803", email: "alice@example.com"}) |
| (:User {name: "Alice", createdAt: "2025-08-27T06:39:19.829Z", id: "81bd25b5-2c9f-4914-b5de-888ce7f666a2", email: "alice@example.com"}) |
+----------------------------------------------------------------------------------------------------------------------------------------+
```

スキーマの確認

```sh
neo4j@neo4j> CALL db.schema.visualization();
+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| nodes                                                                                                                                                         | relationships |
+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| [(:User {name: "User", indexes: ["name"], constraints: ["Constraint( id=4, name='user_id_unique', type='UNIQUENESS', schema=(:User {id}), ownedIndex=3 )"]})] | []            |
+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+

```

```sh
neo4j@neo4j> CALL db.labels();
+--------+
| label  |
+--------+
| "User" |
+--------+
```

```sh
neo4j@neo4j> CALL db.relationshipTypes();
+------------------+
| relationshipType |
+------------------+
| "FOLLOWS"        |
+------------------+
```

```sh
neo4j@neo4j> CALL db.propertyKeys();
+-------------+
| propertyKey |
+-------------+
| "id"        |
| "name"      |
| "since"     |
| "createdAt" |
| "email"     |
+-------------+
```

```sh
neo4j@neo4j> SHOW CONSTRAINTS;
+------------------------------------------------------------------------------------------------------------------+
| id | name             | type         | entityType | labelsOrTypes | properties | ownedIndex       | propertyType |
+------------------------------------------------------------------------------------------------------------------+
| 4  | "user_id_unique" | "UNIQUENESS" | "NODE"     | ["User"]      | ["id"]     | "user_id_unique" | NULL         |
+------------------------------------------------------------------------------------------------------------------+
```

```sh
neo4j@neo4j> SHOW INDEXES;
+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| id | name                | state    | populationPercent | type     | entityType     | labelsOrTypes | properties | indexProvider      | owningConstraint | lastRead                 | readCount |
+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| 6  | "follows_since_idx" | "ONLINE" | 100.0             | "RANGE"  | "RELATIONSHIP" | ["FOLLOWS"]   | ["since"]  | "range-1.0"        | NULL             | NULL                     | 0         |
| 1  | "index_343aff4e"    | "ONLINE" | 100.0             | "LOOKUP" | "NODE"         | NULL          | NULL       | "token-lookup-1.0" | NULL             | 2025-08-27T06:43:13.169Z | 5         |
| 2  | "index_f7700477"    | "ONLINE" | 100.0             | "LOOKUP" | "RELATIONSHIP" | NULL          | NULL       | "token-lookup-1.0" | NULL             | NULL                     | 0         |
| 3  | "user_id_unique"    | "ONLINE" | 100.0             | "RANGE"  | "NODE"         | ["User"]      | ["id"]     | "range-1.0"        | "user_id_unique" | 2025-08-27T06:39:19.479Z | 16        |
| 5  | "user_name_idx"     | "ONLINE" | 100.0             | "RANGE"  | "NODE"         | ["User"]      | ["name"]   | "range-1.0"        | NULL             | NULL                     | 0         |
+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+

```

`http://localhost:7474` にアクセスして、スキーマやクエリ実行も可能