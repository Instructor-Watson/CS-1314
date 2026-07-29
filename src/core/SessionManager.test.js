import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SessionManager } from './SessionManager.js';

function createMockStorage() {
  return {
    data: {},
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(this.data, key) ? this.data[key] : null;
    },
    setItem(key, value) {
      this.data[key] = String(value);
    },
    removeItem(key) {
      delete this.data[key];
    },
    clear() {
      this.data = {};
    },
    get length() {
      return Object.keys(this.data).length;
    },
    key(index) {
      const keys = Object.keys(this.data);
      return keys[index] || null;
    }
  };
}

describe('SessionManager', () => {
  let sessionManager;
  let mockStorage;

  beforeEach(() => {
    mockStorage = createMockStorage();
    sessionManager = new SessionManager({ storage: mockStorage });
  });

  afterEach(() => {
    mockStorage.clear();
  });

  describe('saveCode', () => {
    it('should save code to browser storage with correct key', () => {
      const assignmentId = 'test-assignment';
      const code = 'def hello():\n    return "Hello"';

      sessionManager.saveCode(assignmentId, code);

      const savedCode = mockStorage.getItem('autograder_code_test-assignment');
      expect(savedCode).toBe(code);
    });

    it('should save empty string code', () => {
      const assignmentId = 'test-assignment';
      const code = '';

      sessionManager.saveCode(assignmentId, code);

      const savedCode = mockStorage.getItem('autograder_code_test-assignment');
      expect(savedCode).toBe('');
    });

    it('should overwrite existing code for the same assignment', () => {
      const assignmentId = 'test-assignment';
      const code1 = 'def hello(): pass';
      const code2 = 'def goodbye(): pass';

      sessionManager.saveCode(assignmentId, code1);
      sessionManager.saveCode(assignmentId, code2);

      const savedCode = mockStorage.getItem('autograder_code_test-assignment');
      expect(savedCode).toBe(code2);
    });

    it('should throw error for non-string assignment ID', () => {
      expect(() => sessionManager.saveCode(123, 'code')).toThrow('Assignment ID must be a non-empty string');
      expect(() => sessionManager.saveCode(null, 'code')).toThrow('Assignment ID must be a non-empty string');
      expect(() => sessionManager.saveCode(undefined, 'code')).toThrow('Assignment ID must be a non-empty string');
    });

    it('should throw error for empty assignment ID', () => {
      expect(() => sessionManager.saveCode('', 'code')).toThrow('Assignment ID must be a non-empty string');
      expect(() => sessionManager.saveCode('   ', 'code')).toThrow('Assignment ID must be a non-empty string');
    });

    it('should throw error for non-string code', () => {
      expect(() => sessionManager.saveCode('test', 123)).toThrow('Code must be a string');
      expect(() => sessionManager.saveCode('test', null)).toThrow('Code must be a string');
      expect(() => sessionManager.saveCode('test', undefined)).toThrow('Code must be a string');
    });
  });

  describe('loadCode', () => {
    it('should load saved code from browser storage', () => {
      const assignmentId = 'test-assignment';
      const code = 'def hello():\n    return "Hello"';

      sessionManager.saveCode(assignmentId, code);
      const loadedCode = sessionManager.loadCode(assignmentId);

      expect(loadedCode).toBe(code);
    });

    it('should return null for non-existent assignment', () => {
      const loadedCode = sessionManager.loadCode('non-existent');
      expect(loadedCode).toBeNull();
    });

    it('should load empty string code', () => {
      const assignmentId = 'test-assignment';
      sessionManager.saveCode(assignmentId, '');

      const loadedCode = sessionManager.loadCode(assignmentId);
      expect(loadedCode).toBe('');
    });

    it('should throw error for non-string assignment ID', () => {
      expect(() => sessionManager.loadCode(123)).toThrow('Assignment ID must be a non-empty string');
      expect(() => sessionManager.loadCode(null)).toThrow('Assignment ID must be a non-empty string');
      expect(() => sessionManager.loadCode(undefined)).toThrow('Assignment ID must be a non-empty string');
    });

    it('should throw error for empty assignment ID', () => {
      expect(() => sessionManager.loadCode('')).toThrow('Assignment ID must be a non-empty string');
      expect(() => sessionManager.loadCode('   ')).toThrow('Assignment ID must be a non-empty string');
    });
  });

  describe('clearCode', () => {
    it('should clear code for specific assignment', () => {
      const assignmentId = 'test-assignment';
      const code = 'def hello(): pass';

      sessionManager.saveCode(assignmentId, code);
      sessionManager.clearCode(assignmentId);

      const loadedCode = sessionManager.loadCode(assignmentId);
      expect(loadedCode).toBeNull();
    });

    it('should not affect other assignments when clearing one', () => {
      sessionManager.saveCode('assignment1', 'code1');
      sessionManager.saveCode('assignment2', 'code2');

      sessionManager.clearCode('assignment1');

      expect(sessionManager.loadCode('assignment1')).toBeNull();
      expect(sessionManager.loadCode('assignment2')).toBe('code2');
    });

    it('should not throw error when clearing non-existent assignment', () => {
      expect(() => sessionManager.clearCode('non-existent')).not.toThrow();
    });

    it('should throw error for non-string assignment ID', () => {
      expect(() => sessionManager.clearCode(123)).toThrow('Assignment ID must be a non-empty string');
      expect(() => sessionManager.clearCode(null)).toThrow('Assignment ID must be a non-empty string');
      expect(() => sessionManager.clearCode(undefined)).toThrow('Assignment ID must be a non-empty string');
    });

    it('should throw error for empty assignment ID', () => {
      expect(() => sessionManager.clearCode('')).toThrow('Assignment ID must be a non-empty string');
      expect(() => sessionManager.clearCode('   ')).toThrow('Assignment ID must be a non-empty string');
    });
  });

  describe('clearAll', () => {
    it('should clear all saved code', () => {
      sessionManager.saveCode('assignment1', 'code1');
      sessionManager.saveCode('assignment2', 'code2');
      sessionManager.saveCode('assignment3', 'code3');

      sessionManager.clearAll();

      expect(sessionManager.loadCode('assignment1')).toBeNull();
      expect(sessionManager.loadCode('assignment2')).toBeNull();
      expect(sessionManager.loadCode('assignment3')).toBeNull();
    });

    it('should only clear items with autograder prefix', () => {
      sessionManager.saveCode('assignment1', 'code1');
      mockStorage.setItem('other_key', 'other_value');

      sessionManager.clearAll();

      expect(sessionManager.loadCode('assignment1')).toBeNull();
      expect(mockStorage.getItem('other_key')).toBe('other_value');
    });

    it('should not throw error when clearing empty storage', () => {
      expect(() => sessionManager.clearAll()).not.toThrow();
    });

    it('should handle multiple clearAll calls', () => {
      sessionManager.saveCode('assignment1', 'code1');

      sessionManager.clearAll();
      sessionManager.clearAll();

      expect(sessionManager.loadCode('assignment1')).toBeNull();
    });
  });

  describe('getAllCode', () => {
    it('returns all saved drafts without the storage prefix', () => {
      sessionManager.saveCode('assignment1', 'code1');
      sessionManager.saveCode('assignment2', 'code2');
      mockStorage.setItem('other_key', 'ignore me');

      expect(sessionManager.getAllCode()).toEqual({
        assignment1: 'code1',
        assignment2: 'code2'
      });
    });
  });

  describe('exportData', () => {
    it('exports saved drafts in a portable format', () => {
      sessionManager.saveCode('assignment1', 'print(1)');

      const exported = sessionManager.exportData();

      expect(exported.version).toBe(1);
      expect(exported.exportedAt).toEqual(expect.any(String));
      expect(exported.saves).toEqual({ assignment1: 'print(1)' });
    });
  });

  describe('importData', () => {
    it('overwrites existing drafts with imported saves', () => {
      sessionManager.saveCode('old-assignment', 'old code');

      sessionManager.importData({
        version: 1,
        saves: {
          assignment1: 'code1',
          assignment2: 'code2'
        }
      });

      expect(sessionManager.loadCode('old-assignment')).toBeNull();
      expect(sessionManager.getAllCode()).toEqual({
        assignment1: 'code1',
        assignment2: 'code2'
      });
    });

    it('rejects invalid import payloads', () => {
      expect(() => sessionManager.importData(null)).toThrow('Imported data must be an object');
      expect(() => sessionManager.importData({})).toThrow('Imported data must include a saves object');
      expect(() => sessionManager.importData({ saves: { test: 123 } })).toThrow('Imported code for "test" must be a string');
    });
  });

  describe('integration scenarios', () => {
    it('should handle save, load, and clear workflow', () => {
      const assignmentId = 'workflow-test';
      const code = 'def test(): pass';

      sessionManager.saveCode(assignmentId, code);
      expect(sessionManager.loadCode(assignmentId)).toBe(code);

      const newCode = 'def test(): return True';
      sessionManager.saveCode(assignmentId, newCode);
      expect(sessionManager.loadCode(assignmentId)).toBe(newCode);

      sessionManager.clearCode(assignmentId);
      expect(sessionManager.loadCode(assignmentId)).toBeNull();
    });

    it('should preserve code across manager instances when using the same storage', () => {
      const assignmentId = 'persistent-assignment';
      const code = 'print("still here")';

      sessionManager.saveCode(assignmentId, code);

      const reloadedManager = new SessionManager({ storage: mockStorage });
      expect(reloadedManager.loadCode(assignmentId)).toBe(code);
    });

    it('should handle multiple assignments independently', () => {
      const assignments = [
        { id: 'assignment1', code: 'code1' },
        { id: 'assignment2', code: 'code2' },
        { id: 'assignment3', code: 'code3' }
      ];

      assignments.forEach(({ id, code }) => {
        sessionManager.saveCode(id, code);
      });

      assignments.forEach(({ id, code }) => {
        expect(sessionManager.loadCode(id)).toBe(code);
      });

      sessionManager.clearCode('assignment2');
      expect(sessionManager.loadCode('assignment1')).toBe('code1');
      expect(sessionManager.loadCode('assignment2')).toBeNull();
      expect(sessionManager.loadCode('assignment3')).toBe('code3');
    });
  });
});
