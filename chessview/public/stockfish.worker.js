self.importScripts('/stockfish.js');

self.onmessage = function(e) {
  self.postMessage(e.data);
}; 