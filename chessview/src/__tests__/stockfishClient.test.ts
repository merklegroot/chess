import { stockfishClient } from '../app/clients/stockfishClient/stockfishClient';
import { uciResponse } from '../app/clients/stockfishClient/uciResponse';

// Treat these as integration tests.
// We're testing the client against the stockfish engine.
// We're not mocking anything.

describe('stockfishClient', () => {
  describe('uciRaw', () => {
    it('should return at least one response line', async () => {
      const responses = await stockfishClient.uciRaw();
      console.log('Stockfish responses:', responses);
      expect(responses.length).toBeGreaterThan(0);
    }, 10000);
  });

  describe('uci', () => {
    it('should return a parsed UCI response with version', async () => {
      const response = await stockfishClient.uci();
      console.log('Parsed UCI response:', response);
      expect(response).toBeDefined();
      expect(response.type).toBe('uci:response');
      expect(response.payload).toContain('Stockfish');
      expect(response.version).toMatch(/^\d+\.\d+$/);
    }, 10000);
  });

  describe('isReadyRaw', () => {
    it('should send isReady', async () => {
      const responses = await stockfishClient.isReadyRaw();
      console.log('Ready responses:', responses);
      expect(responses.length).toBeGreaterThan(0);
    }, 10000);
  });
});