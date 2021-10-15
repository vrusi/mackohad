const WebSocket = require("ws");
const express = require("express");
const cookieParser = require("cookie-parser");
const Housenka = require("./housenka.js");
const upload = require("express-fileupload");
const crypto = require("crypto");

const app = express();
app.use(express.json());
app.use(upload());
app.use(cookieParser());
const HTTP_PORT = 8000;
const WS_PORT = 8082;

// https://emailregex.com/
const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

const nameRegex = /[a-zA-Z]+/;

const passwordRegex = /.+/;

const SALT = "husenica";

var sessions = {};

var users = defaultUsers();

var userId = 2;
// pesnicka https://www.fesliyanstudios.com/royalty-free-music/download/lazy-day/357

function defaultUsers() {
  return {
    1: {
      username: "admin",
      email: "admin",
      password: createHash("admin"),
      topScore: 0,
      topLevel: 0,
      isAdmin: true,
    },
  };
}

const websocketServer = new WebSocket.Server({ port: WS_PORT });
app.use(express.static("public"));
app.listen(HTTP_PORT, "0.0.0.0", () => {
  console.log(`http://localhost:${HTTP_PORT}`);
});

function admin() {
  let currentGames = [];

  for (sessionId in sessions) {
    const session = sessions[sessionId];

    if (session.game) {
      currentGames.push({
        name:
          (users[session.userId] && users[session.userId].username) || "N/A",
        session: sessionId,
      });
    }
  }

  let gameRows = currentGames.map(({ name, session }, rank) => ({
    tag: "tr",
    innerTags: [
      { tag: "td", innerText: `${rank + 1}` },
      { tag: "td", innerText: name },
      { tag: "td", innerText: session },
    ],
  }));

  return [
    {
      tag: "table",
      class: "table w-25 mx-auto",
      innerTags: [
        { tag: "caption", innerText: "Prave hrane hry" },
        {
          tag: "thead",
          class: "thead-dark",
          innerTags: [
            {
              tag: "tr",
              innerTags: [
                { tag: "th", innerText: "#" },
                { tag: "th", innerText: "Name" },
                { tag: "th", innerText: "Session" },
              ],
            },
          ],
        },
        {
          tag: "tbody",
          innerTags: [...gameRows],
        },
      ],
    },
  ];
}

function leaderboard() {
  var allUsers = [];

  // from anonymous sessions
  for (sessionId in sessions) {
    const session = sessions[sessionId];

    if (session.userId == null) {
      allUsers.push({
        name: "N/A",
        topScore: session.topScore,
        topLevel: session.topLevel,
      });
    }
  }

  // from users
  for (userId in users) {
    if (!users[userId].isAdmin) {
      allUsers.push({
        name: users[userId].username,
        topScore: users[userId].topScore,
        topLevel: users[userId].topLevel,
      });
    }
  }

  topScores = allUsers
    .sort((userA, userB) => userB.topScore - userA.topScore)
    .map(({ name, topScore, topLevel }, rank) => ({
      tag: "tr",
      innerTags: [
        { tag: "td", innerText: `${rank + 1}` },
        { tag: "td", innerText: name },
        { tag: "td", innerText: "" + topScore },
        { tag: "td", innerText: "" + topLevel },
      ],
    }));

  return [
    {
      tag: "table",
      class: "table w-25 mx-auto",
      innerTags: [
        { tag: "caption", innerText: "Top skore" },
        {
          tag: "thead",
          class: "thead-dark",
          innerTags: [
            {
              tag: "tr",
              innerTags: [
                { tag: "th", innerText: "#" },
                { tag: "th", innerText: "Name" },
                { tag: "th", innerText: "Score" },
                { tag: "th", innerText: "Level" },
              ],
            },
          ],
        },
        {
          tag: "tbody",
          innerTags: [...topScores],
        },
      ],
    },
  ];
}

function menuHtmlJson(options) {
  const errorMessage = options.errorMessage || null;
  const message = options.message || null;
  const isAdmin = options.isAdmin || false;
  const isLoggedIn = options.isLoggedIn || isAdmin || false;

  return [
    {
      tag: "div",
      class: "d-flex flex-column justify-content-center",
      innerTags: [
        ...(message
          ? [
              {
                tag: "p",
                innerText: message,
                class: "alert alert-primary text-center",
              },
            ]
          : []),
        ...(errorMessage
          ? [
              {
                tag: "p",
                innerText: errorMessage,
                class: "alert alert-danger text-center",
              },
            ]
          : []),
        {
          tag: "h1",
          class: "mx-auto my-5",
          innerText: "Mačkohad",
        },
        ...(isAdmin
          ? [
              {
                tag: "button",
                class: "btn btn-secondary mx-auto my-2 w-25",
                id: "btn-export",
                innerText: "Export pouzivatelov",
              },
              {
                tag: "div",
                class: "mx-auto my-5",
                innerTags: [
                  {
                    tag: "button",
                    class: "w-100 d-block btn btn-secondary mx-auto my-2",
                    id: "btn-import",
                    innerText: "Import pouzivatelov",
                  },
                  {
                    tag: "input",
                    class: "w-100 d-block",
                    type: "file",
                    id: "input-file-users",
                  },
                ],
              },
            ]
          : []),
        ...(isAdmin ? admin() : []),
        ...leaderboard(),
        ...(isLoggedIn
          ? []
          : [
              {
                tag: "label",
                class: "mx-auto mb-0 mt-2",
                innerText: "Email",
              },
              {
                tag: "input",
                type: "text",
                name: "email",
                id: "input-email",
                class: "mx-auto w-25",
              },
              {
                tag: "label",
                class: "mx-auto mb-0 mt-2",
                innerText: "Meno",
              },
              {
                tag: "input",
                type: "text",
                name: "username",
                id: "input-username",
                class: "mx-auto w-25",
              },
              {
                tag: "label",
                class: "mx-auto mb-0 mt-2",
                innerText: "Heslo",
              },
              {
                tag: "input",
                type: "password",
                name: "password",
                id: "input-password",
                class: "mx-auto w-25",
              },
              {
                tag: "button",
                class: "btn btn-primary mx-auto mt-5 mb-2 w-25",
                id: "btn-login",
                innerText: "Prihlásiť sa",
              },
              {
                tag: "button",
                class: "btn btn-secondary mx-auto my-2 w-25",
                id: "btn-register",
                innerText: "Registrovať sa",
              },
            ]),
        ...(isLoggedIn
          ? [
              {
                tag: "button",
                class: "btn btn-secondary mx-auto my-2 w-25",
                id: "btn-logout",
                innerText: "Odhlasit sa",
              },
            ]
          : []),
        {
          tag: "button",
          class: "btn btn-default mx-auto my-2 w-25",
          id: "btn-play",
          innerText: "Hrať",
        },
      ],
    },
  ];
}

const gameHtmlJson = [
  {
    tag: "div",
    class: "d-block",
    innerTags: [
      {
        tag: "audio",
        controls: "true",
        loop: "true",
        class: "w-100",
        innerTags: [
          {
            tag: "source",
            src: "soundtrack.mp3",
            type: "audio/mpeg",
          },
        ],
      },
      {
        tag: "div",
        class: "d-flex",
        innerTags: [
          {
            tag: "canvas",
          },
          {
            tag: "div",
            class: "ml-3",
            id: "panel",
            innerTags: [
              {
                tag: "div",
                id: "scoreboard",
                innerTags: [
                  {
                    tag: "p",
                    id: "level",
                    class: "h3",
                  },
                  {
                    tag: "p",
                    id: "lives",
                    class: "h3",
                  },
                  {
                    tag: "p",
                    id: "keys",
                    class: "h3",
                  },
                  {
                    tag: "p",
                    id: "score",
                    class: "h3",
                  },
                  {
                    tag: "p",
                    id: "top-level",
                    class: "h3",
                  },
                  {
                    tag: "p",
                    id: "top-score",
                    class: "h3",
                  },
                ],
              },
              {
                tag: "hr",
              },
              {
                tag: "div",
                id: "controls",
                innerTags: [
                  {
                    tag: "button",
                    class: "btn btn-default d-block",
                    innerText: "Hrať odznova",
                  },
                  {
                    tag: "button",
                    class: "btn btn-default d-block",
                    innerText: "Uložiť hru",
                  },
                  {
                    tag: "button",
                    class: "btn btn-default d-block",
                    innerText: "Načítať hru",
                  },
                ],
              },
            ],
          },
        ],
      },

      {
        tag: "div",
        innerTags: [
          {
            tag: "p",
            id: "resultNew",
            class: "h3 mt-2 ml-2",
          },
        ],
      },
    ],
  },
];

function generateRandomSessionId() {
  return Math.random().toString(36).substring(2);
}

function findUserIdByUsername(username) {
  for (userId in users) {
    if (users[userId].username == username) {
      return userId;
    }
  }
  return null;
}

function getUserBySession(gameId) {
  if (!sessions[gameId]) return null;

  return users[sessions[gameId].userId];
}
function getSession(gameId) {
  return sessions[gameId];
}

websocketServer.on("connection", (ws) => {
  var currentGame;

  ws.on("close", () => {
    if (currentGame && currentGame.session) {
      currentGame.zastavHru("");
      currentGame.session.game = null;
      delete currentGame;
    }
  });

  ws.on("message", (event) => {
    const { command, data } = JSON.parse(event);

    if (command === "onLoad") {
      const session = data;

      const currentGameId = session;
      var currentSession = getSession(currentGameId);
      currentSession.game && currentSession.game.zastavHru();
      currentGame = new Housenka();
      currentGame.session = currentSession;
      currentSession.game = currentGame;

      currentGame.show_result = function (message) {
        const data = JSON.stringify({ command: "show_result", data: message });
        ws.send(data);
      };

      currentGame.show_score = function (score) {
        var topScore = 0;
        /* set top score in the user */
        var currentUser = getUserBySession(currentGameId);
        if (currentUser) {
          currentUser.topScore = Math.max(currentUser.topScore, score);
          topScore = currentUser.topScore;
        }

        /* set top score in the session */
        var currentSession = getSession(currentGameId);
        currentSession.topScore = Math.max(currentSession.topScore, score);

        topScore = Math.max(topScore, currentSession.topScore);

        const data = JSON.stringify({
          command: "show_score",
          data: { score, topScore },
        });
        ws.send(data);
      };

      currentGame.show_klice = function (klice) {
        const data = JSON.stringify({ command: "show_klice", data: klice });
        ws.send(data);
      };

      currentGame.show_level = function (level) {
        var topLevel = 0;
        /* set top level in the user */
        var currentUser = getUserBySession(currentGameId);
        if (currentUser) {
          currentUser.topLevel = Math.max(currentUser.topLevel, level);
          topLevel = currentUser.topLevel;
        }

        /* set top level in the session */
        var currentSession = getSession(currentGameId);
        currentSession.topLevel = Math.max(currentSession.topLevel, level);
        topLevel = Math.max(topLevel, currentSession.topLevel);

        const data = JSON.stringify({
          command: "show_level",
          data: { level, topLevel },
        });
        ws.send(data);
      };

      currentGame.show_zivoty = function (zivoty) {
        const data = JSON.stringify({ command: "show_zivoty", data: zivoty });
        ws.send(data);
      };

      currentGame.callFinish = function (reason) {
        const data = JSON.stringify({
          command: "callFinish",
          data: reason,
        });
        ws.send(data);
      };

      currentGame.paint = function (plocha, smer) {
        const data = JSON.stringify({
          command: "paintAll",
          data: { plocha, smer },
        });
        ws.send(data);
      };

      const dataToSend = JSON.stringify({
        command: "initialized",
        data: {
          rows: currentGame.ysize,
          cols: currentGame.xsize,
          session: currentGameId,
        },
      });

      ws.send(dataToSend);
    } else if (command === "housenkaInit") {
      currentGame.housenkaInit(true);
    }
  });
});

/* routing */
/* send game menu html */
app.get("/load", (req, res, next) => {
  const user = getUserBySession(req.cookies.session);
  const isAdmin = (user && user.isAdmin) || false;
  res.send(menuHtmlJson({ isLoggedIn: user != null, isAdmin: isAdmin }));
});

/* start anonymous game */
app.post("/play", (req, res, next) => {
  if (req.cookies) {
    if (sessions[req.cookies.session]) {
      /* session already exists */
      res.json(gameHtmlJson);
    } else {
      /* generate session and set session cookie */
      const sessionId = generateRandomSessionId();

      sessions[sessionId] = {
        userId: null,
        game: null,
        topScore: 0,
        topLevel: 0,
      };
      res.cookie("session", sessionId);
      res.json(gameHtmlJson);
    }
  } else {
    /* generate session and set session cookie */
    const sessionId = generateRandomSessionId();

    sessions[sessionId] = {
      userId: null,
      game: null,
      topScore: 0,
      topLevel: 0,
    };
    res.cookie("session", sessionId);
    res.json(gameHtmlJson);
  }
});

function createHash(password) {
  return crypto.createHmac("sha256", SALT).update(password).digest("hex");
}

function addUser(
  { email, username, password, topScore, topLevel, isAdmin },
  isFromImport
) {
  if (!emailRegex.test(email))
    return { userId: null, message: "Email ma nespravny tvar" };

  for (id in users) {
    if (users[id].email == email) {
      return { userId: null, message: "Email bol uz zaregistrovany" };
    }
  }

  if (!nameRegex.test(username))
    return { userId: null, message: "Meno ma nespravny tvar" };

  for (id in users) {
    if (users[id].username == username) {
      return { userId: null, message: "Meno uz bolo zaregistrovane" };
    }
  }

  if (!passwordRegex.test(password))
    return { userId: null, message: "Heslo musi obsahovat aspon 1 znak" };

  var currentUserId = ++userId;

  const passwordHash = isFromImport ? password : createHash(password);

  users[currentUserId] = {
    email: email,
    username: username,
    password: passwordHash,
    topScore: topScore,
    topLevel: topLevel,
    isAdmin: isAdmin,
    // TODO: code
  };

  return { userId: currentUserId, message: "" };
}

/* register user and start game */
app.post("/register", (req, res, next) => {
  /* generate session and set session cookie */
  const sessionId = generateRandomSessionId();

  const { userId, message } = addUser(
    {
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
      topScore: 0,
      topLevel: 0,
      isAdmin: false,
      // TODO: code
    },
    false
  );

  if (userId) {
    sessions[sessionId] = {
      userId: userId,
      game: null,
      topScore: 0,
      topLevel: 0,
    };

    res.cookie("session", sessionId);
    res.json(menuHtmlJson({ isLoggedIn: true }));
  } else {
    res.status(401);
    res.json(menuHtmlJson({ errorMessage: message }));
  }
});

/* user login */
app.post("/login", (req, res, next) => {
  var userId = findUserIdByUsername(req.body.username);
  if (userId) {
    if (createHash(req.body.password) == users[userId].password) {
      const sessionId = generateRandomSessionId();
      sessions[sessionId] = {
        userId: userId,
        game: null,
        topScore: 0,
        topLevel: 0,
        isAdmin: false,
      };

      res.cookie("session", sessionId);

      res.json(
        menuHtmlJson({
          isAdmin: (userId && users[userId].isAdmin) || false,
          isLoggedIn: true,
        })
      );
    } else {
      res.status(401);
      res.json(menuHtmlJson({ errorMessage: "Nesprávne meno alebo heslo" }));
    }
  } else {
    res.status(401);
    res.json(menuHtmlJson({ errorMessage: "Nesprávne meno alebo heslo" }));
  }
});

/* user logout */
app.post("/logout", (req, res, next) => {
  const session = getSession(req.cookies.session);

  if (session) {
    session.game && session.game.zastavHru("");
    delete session.game;
    delete sessions[req.cookies.session];
  }

  res.clearCookie("session");
  res.json(menuHtmlJson({ message: "Boli ste odhlaseny" }));
});

app.post("/users/import", (req, res, next) => {
  const user = getUserBySession(req.cookies.session);

  if (user.isAdmin) {
    console.log(users);

    req.files.users.data
      .toString("utf8")
      .split("\n")
      .forEach((line) => {
        const userFields = line.split(",");

        users = defaultUsers();

        addUser(
          {
            username: userFields[0],
            email: userFields[1],
            password: userFields[2],
            topScore: Number(userFields[3]),
            topLevel: Number(userFields[4]),
            isAdmin: "true" == userFields[5],
          },
          true
        );
      });

    res.json(
      menuHtmlJson({ isAdmin: true, message: "Pouzivatelia naimportovani" })
    );
  } else {
    res.status(401);
    res.json({});
  }
});

app.get("/users/export", (req, res, next) => {
  const user = getUserBySession(req.cookies.session);

  if (user.isAdmin) {
    let usersArray = [];

    for (id in users) {
      if (!users[id].isAdmin) {
        usersArray.push(users[id]);
      }
    }

    const content = usersArray
      .map(
        ({ username, email, password, topScore, topLevel, isAdmin }) =>
          `${username},${email},${password},${topScore},${topLevel},${isAdmin}`
      )
      .join("\n");

    res.writeHead(200, {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=users.csv",
    });
    res.end(content, "binary");
  } else {
    res.status(401);
    res.json({});
  }
});

app.post("/onkeydown", (req, res, next) => {
  const session = getSession(req.cookies.session);

  if (session && session.game) {
    session.game.stiskKlavesy(req.body);
    res.json({});
  } else {
    res.json({});
  }
});

app.post("/onkeyup", (req, res, next) => {
  const session = getSession(req.cookies.session);

  if (session && session.game) {
    session.game.uvolneniKlavesy(req.body);
    res.json({});
  } else {
    res.json({});
  }
});
