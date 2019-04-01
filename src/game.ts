interface Cell {
  x: number;
  y: number;
}

export default class Game {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private snake: Array<Cell>;
  private direction: string;
  private mouseX: number;
  private mouseY: number;
  private gameInterval: number;
  private handlerLock: boolean;

  static get GAME_SIZE(): number {
    return 600;
  }

  static get SNAKE_SIZE(): number {
    return Game.GAME_SIZE / 30;
  }

  static get SNAKE_COLOR(): string {
    return '#108380';
  }

  static get GAME_SPEED(): number {
    return 100;
  }

  set setDirection(direction: string) {
    if (
      (this.direction === 'left' && direction === 'right') ||
      (this.direction === 'right' && direction === 'left') ||
      (this.direction === 'top' && direction === 'down') ||
      (this.direction === 'down' && direction === 'top')
    ) {
      return;
    }

    this.direction = direction;
  }

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.setAttribute('width', `${Game.GAME_SIZE}`);
    this.canvas.setAttribute('height', `${Game.GAME_SIZE}`);
    this.context = this.canvas.getContext('2d');

    document.body.appendChild(this.canvas);

    this.direction = 'right';
    this.handlerLock = false;

    this.drawSnake = this.drawSnake.bind(this);
    this.keysHandler = this.keysHandler.bind(this);

    this.playGame();
  }

  playGame() {
    this.createSnake();
    this.createMouse();
    this.addListeners();

    this.gameInterval = setInterval(() => {
      this.drawGame();
      this.drawMouse();
      this.snakeMove();
      this.changeDirection();
      this.snake.forEach(this.drawSnake);
      this.handlerLock = false;

      // Snake crashed into the wall.
      if (
        this.snake[0].x + Game.SNAKE_SIZE > Game.GAME_SIZE ||
        this.snake[0].x < 0 ||
        this.snake[0].y + Game.SNAKE_SIZE > Game.GAME_SIZE ||
        this.snake[0].y < 0
      ) {
        this.gameOver();
        return;
      }

      // Snake bit himself.
      for (let i: number = 2; i < this.snake.length; i++) {
        if (this.snake[0].x === this.snake[i].x && this.snake[0].y === this.snake[i].y) {
          this.gameOver();
          return;
        }
      }

      // The user won.
      if (this.snake.length === Math.pow(Game.GAME_SIZE / Game.SNAKE_SIZE, 2)) {
        this.gameOver();
        return;
      }
    }, Game.GAME_SPEED);
  }

  createSnake() {
    this.snake = [
      {
        x: Game.GAME_SIZE / 2,
        y: Game.GAME_SIZE / 2
      }
    ];
  }

  snakeMove() {
    const firstCell: Cell = { x: this.snake[0].x, y: this.snake[0].y };
    this.snake.unshift(firstCell);

    if (this.mouseX === this.snake[0].x && this.mouseY === this.snake[0].y) {
      this.createMouse();
    } else {
      this.snake.pop();
    }
  }

  changeDirection() {
    switch (this.direction) {
      case 'left':
        this.snake[0].x = this.snake[0].x - Game.SNAKE_SIZE;
        break;
      case 'top':
        this.snake[0].y = this.snake[0].y - Game.SNAKE_SIZE;
        break;
      case 'right':
        this.snake[0].x = this.snake[0].x + Game.SNAKE_SIZE;
        break;
      case 'down':
        this.snake[0].y = this.snake[0].y + Game.SNAKE_SIZE;
        break;
    }
  }

  drawGame() {
    this.context.clearRect(0, 0, Game.GAME_SIZE, Game.GAME_SIZE);
    this.context.fillStyle = 'white';
    this.context.strokeStyle = 'black';
    this.context.fillRect(0, 0, Game.GAME_SIZE, Game.GAME_SIZE);
    this.context.strokeRect(0, 0, Game.GAME_SIZE, Game.GAME_SIZE);
  }

  drawSnake(cell: Cell) {
    this.context.fillStyle = Game.SNAKE_COLOR;
    this.context.fillRect(cell.x, cell.y, Game.SNAKE_SIZE, Game.SNAKE_SIZE);
  }

  drawMouse() {
    this.context.fillStyle = 'pink';
    this.context.fillRect(this.mouseX, this.mouseY, Game.SNAKE_SIZE, Game.SNAKE_SIZE);
  }

  createMouse() {
    const mouseX: number =
      (Math.floor((Math.random() * Game.GAME_SIZE) / Game.SNAKE_SIZE - 1) + 1) * Game.SNAKE_SIZE;
    const mouseY: number =
      (Math.floor((Math.random() * Game.GAME_SIZE) / Game.SNAKE_SIZE - 1) + 1) * Game.SNAKE_SIZE;

    if (this.snake.filter(cell => cell.x === mouseX && cell.y === mouseY).length === 0) {
      this.mouseX = mouseX;
      this.mouseY = mouseY;
      this.drawMouse();
    } else {
      this.createMouse();
    }
  }

  keysHandler(e: KeyboardEvent) {
    if (this.handlerLock) {
      return;
    }

    switch (e.keyCode) {
      case 37:
        this.setDirection = 'left';
        break;
      case 38:
        this.setDirection = 'top';
        break;
      case 39:
        this.setDirection = 'right';
        break;
      case 40:
        this.setDirection = 'down';
        break;
    }

    this.handlerLock = true;
  }

  gameOver() {
    clearInterval(this.gameInterval);
    this.removeListeners();
    if (confirm(`Game Over. Your score is ${this.snake.length - 1}. Want to play again?`)) {
      this.playGame();
    }
  }

  addListeners() {
    document.addEventListener('keydown', this.keysHandler);
  }

  removeListeners() {
    document.removeEventListener('keydown', this.keysHandler);
  }
}
