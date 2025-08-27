import { getDriver, closeDriver } from "./db";
import { ensureConstraints } from "./schema";
import { createUser, getUserById, updateUserName, deleteUser, findUsersByNameLike } from "./repo/userRepo";
import { followUser, getFollowers } from "./repo/followsRepo";

async function main() {
  getDriver();
  await ensureConstraints();

  // ユーザー作成
  const alice = await createUser({ name: "Alice", email: "alice@example.com" });
  const bob   = await createUser({ name: "Bob",   email: "bob@example.com" });
  console.log("Created:", { alice, bob });

  // フォロー関係
  await followUser(alice.id, bob.id);

  // 取得系
  const byId = await getUserById(alice.id);
  console.log("Get by id:", byId);

  const followersOfBob = await getFollowers(bob.id);
  console.log("Followers of Bob:", followersOfBob);

  // 更新
  const alice2 = await updateUserName(alice.id, "Alice Cooper");
  console.log("Updated name:", alice2);

  // 検索
  const found = await findUsersByNameLike("ali");
  console.log("Name like 'ali':", found);

  // 削除
  const removed = await deleteUser(bob.id);
  console.log("Deleted Bob:", removed);
}

main()
  .catch(err => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDriver();
  });