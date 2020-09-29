import SteamTotp from "steam-totp";
import SteamUser from "steam-user";

export const buildBot = (config: {
  username: string;
  password: string;
  sharedSecret?: string;
  games: string[];
}) => {
  const user = new SteamUser({
    promptSteamGuardCode: false,
    dataDirectory: "./sentry",
    singleSentryfile: false,
  });

  user.username = config.username;
  user.password = config.password;
  user.sharedSecret = config.sharedSecret;
  user.games = config.games;

  user.on("loggedOn", function () {
    console.log(
      `[${
        user.username
      }] Logged into Steam as ${user.steamID.getSteam3RenderedID()}`
    );
    user.setPersona(SteamUser.EPersonaState.Online);
    user.gamesPlayed(user.games);
    console.log(`[${user.username}] Idling ${user.games.join(" ")}`);
  });

  user.on("error", function (e: string) {
    console.log(`[${user.username}]` + e);
    setTimeout(function () {
      user.doLogin();
    }, 30 * 60 * 1000);
  });

  user.doLogin = function () {
    user.logOn({
      accountName: user.username,
      password: user.password,
    });
  };

  user.on("steamGuard", function (
    domain: any,
    callback: (arg0: string) => void
  ) {
    if (!user.sharedSecret) {
      const readlineSync = require("readline-sync");
      const authCode = readlineSync.question(
        `[${user.username}] Steam Guard` + (!domain ? " App" : "") + " Code: "
      );
      callback(authCode);
    } else {
      const authCode = SteamTotp.generateAuthCode(user.sharedSecret);
      console.log("[" + user.username + "] Generated Auth Code: " + authCode);
      callback(authCode);
    }
  });

  user.on("vacBans", function (numBans: string | number, appids: any[]) {
    if (numBans > 0) {
      console.log(
        `[${user.username}] ${numBans} VAC ban` +
          (numBans == 1 ? "" : "s") +
          "." +
          (appids.length == 0 ? "" : " In apps: " + appids.join(", "))
      );
    }
  });

  user.on("accountLimitations", function (
    limited: any,
    communityBanned: any,
    locked: any
  ) {
    const limitations = [];

    if (limited) {
      limitations.push("LIMITED");
    }

    if (communityBanned) {
      limitations.push("COMMUNITY BANNED");
    }

    if (locked) {
      limitations.push("LOCKED");
    }

    if (limitations.length !== 0) {
      console.log(
        `[${user.username}] Limitations: ` + limitations.join(", ") + "."
      );
    }
  });

  return user;
};
