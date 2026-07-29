/**
 * SessionManager - Manages browser storage for assignment code persistence
 *
 * This class stores assignment-scoped student code in local browser storage so
 * students can leave the page and return to their work later. If localStorage
 * is unavailable, it falls back to another available browser storage area.
 */
export class SessionManager {
  constructor(options = {}) {
    this.storagePrefix = options.storagePrefix || 'autograder_code_';
    this.storage = options.storage || this._resolveStorage();
  }

  /**
   * Save code for a specific assignment to browser storage
   * @param {string} assignmentId - The unique identifier for the assignment
   * @param {string} code - The code to save
   */
  saveCode(assignmentId, code) {
    if (typeof assignmentId !== 'string' || assignmentId.trim() === '') {
      throw new Error('Assignment ID must be a non-empty string');
    }

    if (typeof code !== 'string') {
      throw new Error('Code must be a string');
    }

    const key = this.storagePrefix + assignmentId;
    this.storage.setItem(key, code);
  }

  /**
   * Load code for a specific assignment from browser storage
   * @param {string} assignmentId - The unique identifier for the assignment
   * @returns {string|null} The saved code, or null if not found
   */
  loadCode(assignmentId) {
    if (typeof assignmentId !== 'string' || assignmentId.trim() === '') {
      throw new Error('Assignment ID must be a non-empty string');
    }

    const key = this.storagePrefix + assignmentId;
    return this.storage.getItem(key);
  }

  /**
   * Clear code for a specific assignment from browser storage
   * @param {string} assignmentId - The unique identifier for the assignment
   */
  clearCode(assignmentId) {
    if (typeof assignmentId !== 'string' || assignmentId.trim() === '') {
      throw new Error('Assignment ID must be a non-empty string');
    }

    const key = this.storagePrefix + assignmentId;
    this.storage.removeItem(key);
  }

  /**
   * Clear all saved code from browser storage
   */
  clearAll() {
    const keysToRemove = [];

    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key && key.startsWith(this.storagePrefix)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => this.storage.removeItem(key));
  }

  /**
   * Return all saved assignment drafts in browser storage.
   * @returns {Record<string, string>}
   */
  getAllCode() {
    const savedCode = {};

    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (!key || !key.startsWith(this.storagePrefix)) {
        continue;
      }

      const assignmentId = key.slice(this.storagePrefix.length);
      savedCode[assignmentId] = this.storage.getItem(key) ?? '';
    }

    return savedCode;
  }

  /**
   * Build an exportable snapshot of saved browser drafts.
   * @returns {{version: number, exportedAt: string, saves: Record<string, string>}}
   */
  exportData() {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      saves: this.getAllCode()
    };
  }

  /**
   * Overwrite saved browser drafts from an imported snapshot.
   * @param {Object} data
   */
  importData(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new Error('Imported data must be an object');
    }

    const { saves } = data;
    if (!saves || typeof saves !== 'object' || Array.isArray(saves)) {
      throw new Error('Imported data must include a saves object');
    }

    const entries = Object.entries(saves);
    entries.forEach(([assignmentId, code]) => {
      if (typeof assignmentId !== 'string' || assignmentId.trim() === '') {
        throw new Error('Imported assignment IDs must be non-empty strings');
      }

      if (typeof code !== 'string') {
        throw new Error(`Imported code for "${assignmentId}" must be a string`);
      }
    });

    this.clearAll();
    entries.forEach(([assignmentId, code]) => {
      this.saveCode(assignmentId, code);
    });
  }

  _resolveStorage() {
    const localStorageRef = this._getGlobalStorage('localStorage');
    if (this._canUseStorage(localStorageRef)) {
      return localStorageRef;
    }

    const sessionStorageRef = this._getGlobalStorage('sessionStorage');
    if (this._canUseStorage(sessionStorageRef)) {
      return sessionStorageRef;
    }

    return this._createMemoryStorage();
  }

  _getGlobalStorage(storageName) {
    try {
      return globalThis?.[storageName] || null;
    } catch {
      return null;
    }
  }

  _canUseStorage(storage) {
    if (!storage) {
      return false;
    }

    try {
      const testKey = `${this.storagePrefix}availability_check`;
      storage.setItem(testKey, '1');
      storage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  _createMemoryStorage() {
    const data = new Map();

    return {
      getItem(key) {
        return data.has(key) ? data.get(key) : null;
      },
      setItem(key, value) {
        data.set(key, String(value));
      },
      removeItem(key) {
        data.delete(key);
      },
      clear() {
        data.clear();
      },
      get length() {
        return data.size;
      },
      key(index) {
        return Array.from(data.keys())[index] || null;
      }
    };
  }
}
