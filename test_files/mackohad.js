const square_size = 48;
var cols = 41;
var rows = 31;

/* global variables */
var ctx = null;

var spritesImg = new Image();

var game;

var klic24Msg = "kľúče";
var live24Msg = "životy";
var klic5Msg = "kľúčov";
var point5Msg = "bodov";
var klic1Msg = "kľúč";
var bludisteMsg = "bludisko";
var live5Msg = "životov";
var point1Msg = "bod";
var point24Msg = "body";
var live1Msg = "život";

var renderedBoard = [];

/* ijkl to arrows mapper */
Object.defineProperty(KeyboardEvent.prototype, "keyCode", {
  get: function () {
    switch (this.key) {
      case "j":
        return 37; // left
      case "k":
        return 40; // down
      case "i":
        return 38; // up
      case "l":
        return 39; // right
      default:
        return this.which;
    }
  },
});

/* add 'debug' to the url for debug mode */
function is_debug() {
  return window.location.href.includes("debug");
}

/* set up the contents of the head tag */
function setup_head() {
  /* the page title */
  var title = document.createElement("title");
  title.innerHTML = "mackohad";

  /* the meta tag */
  var meta = document.createElement("meta");
  meta.setAttribute("charset", "UTF-8");

  /* append the elements to the document */
  document.getElementsByTagName("head")[0].appendChild(title);
  document.getElementsByTagName("head")[0].appendChild(meta);
}

/* set up the contents of the body tag */
function setupGameBody() {
  var canvas = $("canvas")[0];
  canvas.width = cols * square_size;
  canvas.height = rows * square_size;
  ctx = canvas.getContext("2d");
}

setup_head();

/* parse html from json */
function json2html(parsedObject) {
  var element;
  if (parsedObject["tag"] == "div") {
    element = $("<div></div>");

    for (innerTag of parsedObject["innerTags"]) {
      element.append(json2html(innerTag));
    }
  } else {
    element = document.createElement(parsedObject["tag"]);
  }
  if (parsedObject["id"]) {
    element.id = parsedObject["id"];
  }

  if (parsedObject["class"]) {
    for (item of parsedObject["class"].split(" ")) {
      if (parsedObject["tag"] == "div") {
        element[0].classList.add(item);
      } else {
        element.classList.add(item);
      }
    }
  }

  if (parsedObject["innerText"]) {
    element.innerText = parsedObject["innerText"];
  }

  if (parsedObject["name"]) {
    element.name = parsedObject["name"];
  }

  if (parsedObject["type"]) {
    element.type = parsedObject["type"];
  }

  if (parsedObject["width"]) {
  }

  return element;
}

function replaceBodyWith(data) {
  parsedArray = data;
  $("body")[0].innerHTML = "";
  for (parsedObject of parsedArray) {
    $("body").append(json2html(parsedObject));
  }
}

// https://stackoverflow.com/a/15724300
function getCookieByName(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

function drawGame() {
  // vlastna tvorba
  // https://www.pixilart.com/art/mackohad-c059bf070872cae
  spritesImg.src = "https://art.pixilart.com/0751a0f4222e450.png";

  /* wait for the image to load */
  spritesImg.onload = () => {
    const host = location.host.split(":")[0];
    var socket = new WebSocket(`ws://${host}:8082`);

    socket.onopen = () => {
      const session = getCookieByName("session");
      socket.send(JSON.stringify({ command: "onLoad", data: session }));
    };

    socket.onmessage = (event) => {
      const { command, data } = JSON.parse(event.data);

      if (command === "initialized") {
        session = data.session;
        rows = data.rows;
        cols = data.cols;

        $("table").remove();
        $("#result").remove();
        setupGameBody();

        socket.send(JSON.stringify({ command: "housenkaInit", data: {} }));
      } else if (command === "show_result") {
        show_result(data);
      } else if (command === "show_score") {
        show_score(data);
      } else if (command === "show_level") {
        show_level(data);
      } else if (command === "show_klice") {
        show_klice(data);
      } else if (command === "show_zivoty") {
        show_zivoty(data);
      } else if (command === "callFinish") {
        callFinish(data);
      } else if (command === "paintAll") {
        const { plocha, smer } = data;

        if (renderedBoard.length === 0) {
          for (i in plocha) {
            nastavBarvu(i, plocha[i], smer);
          }
        } else {
          for (i in plocha) {
            if (plocha[i] !== renderedBoard[i]) {
              nastavBarvu(i, plocha[i], smer);
            }
          }
        }
        renderedBoard = plocha;
      }
    };

    document["onkeydown"] = function (event) {
      let e = event || window.event;
      socket.send(
        JSON.stringify({
          command: "stiskKlavesy",
          data: { keyCode: e.keyCode },
        })
      );
    };
    document["onkeyup"] = function (event) {
      let e = event || window.event;

      socket.send(
        JSON.stringify({
          command: "uvolneniKlavesy",
          data: { keyCode: e.keyCode },
        })
      );
    };
  };
}

/* pre-init */
$(document).ready(() => {
  /* make ajax request for game menu html */
  $.ajax({
    url: "/load",
    method: "GET",
    dataType: "json",
    contentType: "application/json; charset=utf-8",
    success: (data) => {
      replaceBodyWith(data);
    },
    error: (request, status, error) => {
      console.log(request.responseText);
      console.log(status);
      console.log(error);
    },
  });

  /* set onclick listeners */
  /* anonymous game */
  $("body").on("click", "#btn-anonymous", () => {
    $.ajax({
      url: "/anonymous",
      method: "POST",
      dataType: "json",
      contentType: "application/json; charset=utf-8",
      success: (data) => {
        replaceBodyWith(data);
        drawGame();
      },
      error: (request, status, error) => {
        console.log(request.responseText);
        console.log(status);
        console.log(error);
      },
    });
  });

  /* user registration */
  $("body").on("click", "#btn-register", () => {
    var email = $("#input-email")[0].value;
    var username = $("#input-username")[0].value;
    var password = $("#input-password")[0].value;
    var data = { email, username, password };

    $.ajax({
      url: "/register",
      method: "POST",
      data: JSON.stringify(data),
      dataType: "json",
      contentType: "application/json; charset=utf-8",
      success: (data) => {
        replaceBodyWith(data);
        drawGame();
      },
      error: (request, status, error) => {
        console.log(request.responseText);
        console.log(status);
        console.log(error);
      },
    });
  });

  /* login */
  $("body").on("click", "#btn-login", () => {
    var email = $("#input-email")[0].value;
    var username = $("#input-username")[0].value;
    var password = $("#input-password")[0].value;
    var data = { email, username, password };

    $.ajax({
      url: "/login",
      method: "POST",
      data: JSON.stringify(data),
      dataType: "json",
      contentType: "application/json; charset=utf-8",
      success: (data) => {
        /* check if no user */
        replaceBodyWith(data);
        drawGame();
      },
      error: (request, status, error) => {
        replaceBodyWith(JSON.parse(request.responseText));
        console.log(request);
        console.log(status);
        console.log(error);
      },
    });
  });

  document.defaultAction = false;
});

function show_score(data) {
  const { score, topScore } = data;
  let points_element = $("#points");
  if (points_element) {
    points_element.empty();
    points_element.append(score + " | " + topScore + "&nbsp;");

    let slovo = point5Msg;
    if (score == 1) slovo = point1Msg;
    else if (score >= 2 && score <= 4) slovo = point24Msg;

    points_element.append(slovo);
  }
}

function show_zivoty(lives) {
  let lives_element = $("#lives");
  if (lives_element) {
    lives_element.empty();
    lives_element.append(lives + "&nbsp;");

    let slovo = live5Msg;
    if (lives == 1) slovo = live1Msg;
    else if (lives >= 2 && lives <= 4) slovo = live24Msg;

    lives_element.append(slovo);
  }
}

function show_level(data) {
  const { level, topLevel } = data;
  let level_element = $("#level");
  if (level_element) {
    level_element.empty();
    level_element.append(level + ". " + bludisteMsg + " | " + topLevel);
  }
}

function show_klice(klicu) {
  let keys_element = $("#keys");
  if (keys_element) {
    keys_element.empty();
    keys_element.append(klicu + "&nbsp;");

    let slovo = klic5Msg;
    if (klicu == 1) slovo = klic1Msg;
    else if (klicu >= 2 && klicu <= 4) slovo = klic24Msg;

    keys_element.append(slovo);
  }
}

function reverse_coords(pozice, xsize) {
  var x = pozice % xsize;
  var y = Math.floor(pozice / xsize);

  return new Array(x, y);
}

function nastavBarvu(pozice, barva, smer) {
  let image = spritesImg;
  let coords = reverse_coords(pozice, cols);
  let offset = get_pixel_offset(coords[0], coords[1]);
  let sx = 0;
  let sy = 0;
  let sWidth = square_size - 1;
  let sHeight = square_size - 1;
  let dx = offset.x;
  let dy = offset.y;
  let dWidth = square_size;
  let dHeight = square_size;

  // character head
  if (barva == 6) {
    // going right
    if (smer == 0) {
      sx = 0;
      sy = 0;
    }
    // going down
    else if (smer == 1) {
      sx = 49;
      sy = 0;
    }
    // going left
    else if (smer == 2) {
      sx = 0;
      sy = 49;
    }
    // going up
    else if (smer == 3) {
      sx = 49;
      sy = 49;
    }
  }

  // character body
  else if (barva == 1) {
    // going right
    if (smer == 0) {
      sx = 145;
      sy = 0;
    }
    // going down
    else if (smer == 1) {
      sx = 97;
      sy = 0;
    }

    // going left
    else if (smer == 2) {
      sx = 145;
      sy = 49;
    }
    // going up
    else if (smer == 3) {
      sx = 97;
      sy = 49;
    }
  }

  // food
  else if (barva == 2) {
    let random = Math.random() * 100;

    sy = 145;

    if (random < 25) {
      sx = 0;
    } else if (random < 50) {
      sx = 49;
    } else if (random < 75) {
      sx = 97;
    } else {
      sx = 145;
    }

    if (is_debug()) {
      console.log("jedlo sa zjavilo");
    }
  }

  // key
  else if (barva == 4) {
    sx = 97;
    sy = 97;

    if (is_debug()) {
      console.log("kluc sa zjavil");
    }
  }

  // background
  else if (barva == 0) {
    sx = 0;
    sy = 97;
  }

  // wall
  else if (barva == 3) {
    sx = 49;
    sy = 97;
  }

  // door
  else if (barva == 5) {
    sx = 145;
    sy = 97;

    if (is_debug()) {
      console.log("dvere sa zjavili");
    }
  }

  /* the link from the web returns the image 6 times larger */
  let scaler = 6;
  ctx.drawImage(
    image,
    sx * scaler,
    sy * scaler,
    sWidth * scaler,
    sHeight * scaler,
    dx,
    dy,
    dWidth,
    dHeight
  );
}

function get_pixel_offset(col, row) {
  let x = col * square_size;
  let y = row * square_size;
  return {
    x: x,
    y: y,
  };
}

function show_result(msg) {
  var element = document.getElementById("resultNew");
  if (element) element.innerHTML = msg;
}

function empty() {}
function callFinish(reason) {
  document["onkeydown"] = empty;
  document["onkeyup"] = empty;
}
