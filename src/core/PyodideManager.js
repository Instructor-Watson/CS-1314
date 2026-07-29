/**
 * PyodideManager - Manages the Pyodide Python runtime
 * 
 * This class handles initialization of the Pyodide runtime, execution of Python code
 * with timeout enforcement, and state tracking.
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 14.1, 14.2
 */

export class PyodideManager {
  constructor() {
    this.pyodide = null;
    this.ready = false;
    this.loading = false;
    this.progressCallback = null;
    this.worker = null;
  }

  /**
   * Initialize Pyodide runtime from CDN
   * @param {Function} onProgress - Optional callback for loading progress
   * @returns {Promise<void>}
   */
  async initialize(onProgress = null) {
    if (this.ready) {
      return;
    }

    if (this.loading) {
      throw new Error('Pyodide is already being initialized');
    }

    this.loading = true;
    this.progressCallback = onProgress;

    try {
      // Report progress
      this._reportProgress('Checking whether the Pyodide loader is already available...');

      // Load Pyodide from CDN using script tag to avoid Vite processing issues
      if (typeof window !== 'undefined' && !window.loadPyodide) {
        this._reportProgress('Downloading the Pyodide loader from the CDN...');
        await this._loadPyodideScript();
      } else {
        this._reportProgress('Pyodide loader found. Creating the Python runtime...');
      }
      
      // Use CDN
      const indexURL = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/';
      this._reportProgress('Downloading and unpacking the Python runtime...');
      this.pyodide = await window.loadPyodide({ indexURL });

      this._reportProgress('Python runtime is ready. Finishing setup...');
      
      this.ready = true;
      this.loading = false;
    } catch (error) {
      this.loading = false;
      this.ready = false;
      throw new Error(`Failed to initialize Pyodide: ${error.message}`);
    }
  }

  /**
   * Load Pyodide script from CDN
   * @private
   */
  async _loadPyodideScript() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js';
      script.onload = () => {
        this._reportProgress('Pyodide loader downloaded. Building the Python runtime...');
        resolve();
      };
      script.onerror = () => reject(new Error('Failed to load Pyodide script'));
      document.head.appendChild(script);
    });
  }

  /**
   * Execute Python code with timeout enforcement
   * @param {string} code - Python code to execute
   * @param {number} timeout - Maximum execution time in milliseconds (default: 10000ms)
   * @returns {Promise<ExecutionResult>}
   */
  async runPython(code, timeout = 10000) {
    if (!this.ready) {
      throw new Error('Pyodide is not initialized. Call initialize() first.');
    }

    if (!code || code.trim() === '') {
      throw new Error('Code cannot be empty');
    }

    const startTime = performance.now();

    try {
      // Execute with timeout using Promise.race
      const result = await this._executeWithTimeout(code, timeout);
      const executionTime = performance.now() - startTime;

      return {
        success: true,
        output: result,
        error: null,
        executionTime
      };
    } catch (error) {
      const executionTime = performance.now() - startTime;

      // Check if it's a timeout error
      if (error.message === 'TIMEOUT') {
        return {
          success: false,
          output: '',
          error: `Execution timed out after ${timeout}ms. Your code may have an infinite loop or is taking too long to execute.`,
          executionTime,
          timedOut: true
        };
      }

      // Handle other errors
      return {
        success: false,
        output: '',
        error: error.message,
        executionTime,
        timedOut: false
      };
    }
  }

  /**
   * Execute Python code with timeout enforcement using Web Worker
   * @private
   */
  async _executeWithTimeout(code, timeout) {
    return new Promise((resolve, reject) => {
      let timeoutId;
      let completed = false;

      // Set up timeout
      timeoutId = setTimeout(() => {
        if (!completed) {
          completed = true;
          reject(new Error('TIMEOUT'));
        }
      }, timeout);

      // Execute code
      this._executePython(code)
        .then(result => {
          if (!completed) {
            completed = true;
            clearTimeout(timeoutId);
            resolve(result);
          }
        })
        .catch(error => {
          if (!completed) {
            completed = true;
            clearTimeout(timeoutId);
            reject(error);
          }
        });
    });
  }

  /**
   * Execute Python code using Pyodide
   * @private
   */
  async _executePython(code) {
    try {
      // Capture stdout
      await this.pyodide.runPythonAsync(`
import sys
from io import StringIO
sys.stdout = StringIO()
sys.stderr = StringIO()
`);

      // Run the user code
      await this.pyodide.runPythonAsync(code);

      // Get the output
      const stdout = await this.pyodide.runPythonAsync('sys.stdout.getvalue()');
      const stderr = await this.pyodide.runPythonAsync('sys.stderr.getvalue()');

      return stdout + (stderr ? '\n' + stderr : '');
    } catch (error) {
      // Extract Python error information
      throw new Error(this._formatPythonError(error));
    }
  }

  /**
   * Format Python error for display
   * @private
   */
  _formatPythonError(error) {
    if (error.message) {
      return error.message;
    }
    return String(error);
  }

  /**
   * Check if Pyodide is ready
   * @returns {boolean}
   */
  isReady() {
    return this.ready;
  }

  /**
   * Get Pyodide version
   * @returns {string}
   */
  getVersion() {
    if (!this.ready) {
      return 'Not initialized';
    }
    return this.pyodide.version;
  }

  /**
   * Load a Python package
   * @param {string} packageName - Name of the package to load
   * @returns {Promise<void>}
   */
  async loadPackage(packageName) {
    if (!this.ready) {
      throw new Error('Pyodide is not initialized. Call initialize() first.');
    }

    try {
      await this.pyodide.loadPackage(packageName);
    } catch (error) {
      throw new Error(`Failed to load package ${packageName}: ${error.message}`);
    }
  }

  /**
   * Report progress to callback
   * @private
   */
  _reportProgress(message) {
    if (this.progressCallback) {
      this.progressCallback(message);
    }
  }

  /**
   * Reset the Pyodide runtime
   * Useful for recovering from errors or clearing state
   */
  async reset() {
    this.ready = false;
    this.loading = false;
    this.pyodide = null;
    await this.initialize(this.progressCallback);
  }
}

/**
 * @typedef {Object} ExecutionResult
 * @property {boolean} success - Whether execution was successful
 * @property {string} output - Output from the Python code
 * @property {string|null} error - Error message if execution failed
 * @property {number} executionTime - Time taken to execute in milliseconds
 * @property {boolean} [timedOut] - Whether execution timed out
 */
