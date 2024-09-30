let divGame = document.querySelector("#divGame");
let divScore;
let snake = { head: { x: 0, y: 0 }, tail: [] };
let rodent = { x: 0, y: 0 };
let direction;
let size;
let speed = 250;
let lost = false;
let score = 1;
let frameInterval;

document.querySelector("#btnStart").addEventListener("click", function () {
  size = document.querySelector("#txtSize").value;

  // Add the message labels
  divScore = document.createElement("div");
  divScore.setAttribute("id", "divScore");
  document.body.appendChild(divScore);

  // Construct the grid
  let table = document.createElement("table");
  table.setAttribute("cellspacing", 0);
  table.setAttribute("class", "gameTable");
  document.body.appendChild(table);
  for (let i = 0; i < size; i++) {
    let row = document.createElement("tr");
    table.appendChild(row);
    for (let j = 0; j < size; j++) {
      let block = document.createElement("td");
      block.setAttribute("class", "blockOff");
      block.setAttribute("id", ["block", j, i].join(""));
      row.appendChild(block);
    }
  }

  // Create the snake
  let xVal = getRandomInt(0, size - 1);
  let yVal = getRandomInt(0, size - 1);
  snake.head = { x: xVal, y: yVal };

  // Create the tail
  direction = getRandomInt(1, 4);
  let block = getDirectionalBlock(snake.head.x, snake.head.y, direction);
  while (!isblockValid(block.x, block.y, size, snake)) {
    direction = getRandomInt(1, 4);
    block = getDirectionalBlock(snake.head.x, snake.head.y, direction);
  }
  snake.tail.push({ x: block.x, y: block.y });

  // Set opposite direction for movement
  direction =
    direction === 1 ? 2 : direction === 2 ? 1 : direction === 3 ? 4 : 3;

  // Random rodent
  rodent = getRandomRodent(size, snake);

  // Update score
  updateScore(score);

  // Draw initial grid
  redrawGrid(size, table, snake, rodent);

  // Start frame interval
  setTimeout(() => {
    startFrames(size, table, snake, rodent);
  }, 2000);

  // Key down events
  document.addEventListener("keydown", function (event) {
    let block;
    let currentDirection = direction;
    if (event.keyCode == 38) direction = 3; // Up
    else if (event.keyCode == 39) direction = 2; // Right
    else if (event.keyCode == 37) direction = 1; // Left
    else if (event.keyCode == 40) direction = 4; // Down

    block = getDirectionalBlock(snake.head.x, snake.head.y, direction);
    if (!isblockValid(block.x, block.y, size, snake)) {
      direction = currentDirection;
    }
  });
});

function startFrames(size, table, snake, rodent) {
  let intervalFunction = () => {
    let nextBlock = getDirectionalBlock(snake.head.x, snake.head.y, direction);

    if (!isblockValid(nextBlock.x, nextBlock.y, size, snake)) {
      gameLost();
      clearInterval(frameInterval);
    } else {
      if (nextBlock.x === rodent.x && nextBlock.y === rodent.y) {
        score++;
        speed = Math.max(speed - 10, 10);
        clearInterval(frameInterval);
        frameInterval = setInterval(intervalFunction, speed);

        updateScore(score);
        snake.tail = [{ x: snake.head.x, y: snake.head.y }, ...snake.tail];
        snake.head = { x: rodent.x, y: rodent.y };
        rodent = getRandomRodent(size, snake);
      } else {
        let tempHead = { x: snake.head.x, y: snake.head.y };
        snake.head = { x: nextBlock.x, y: nextBlock.y };
        for (let i = snake.tail.length - 1; i >= 1; i--) {
          snake.tail[i] = { x: snake.tail[i - 1].x, y: snake.tail[i - 1].y };
        }
        snake.tail[0] = { x: tempHead.x, y: tempHead.y };
      }
      redrawGrid(size, table, snake, rodent);
    }
  };
  frameInterval = setInterval(intervalFunction, speed);
}

function redrawGrid(size, table, snake, rodent) {
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      table
        .querySelector(["#block", i, j].join(""))
        .setAttribute("class", "blockOff");
    }
  }
  table
    .querySelector(["#block", snake.head.x, snake.head.y].join(""))
    .setAttribute("class", "blockSnakeHead");
  snake.tail.forEach((obj) => {
    table
      .querySelector(["#block", obj.x, obj.y].join(""))
      .setAttribute("class", "blockSnakeTail");
  });
  table
    .querySelector(["#block", rodent.x, rodent.y].join(""))
    .setAttribute("class", "blockSnakeRodent");
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomRodent(size, snake) {
  let availableBlocks = getAvailableBlocks(size, snake);
  let randomIdx = getRandomInt(0, availableBlocks.length - 1);
  return availableBlocks[randomIdx];
}

function isblockValid(x, y, size, snake) {
  if (x < 0 || x >= size || y < 0 || y >= size) return false;
  if (x === snake.head.x && y === snake.head.y) return false;
  return !snake.tail.some((t) => t.x === x && t.y === y);
}

function getDirectionalBlock(x, y, direction) {
  switch (direction) {
    case 1:
      return { x: x - 1, y: y }; // left
    case 2:
      return { x: x + 1, y: y }; // right
    case 3:
      return { x: x, y: y - 1 }; // top
    case 4:
      return { x: x, y: y + 1 }; // bottom
  }
}

function getAvailableBlocks(size, snake) {
  let blocks = [];
  let snakeArr = [...snake.tail, snake.head];
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (!snakeArr.some((b) => b.x === i && b.y === j)) {
        blocks.push({ x: i, y: j });
      }
    }
  }
  return blocks;
}

function updateScore(score) {
  divScore.innerHTML = `Score: ${score}`;
}

function gameLost() {
  divScore.innerHTML += ", YOU LOST";
  lost = true;
}
