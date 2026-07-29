/**
 * Property-based tests for SessionManager
 * Feature: python-autograder-web-app
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
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

describe('SessionManager Property Tests', () => {
  /**
   * Property 2: Code Persistence Round Trip
   *
   * For any valid Python code string stored in the editor, if the code is saved
   * to browser storage and then retrieved, the retrieved code should be identical
   * to the original code.
   */
  it('Property 2: should preserve code through save and load round trip', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
        fc.string(),
        (assignmentId, code) => {
          const storage = createMockStorage();
          const sessionManager = new SessionManager({ storage });

          sessionManager.saveCode(assignmentId, code);
          const retrievedCode = sessionManager.loadCode(assignmentId);

          expect(retrievedCode).toBe(code);
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property 25: Persistent Local Storage
   *
   * For any student code saved during a session, the code should be stored in
   * browser-local storage and still be available to a new SessionManager instance
   * using that same storage backend.
   */
  it('Property 25: should preserve code across manager instances in local browser storage', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
        fc.string({ minLength: 1 }),
        (assignmentId, code) => {
          const storage = createMockStorage();
          const firstManager = new SessionManager({ storage });

          firstManager.saveCode(assignmentId, code);

          const storageKey = firstManager.storagePrefix + assignmentId;
          expect(storage.getItem(storageKey)).toBe(code);

          const reloadedManager = new SessionManager({ storage });
          expect(reloadedManager.loadCode(assignmentId)).toBe(code);
        }
      ),
      { numRuns: 10 }
    );
  });
});
