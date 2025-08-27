export type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export type Follow = {
  fromId: string;
  toId: string;
  since: string;
}