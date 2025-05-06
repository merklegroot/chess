declare const self: Worker;

self.importScripts('/stockfish.js');

self.onmessage = function(e: MessageEvent) {
  self.postMessage(e.data);
}; 