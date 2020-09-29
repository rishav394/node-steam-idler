require("dotenv").config();
import { buildBot } from "./steamClient";

const username = process.env.user;
const password = process.env.password;
const sharedSecret = process.env.sharedSecret;
const games = process.env.games?.split(",").map(parseInt);

if (!(username && password && sharedSecret && games)) {
  console.log("Invalid config.");
} else {
  const bot = buildBot({
    username,
    password,
    sharedSecret,
    games,
  });
  bot.doLogin();
}
