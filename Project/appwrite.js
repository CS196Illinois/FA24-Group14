import { Client, Account } from "appwrite";

const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("65ecf35262d54b100f81");

const account = new Account(client);

export { account, client };
