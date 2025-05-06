declare module 'stockfish' {
  class Stockfish {
    constructor();
    postMessage(message: string): void;
    addEventListener(event: string, callback: (event: string) => void): void;
    removeEventListener(event: string, callback: (event: string) => void): void;
    onmessage: ((event: string) => void) | null;
  }
  export default Stockfish;
} 