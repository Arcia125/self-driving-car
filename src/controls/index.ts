export class CarControls {
  private listening: boolean = false;
  constructor(
    public forward: boolean = false,
    public left: boolean = false,
    public right: boolean = false,
    public reverse: boolean = false
  ) {}

  #keydownHandlers = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'a':
      case 'ArrowLeft':
        this.left = true;
        break;
      case 'd':
      case 'ArrowRight':
        this.right = true
        break;
      case 'w':
      case 'ArrowUp':
        this.forward = true;
        break;
      case 's':
      case 'ArrowDown':
        this.reverse = true;
        break;
    }
  };

  #keyupHandlers = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'a':
      case 'ArrowLeft':
        this.left = false;
        break;
      case 'd':
      case 'ArrowRight':
        this.right = false
        break;
      case 'w':
      case 'ArrowUp':
        this.forward = false;
        break;
      case 's':
      case 'ArrowDown':
        this.reverse = false;
        break;
    }
  };

  #addKeyboardListeners = () => {
    this.listening = true;
    document.addEventListener('keydown', this.#keydownHandlers);
    document.addEventListener('keyup', this.#keyupHandlers);
  }

  #removeKeyboardListeners = () => {
    this.listening = false;
    document.removeEventListener('keydown', this.#keydownHandlers);
    document.removeEventListener('keyup', this.#keyupHandlers);
  }

  listen = () => {
    if (this.listening) {
      console.warn("Can't start listening, because Controls are already listening");
      return;
    }
    this.#addKeyboardListeners();
  };

  close = () => {
    if (!this.listening) {
      console.warn("Can't stop lisening, because Controls are not listening");
      return;
    }
    this.#removeKeyboardListeners();
  }
}
