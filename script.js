const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const restartBtn = document.getElementById("restartBtn");

// Arka plan
const backgroundImage = new Image();
backgroundImage.src = "assets/dragon-bg.png";

// Kuş görselleri
const birdOpen = new Image();
birdOpen.src = "assets/bird-open.png";
const birdClosed = new Image();
birdClosed.src = "assets/bird-closed.png";

// Kuş özellikleri
let bird = {
  x: 50,
  y: 150,
  width: 40,
  height: 40,
  gravity: 0.25,
  lift: -6.5,
  velocity: 0
};

let pipes = [];
let pipeWidth = 50;
let gap = 140;
let pipeFrequency = 180;
let frame = 0;
let score = 0;
let isGameOver = false;
let isFlapping = false;
let birdAngle = 0;

// Kuşu zıplat
function flap() {
  if (!isGameOver) {
    bird.velocity = bird.lift;
    isFlapping = true;
  }
}

// Klavye kontrolü
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") flap();
});
document.addEventListener("keyup", (e) => {
  if (e.code === "Space") isFlapping = false;
});

// Fare kontrolü
canvas.addEventListener("mousedown", () => {
  flap();
});
canvas.addEventListener("mouseup", () => {
  isFlapping = false;
});

// Dokunmatik kontrol
canvas.addEventListener("touchstart", () => {
  flap();
});
canvas.addEventListener("touchend", () => {
  isFlapping = false;
});

// Oyun bitirme
function gameOver() {
  isGameOver = true;
  ctx.fillStyle = "red";
  ctx.font = "50px Arial";
  ctx.textAlign = "center";
  ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);

  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.fillText("Skorun: " + score, canvas.width / 2, canvas.height / 2 + 50);

  restartBtn.style.display = "block";
}

// Yeniden başlat
restartBtn.addEventListener("click", () => {
  score = 0;
  pipes = [];
  bird.y = 150;
  bird.velocity = 0;
  frame = 0;
  isGameOver = false;
  restartBtn.style.display = "none";
  draw();
});

// Boru üret
function addPipe() {
  let top = Math.random() * (canvas.height - gap - 100);
  pipes.push({
    x: canvas.width,
    top: top,
    bottom: top + gap,
    passed: false
  });
}

// Boruları çiz
function drawPipes() {
  for (let i = 0; i < pipes.length; i++) {
    let p = pipes[i];
    p.x -= 1.5;

    ctx.fillStyle = "green";
    ctx.fillRect(p.x, 0, pipeWidth, p.top);
    ctx.fillRect(p.x, p.bottom, pipeWidth, canvas.height - p.bottom);

    if (
      bird.x < p.x + pipeWidth &&
      bird.x + bird.width > p.x &&
      (bird.y < p.top || bird.y + bird.height > p.bottom)
    ) {
      gameOver();
      return;
    }

    if (!p.passed && p.x + pipeWidth < bird.x) {
      score++;
      p.passed = true;
    }
  }

  if (pipes.length && pipes[0].x + pipeWidth < 0) {
    pipes.shift();
  }
}

// Oyun döngüsü
function draw() {
  if (isGameOver) return;

  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

  // Fizik
  bird.velocity += bird.gravity;
  bird.velocity *= 0.98;
  bird.velocity = Math.min(bird.velocity, 8);
  bird.y += bird.velocity;

  birdAngle = bird.velocity < 0
    ? Math.max(birdAngle - 1, -20)
    : Math.min(birdAngle + 1, 40);

  const currentBirdImage = isFlapping ? birdOpen : birdClosed;

  ctx.save();
  ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
  ctx.rotate((birdAngle * Math.PI) / 180);
  ctx.drawImage(currentBirdImage, -bird.width / 2, -bird.height / 2, bird.width, bird.height);
  ctx.restore();

  if (bird.y + bird.height > canvas.height || bird.y < 0) {
    gameOver();
    return;
  }

  frame++;
  if (frame % pipeFrequency === 0) {
    addPipe();
  }

  drawPipes();

  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.textAlign = "left";
  ctx.fillText("Skor: " + score, 10, 50);

  requestAnimationFrame(draw);
}

draw();