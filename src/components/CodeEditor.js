/**
 * CodeEditor Component
 * Wraps Monaco Editor with Python-specific configuration
 *
 * Requirements: 1.1, 1.2, 1.3, 1.5, 12.1, 12.2, 12.3, 12.4, 12.5
 */

import * as monaco from 'monaco-editor';
import 'monaco-editor/esm/vs/basic-languages/python/python.contribution';

export class CodeEditor {
  constructor() {
    this.editor = null;
    this.container = null;
    this.changeCallback = null;
    this.saveCallback = null;
    this.sessionManager = null;
    this.currentAssignmentId = null;
    this.autoSaveDebounceTimer = null;
    this.autoSaveDelay = 350;
    this.pendingAutoSave = null;
    this.suppressAutoSave = false;
    this.view = null;
    this.resizeObserver = null;
    this.resizeFrame = null;
    this.pageHideHandler = () => {
      this.flushAutoSave();
    };
    this.visibilityChangeHandler = () => {
      if (this.view?.document?.visibilityState === 'hidden') {
        this.flushAutoSave();
      }
    };
  }

  /**
   * Initialize the Monaco Editor
   * @param {HTMLElement} container - The DOM element to mount the editor
   * @param {Object} options - Editor configuration options
   */
  initialize(container, options = {}) {
    if (!container) {
      throw new Error('Container element is required');
    }

    this.container = container;
    this.view = container.ownerDocument?.defaultView || null;

    const defaultOptions = {
      language: 'python',
      theme: 'vs-dark',
      fontSize: 14,
      tabSize: 4,
      insertSpaces: true,
      lineNumbers: 'on',
      automaticLayout: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      scrollPredominantAxis: true,
      wordWrap: 'on',
      autoIndent: 'full',
      formatOnType: true,
      formatOnPaste: true,
      bracketPairColorization: {
        enabled: true
      },
      matchBrackets: 'always',
      autoClosingBrackets: 'always',
      autoClosingQuotes: 'always',
      folding: true,
      foldingStrategy: 'indentation',
      renderLineHighlight: 'all',
      cursorBlinking: 'smooth',
      smoothScrolling: true,
      padding: { top: 10, bottom: 10 }
    };

    const editorOptions = { ...defaultOptions, ...options };

    this.editor = monaco.editor.create(container, editorOptions);

    this._setupKeyboardShortcuts();
    this._bindLifecycleEvents();
    this._bindResizeObserver();
    this._scheduleLayout();

    this.editor.onDidChangeModelContent(() => {
      const value = this.getValue();

      if (this.changeCallback) {
        this.changeCallback(value);
      }

      if (!this.suppressAutoSave) {
        this._handleAutoSave(value);
      }
    });

    return this.editor;
  }

  /**
   * Configure keyboard shortcuts for common operations
   * @private
   */
  _setupKeyboardShortcuts() {
    this.editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
      () => {
        if (this.saveCallback) {
          this.saveCallback(this.getValue());
        }
      }
    );
  }

  /**
   * Set the SessionManager instance for auto-save functionality
   * @param {SessionManager} sessionManager - The SessionManager instance
   */
  setSessionManager(sessionManager) {
    if (!sessionManager) {
      throw new Error('SessionManager instance is required');
    }

    this.sessionManager = sessionManager;
  }

  /**
   * Load code for a specific assignment
   * Loads saved code when available, otherwise uses provided starter code
   * @param {string} assignmentId - The assignment identifier
   * @param {string} starterCode - The default starter code (optional)
   */
  loadAssignment(assignmentId, starterCode = '') {
    if (!assignmentId || typeof assignmentId !== 'string') {
      throw new Error('Assignment ID must be a non-empty string');
    }

    this.flushAutoSave();
    this.currentAssignmentId = assignmentId;

    let codeToLoad = starterCode;
    if (this.sessionManager) {
      const savedCode = this.sessionManager.loadCode(assignmentId);
      if (savedCode !== null) {
        codeToLoad = savedCode;
      }
    }

    this.setValue(codeToLoad, { suppressAutoSave: true });
    this._scheduleLayout();
  }

  /**
   * Handle auto-save with debouncing
   * @private
   */
  _handleAutoSave(code = this.getValue()) {
    if (!this.sessionManager || !this.currentAssignmentId) {
      return;
    }

    if (this.autoSaveDebounceTimer) {
      clearTimeout(this.autoSaveDebounceTimer);
    }

    this.pendingAutoSave = {
      assignmentId: this.currentAssignmentId,
      code
    };

    this.autoSaveDebounceTimer = setTimeout(() => {
      this._persistPendingAutoSave();
    }, this.autoSaveDelay);
  }

  /**
   * Immediately flush any pending auto-save operation
   */
  flushAutoSave() {
    this._persistPendingAutoSave();
  }

  _persistPendingAutoSave() {
    if (this.autoSaveDebounceTimer) {
      clearTimeout(this.autoSaveDebounceTimer);
      this.autoSaveDebounceTimer = null;
    }

    if (!this.pendingAutoSave || !this.sessionManager) {
      this.pendingAutoSave = null;
      return;
    }

    const { assignmentId, code } = this.pendingAutoSave;
    this.pendingAutoSave = null;

    try {
      this.sessionManager.saveCode(assignmentId, code);
    } catch (error) {
      console.error('Failed to auto-save code locally:', error);
    }
  }

  _bindLifecycleEvents() {
    if (!this.view) {
      return;
    }

    this.view.addEventListener('pagehide', this.pageHideHandler);
    this.view.addEventListener('beforeunload', this.pageHideHandler);
    this.view.document?.addEventListener('visibilitychange', this.visibilityChangeHandler);
  }

  _removeLifecycleEvents() {
    if (!this.view) {
      return;
    }

    this.view.removeEventListener('pagehide', this.pageHideHandler);
    this.view.removeEventListener('beforeunload', this.pageHideHandler);
    this.view.document?.removeEventListener('visibilitychange', this.visibilityChangeHandler);
  }

  _bindResizeObserver() {
    const ResizeObserverCtor = this.view?.ResizeObserver || globalThis.ResizeObserver;
    if (!ResizeObserverCtor || !this.container) {
      return;
    }

    this.resizeObserver = new ResizeObserverCtor(() => {
      this._scheduleLayout();
    });

    this.resizeObserver.observe(this.container);
  }

  _removeResizeObserver() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }

  _scheduleLayout() {
    if (!this.editor) {
      return;
    }

    if (this.resizeFrame !== null && this.view?.cancelAnimationFrame) {
      this.view.cancelAnimationFrame(this.resizeFrame);
      this.resizeFrame = null;
    }

    if (this.view?.requestAnimationFrame) {
      this.resizeFrame = this.view.requestAnimationFrame(() => {
        this.resizeFrame = null;
        this.layout();
      });
      return;
    }

    this.layout();
  }

  /**
   * Force Monaco to recalculate its layout for the current container size.
   */
  layout() {
    if (!this.editor || !this.container || typeof this.editor.layout !== 'function') {
      return;
    }

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    if (width === 0 || height === 0) {
      return;
    }

    this.editor.layout({ width, height });
  }

  /**
   * Manually save the current code to browser storage
   */
  saveToSession() {
    if (!this.sessionManager || !this.currentAssignmentId) {
      throw new Error('SessionManager and assignment ID must be configured');
    }

    this.pendingAutoSave = {
      assignmentId: this.currentAssignmentId,
      code: this.getValue()
    };
    this._persistPendingAutoSave();
  }

  /**
   * Get the current code value from the editor
   * @returns {string} The current code content
   */
  getValue() {
    if (!this.editor) {
      throw new Error('Editor not initialized');
    }
    return this.editor.getValue();
  }

  /**
   * Set the code value in the editor
   * @param {string} code - The code to set
   * @param {Object} options - Set behavior overrides
   */
  setValue(code, options = {}) {
    if (!this.editor) {
      throw new Error('Editor not initialized');
    }

    const { suppressAutoSave = false } = options;
    const previousAutoSaveState = this.suppressAutoSave;

    if (suppressAutoSave) {
      this.suppressAutoSave = true;
    }

    try {
      this.editor.setValue(code || '');
    } finally {
      this.suppressAutoSave = previousAutoSaveState;
    }

    this._scheduleLayout();
  }

  /**
   * Set the editor to read-only mode
   * @param {boolean} readOnly - Whether the editor should be read-only
   */
  setReadOnly(readOnly) {
    if (!this.editor) {
      throw new Error('Editor not initialized');
    }
    this.editor.updateOptions({ readOnly });
  }

  /**
   * Focus the editor
   */
  focus() {
    if (!this.editor) {
      throw new Error('Editor not initialized');
    }
    this.editor.focus();
  }

  /**
   * Register a callback for value changes
   * @param {Function} callback - Function to call when value changes
   */
  onValueChange(callback) {
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }
    this.changeCallback = callback;
  }

  /**
   * Register a callback for save action (Ctrl+S)
   * @param {Function} callback - Function to call when save is triggered
   */
  onSave(callback) {
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }
    this.saveCallback = callback;
  }

  /**
   * Get the Monaco editor instance
   * @returns {monaco.editor.IStandaloneCodeEditor} The Monaco editor instance
   */
  getEditor() {
    return this.editor;
  }

  /**
   * Dispose of the editor and clean up resources
   */
  dispose() {
    this.flushAutoSave();
    this._removeLifecycleEvents();
    this._removeResizeObserver();

    if (this.resizeFrame !== null && this.view?.cancelAnimationFrame) {
      this.view.cancelAnimationFrame(this.resizeFrame);
      this.resizeFrame = null;
    }

    if (this.editor) {
      this.editor.dispose();
      this.editor = null;
    }

    this.changeCallback = null;
    this.saveCallback = null;
    this.sessionManager = null;
    this.currentAssignmentId = null;
    this.pendingAutoSave = null;
    this.view = null;
  }
}

