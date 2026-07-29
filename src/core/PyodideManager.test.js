/**
 * Unit tests for PyodideManager
 * Requirements: 3.1, 3.2, 11.3
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PyodideManager } from './PyodideManager.js';

describe('PyodideManager', () => {
  let manager;

  beforeEach(() => {
    manager = new PyodideManager();
  });

  describe('initialization', () => {
    it('should start with ready state as false', () => {
      expect(manager.isReady()).toBe(false);
    });

    it('should initialize successfully', async () => {
      await manager.initialize();
      expect(manager.isReady()).toBe(true);
    }, 30000); // Increase timeout for Pyodide loading

    it('should call progress callback during initialization', async () => {
      const progressCallback = vi.fn();
      await manager.initialize(progressCallback);
      
      expect(progressCallback).toHaveBeenCalled();
      expect(progressCallback.mock.calls.length).toBeGreaterThan(0);
    }, 30000);

    it('should not reinitialize if already ready', async () => {
      await manager.initialize();
      const firstPyodide = manager.pyodide;
      
      await manager.initialize();
      expect(manager.pyodide).toBe(firstPyodide);
    }, 30000);

    it('should throw error if initialization is already in progress', async () => {
      const promise1 = manager.initialize();
      
      await expect(manager.initialize()).rejects.toThrow('already being initialized');
      
      await promise1;
    }, 30000);
  });

  describe('runPython', () => {
    beforeEach(async () => {
      await manager.initialize();
    }, 30000);

    it('should execute valid Python code successfully', async () => {
      const code = 'print("Hello, World!")';
      const result = await manager.runPython(code);
      
      expect(result.success).toBe(true);
      expect(result.output).toContain('Hello, World!');
      expect(result.error).toBeNull();
      expect(result.executionTime).toBeGreaterThan(0);
    });

    it('should return output from Python code', async () => {
      const code = 'print(2 + 2)';
      const result = await manager.runPython(code);
      
      expect(result.success).toBe(true);
      expect(result.output).toContain('4');
    });

    it('should handle Python syntax errors', async () => {
      const code = 'print("missing closing quote';
      const result = await manager.runPython(code);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should handle Python runtime errors', async () => {
      const code = 'x = 1 / 0';
      const result = await manager.runPython(code);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
      expect(result.error).toContain('division');
    });

    it('should throw error if Pyodide is not initialized', async () => {
      const uninitializedManager = new PyodideManager();
      const code = 'print("test")';
      
      await expect(uninitializedManager.runPython(code)).rejects.toThrow('not initialized');
    });

    it('should throw error for empty code', async () => {
      await expect(manager.runPython('')).rejects.toThrow('cannot be empty');
      await expect(manager.runPython('   ')).rejects.toThrow('cannot be empty');
    });

    it('should enforce timeout for long-running code', async () => {
      const code = `
import time
time.sleep(2)
print("Done")
`;
      const result = await manager.runPython(code, 500); // 500ms timeout
      
      expect(result.success).toBe(false);
      expect(result.timedOut).toBe(true);
      expect(result.error).toContain('timed out');
    }, 10000);

    it('should complete fast code within timeout', async () => {
      const code = 'print("Fast code")';
      const result = await manager.runPython(code, 5000);
      
      expect(result.success).toBe(true);
      expect(result.timedOut).toBeUndefined();
    });
  });

  describe('getVersion', () => {
    it('should return "Not initialized" when not ready', () => {
      expect(manager.getVersion()).toBe('Not initialized');
    });

    it('should return version string when initialized', async () => {
      await manager.initialize();
      const version = manager.getVersion();
      
      expect(version).toBeTruthy();
      expect(typeof version).toBe('string');
      expect(version).not.toBe('Not initialized');
    }, 30000);
  });

  describe('loadPackage', () => {
    beforeEach(async () => {
      await manager.initialize();
    }, 30000);

    it('should throw error if not initialized', async () => {
      const uninitializedManager = new PyodideManager();
      await expect(uninitializedManager.loadPackage('numpy')).rejects.toThrow('not initialized');
    });

    it('should load a valid package', async () => {
      await expect(manager.loadPackage('micropip')).resolves.not.toThrow();
    }, 30000);
  });

  describe('reset', () => {
    it('should reset and reinitialize Pyodide', async () => {
      await manager.initialize();
      expect(manager.isReady()).toBe(true);
      
      await manager.reset();
      expect(manager.isReady()).toBe(true);
    }, 60000);
  });
});
