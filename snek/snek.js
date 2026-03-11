const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const gridsize = 20;
const canvassize = 600;
const inset = 0;
const width = canvas.width;
const height = canvas.height;

let devMode = false;
const mod = window.location.hash;

if (mod === "#dev") document.body.style.backgroundColor = "red";

let players;
let snakes = [];
let dirs = [];
let score = [ 0, 0, 0, 0 ];
let htmlScore = document.getElementById("score").children;
let gameOver = [ false, false, false, false ];
let htmlGameOver = document.getElementById("gameover").children;

let food;
let foodEmoji;

let speed = 120;
let loopTimer;

const gameOverMsgs = [
  "SNEX MADE BAD LIFE CHOICES",
  "SNEX RAGRET EVERYTHING",
  "EX-SNEX",
  "WHO STEP ON SNEK?",
  "SNEK! SNEK! SNEEEEEEEEK!",
];

const foods = [
  // fruits
  "🍇", "🍈", "🍉", "🍊", "🍋", "🍋‍🟩", "🍌", "🍍", "🥭", "🍎", "🍏", "🍐", "🍑", "🍒", "🍓", "🫐", "🥝", "🍅", "🫒", "🥥", // vegetables "🍄", "🥑", "🍆", "🥔", "🥕", "🌽", "🌶️", "🫑", "🥒", "🥬", "🥦", "🧄", "🧅", "🥜", "🫘", "🌰", "🫚", "🫛", "🍄‍🟫", "🫜",
  // prepared foods
  "🍞", "🥐", "🥖", "🫓", "🥨", "🥯", "🥞", "🧇", "🧀", "🍖", "🍗", "🥩", "🥓", "🍔", "🍟", "🍕", "🌭", "🥪", "🌮", "🌯", "🫔", "🥙", "🧆", "🥚", "🍳", "🥘", "🍲", "🫕", "🥣", "🥗", "🍿", "🧈", "🧂", "🥫",
  // Asian foods
  "🍱", "🍘", "🍙", "🍚", "🍛", "🍜", "🍝", "🍠", "🍢", "🍣", "🍤", "🍥", "🥮", "🍡", "🥟", "🥠", "🥡",
  // seafood
  "🦀", "🦞", "🦐", "🦑", "🦪",
  // sweets
  "🍦", "🍧", "🍨", "🍩", "🍪", "🎂", "🍰", "🧁", "🥧", "🍫", "🍬", "🍭", "🍮", "🍯",
  // drinks
  "🍼", "🥛", "☕", "🫖", "🍵", "🍶", "🍾", "🍷", "🍸", "🍹", "🍺", "🍻", "🥂", "🥃", "🫗", "🥤", "🧋", "🧃", "🧉", "🧊",
  // hands
  "👋", "🤚", "🖐️", "✋", "🖖", "🫱", "🫲", "🫳", "🫴", "🫷", "🫸", "👌", "🤌", "🤏", "✌️", "🤞", "🫰", "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", "🫵", "👍", "👎", "✊", "👊", "🤛", "🤜", "👏",
  // body parts
  "💪", "🦵", "🦶", "👂", "👃",
  // people
  "👶", "🧒", "👦", "👧", "🧑", "👱", "👨", "🧔", "🧔‍♂️", "🧔‍♀️", "👨‍🦰", "👨‍🦱", "👨‍🦳", "👨‍🦲", "👩", "👩‍🦰", "🧑‍🦰", "👩‍🦱", "🧑‍🦱", "👩‍🦳", "🧑‍🦳", "👩‍🦲", "🧑‍🦲", "👱‍♀️", "👱‍♂️", "🧓", "👴", "👵",
];

const spawnPositions = [
  { x: inset, y: canvassize / 2 },
  { x: canvassize - inset, y: canvassize / 2 },
  { x: canvassize / 2, y: inset },
  { x: canvassize / 2, y: canvassize - inset },
];

const colors = ["#66f033", "#0096ff", "#ff8910", "#bf40bf"];

function isGameOver() {
  return (players == 1) ? (gameOver[0] == true) : (gameOver.filter(x => !x).length <= 1);
}

function spawnFood() {
  foodEmoji = foods[Math.floor(Math.random() * foods.length)];
  return {
    x: Math.floor(Math.random() * (width / gridsize)) * gridsize,
    y: Math.floor(Math.random() * (height / gridsize)) * gridsize,
  };
}

function resetGame() {
  players = parseInt(document.getElementById("playerCount").value);

  snakes = [];
  dirs = [
    { x: +gridsize, y: 0 },
    { x: -gridsize, y: 0 },
    { x: 0, y: +gridsize },
    { x: 0, y: -gridsize },
  ];

  for (let i = 0; i < players; i++) {
    snakes.push([{ x: spawnPositions[i].x, y: spawnPositions[i].y }]);
  }

  food = spawnFood();
  score = [ 0, 0, 0, 0 ];
  for (let i = 0; i < snakes.length; i++) gameOver[i] = !(i < players);
}

resetGame();

document.addEventListener("keydown", (e) => {
  // P1
  if (!gameOver[0]) {
    if (e.key === "w") dirs[0] = { x: 0, y: -gridsize };
    if (e.key === "s") dirs[0] = { x: 0, y: gridsize };
    if (e.key === "a") dirs[0] = { x: -gridsize, y: 0 };
    if (e.key === "d") dirs[0] = { x: gridsize, y: 0 };
  }

  // P2
  if (!gameOver[1]) {
    if (e.key === "ArrowUp" && dirs[1]) dirs[1] = { x: 0, y: -gridsize };
    if (e.key === "ArrowDown" && dirs[1]) dirs[1] = { x: 0, y: gridsize };
    if (e.key === "ArrowLeft" && dirs[1]) dirs[1] = { x: -gridsize, y: 0 };
    if (e.key === "ArrowRight" && dirs[1]) dirs[1] = { x: gridsize, y: 0 };
  }

  // P3
  if (!gameOver[2]) {
    if (e.key === "i" && dirs[2]) dirs[2] = { x: 0, y: -gridsize };
    if (e.key === "k" && dirs[2]) dirs[2] = { x: 0, y: gridsize };
    if (e.key === "j" && dirs[2]) dirs[2] = { x: -gridsize, y: 0 };
    if (e.key === "l" && dirs[2]) dirs[2] = { x: gridsize, y: 0 };
  }

  // P4
  if (!gameOver[3]) {
    if (e.key === "t" && dirs[3]) dirs[3] = { x: 0, y: -gridsize };
    if (e.key === "g" && dirs[3]) dirs[3] = { x: 0, y: gridsize };
    if (e.key === "f" && dirs[3]) dirs[3] = { x: -gridsize, y: 0 };
    if (e.key === "h" && dirs[3]) dirs[3] = { x: gridsize, y: 0 };
  }

  if ((isGameOver() || devMode) && e.key === "r") resetGame();


  if (mod === "#dev") {
    if (e.key === "p") {
      devMode = !devMode;
      if (devMode) for (let i = 0; i < snakes.length; i++) dirs[i] = { x: 0, y: 0};
      document.body.style.backgroundColor = "black";
    }
  }
});

function moveSnake(i) {
  if (dirs[i].x == 0 && dirs[i].y == 0) return;

  const snake = snakes[i];
  const dir = dirs[i];

  const head = {
    x: snake[0].x + dir.x,
    y: snake[0].y + dir.y,
  };

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score[i]++;
    food = spawnFood();
  } else {
    snake.pop();
  }
}

function wall(h) {
  return h.x < 0 || h.y < 0 || h.x >= width || h.y >= height;
}

function collision() {
  let ret = [ false, false, false, false ];
  for (let i = 0; i < snakes.length; i++) {
    const head = snakes[i][0];

    if (wall(head)) ret[i] = true;

    for (let j = 0; j < snakes.length; j++) {
      for (let k = i === j ? 1 : 0; k < snakes[j].length; k++) {
        const s = snakes[j][k];

        if (head.x === s.x && head.y === s.y) ret[i] = true;
      }
    }
  }

  return ret;
}

function drawSnake(snake, color, number) {
  ctx.fillStyle = color;

  snake.forEach((s, i) => {
    ctx.fillRect(s.x, s.y, gridsize, gridsize);

    if (i === 0) {
      ctx.font = "10px monospace"
      ctx.fillText("👅", s.x + 4, s.y + 22);
      ctx.fillStyle = "white";

      ctx.beginPath();
      ctx.arc(s.x + 6, s.y + 8, 3 + ((number & 1) << 1), 0, Math.PI * 2);
      ctx.arc(s.x + 14, s.y + 8, 3 + (number & 2), 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "black";

      ctx.beginPath();
      ctx.arc(s.x + 6, s.y + 8, 1.5 + 0.5 * (number > 1), 0, Math.PI * 2);
      ctx.arc(s.x + 14, s.y + 8, 1.5 + 0.5 * (number > 1), 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = color;
    }
  });
}

function update() {
  if (isGameOver()) return;

  for (let i = 0; i < snakes.length; i++) moveSnake(i);

  collide = collision();
  for (let i = 0; i < snakes.length; i++)
    if (collide[i]) {
      gameOver[i] = true;
      dirs[i] = { x: 0, y: 0 };
    }

  if (isGameOver()) {
    gameOverMsg = gameOverMsgs[Math.floor(Math.random() * gameOverMsgs.length)];
  }
}

function draw() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, width, height);

  ctx.font = "20px monospace";
  ctx.fillText(foodEmoji, food.x + 2, food.y + 18);

  for (let i = 0; i < snakes.length; i++) drawSnake(snakes[i], colors[i], i);

  ctx.fillStyle = "white";
  ctx.font = "16px monospace";
  for (let i = 0; i < 4; i++) {
    htmlScore[i].innerText = score[i];
    htmlGameOver[i].innerText = (i < players) ? (gameOver[i] ? "DED" : "LIF") : "-";
  }

  if (isGameOver()) {
    ctx.font = "28px monospace";
    ctx.fillText(gameOverMsg, 130, 200);
    ctx.font = "16px monospace";
    ctx.fillText("PRESS R OR RESTART", 230, 230);
  }
}

function gameLoop() {
  update();
  draw();
}

function startLoop() {
  clearInterval(loopTimer);
  loopTimer = setInterval(gameLoop, speed);
}

startLoop();

const slider = document.getElementById("speedSlider");
const label = document.getElementById("speedLabel");

slider.addEventListener("input", () => {
  speed = slider.value;
  label.textContent = speed + " ms";
  startLoop();
});
