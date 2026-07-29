/**
 * Main entry point for the Python Submission Check Web Application
 *
 * This is the main App component that coordinates all other components and manages
 * the application workflow.
 *
 * Requirements: 14.1, 14.2, 14.3
 */

import { PyodideManager } from './core/PyodideManager.js';
import { AutograderEngine } from './core/AutograderEngine.js';
import { FeedbackGenerator } from './core/FeedbackGenerator.js';
import { AssignmentLoader } from './core/AssignmentLoader.js';
import { SessionManager } from './core/SessionManager.js';
import { StarterTemplateLoader } from './core/StarterTemplateLoader.js';
import { downloadSubmission } from './core/SubmissionDownload.js';
import { downloadSessionBackup, parseSessionBackupText } from './core/SessionTransfer.js';

import { CodeEditor } from './components/CodeEditor.js';
import { AssignmentSelector } from './components/AssignmentSelector.js';
import { AssignmentViewer } from './components/AssignmentViewer.js';
import { SubmitButton } from './components/SubmitButton.js';
import { ResultsPanel } from './components/ResultsPanel.js';
import { FeedbackDisplay } from './components/FeedbackDisplay.js';

class App {
  constructor() {
    this.pyodideManager = new PyodideManager();
    this.autograderEngine = null;
    this.feedbackGenerator = new FeedbackGenerator();
    this.assignmentLoader = new AssignmentLoader('assignments.json');
    this.sessionManager = new SessionManager();
    this.starterTemplateLoader = new StarterTemplateLoader('templates');

    this.codeEditor = new CodeEditor();
    this.assignmentSelector = new AssignmentSelector();
    this.assignmentViewer = new AssignmentViewer();
    this.submitButton = new SubmitButton();
    this.resultsPanel = new ResultsPanel();
    this.feedbackDisplay = new FeedbackDisplay();

    this.currentAssignment = null;
    this.assignments = [];
    this.runtimeReady = false;
    this.uploadButton = null;
    this.uploadInput = null;
    this.downloadButton = null;
    this.headerTransferActions = null;
    this.workspaceReadyActions = null;
    this.workspaceReadyFeedback = null;
    this.workspaceReadyFeedbackTimeout = null;
    this.exportAllButton = null;
    this.importAllButton = null;
    this.importAllInput = null;
    this.restartButton = null;
    this.editorToggleButton = null;
    this.restartAssignmentModal = null;
    this.restartAssignmentTitle = null;
    this.restartAssignmentDescription = null;
    this.restartConfirmButton = null;
    this.restartCancelButton = null;
    this.restartModalPreviousFocus = null;
    this.importSavedCodeModal = null;
    this.importSavedCodeConfirmButton = null;
    this.importSavedCodeCancelButton = null;
    this.importSavedCodeModalPreviousFocus = null;
    this.editorContainerElement = null;
    this.editorResizeShell = null;
    this.editorResizeHandle = null;
    this.resultsContainerElement = null;
    this.workspaceEmptyState = null;
    this.workspaceLoadingState = null;
    this.workspaceReadyState = null;
    this.workspaceLoadingTitle = null;
    this.workspaceLoadingMessage = null;
    this.loadingHandoffOverlay = null;
    this.assignmentSelectorShell = null;
    this.latestStatusMessage = 'Initializing Python environment...';
    this.assignmentLoading = false;
    this.assignmentSelectionToken = 0;
    this.editorCollapsed = false;
    this.activeResizeStop = null;
    this.startupTransitionPlayed = false;
    this.boundRestartModalKeydownHandler = (event) => {
      if (event.key === 'Escape') {
        this.closeRestartAssignmentModal();
      }
    };
    this.boundImportSavedCodeModalKeydownHandler = (event) => {
      if (event.key === 'Escape') {
        this.closeImportSavedCodeModal();
      }
    };
  }

  /**
   * Initialize the application
   * Requirement 14.1: Initialize PyodideManager on application load
   * Requirement 14.2: Display loading indicator during Pyodide initialization
   */
  async initialize() {
    console.log('Initializing Python Submission Check...');

    try {
      this.workspaceEmptyState = document.getElementById('workspace-empty-state');
      this.workspaceLoadingState = this.workspaceEmptyState?.querySelector('.workspace-loading-state') || null;
      this.workspaceReadyState = this.workspaceEmptyState?.querySelector('.workspace-ready-state') || null;
      this.workspaceLoadingTitle = document.getElementById('workspace-loading-title');
      this.workspaceLoadingMessage = document.getElementById('workspace-loading-message');
      this.workspaceReadyActions = document.getElementById('workspace-ready-actions');
      this.workspaceReadyFeedback = document.getElementById('workspace-ready-feedback');
      this.loadingHandoffOverlay = document.getElementById('loading-handoff-overlay');
      this.assignmentSelectorShell = document.querySelector('.assignment-selector-shell');
      this.setWorkspaceEmptyStateMode('loading');
      this.updateStatus('Loading Python runtime...');

      await this.pyodideManager.initialize((progress) => {
        this.updateStatus(progress);
      });

      console.log('Pyodide initialized successfully');

      this.autograderEngine = new AutograderEngine(this.pyodideManager);

      this.updateStatus('Initializing code editor...');
      await this.initializeComponents();

      this.updateStatus('Loading assignments...');
      await this.loadAssignments();

      this.runtimeReady = true;
      this.updateStatus('Ready');
      this.updateWorkspaceSelectionState();

      console.log('Application initialized successfully');
    } catch (error) {
      console.error('Failed to initialize application:', error);
      this.updateStatus('Initialization failed');
      this.showError('Failed to initialize the application. Please refresh the page and try again.');
    }
  }

  /**
   * Initialize all UI components
   */
  async initializeComponents() {
    const editorContainer = document.getElementById('code-editor');
    this.codeEditor.initialize(editorContainer, {
      value: '# Write your Python code here\n'
    });
    this.codeEditor.setSessionManager(this.sessionManager);

    this.editorContainerElement = document.querySelector('.editor-container');
    this.editorResizeShell = document.querySelector('.editor-resize-shell');
    this.editorResizeHandle = document.querySelector('.editor-resize-handle');
    this.resultsContainerElement = document.querySelector('.results-container');
    this.workspaceEmptyState = document.getElementById('workspace-empty-state');
    this.workspaceLoadingState = this.workspaceEmptyState?.querySelector('.workspace-loading-state') || null;
    this.workspaceReadyState = this.workspaceEmptyState?.querySelector('.workspace-ready-state') || null;
    this.workspaceLoadingTitle = document.getElementById('workspace-loading-title');
    this.workspaceLoadingMessage = document.getElementById('workspace-loading-message');
    this.workspaceReadyActions = document.getElementById('workspace-ready-actions');
    this.loadingHandoffOverlay = document.getElementById('loading-handoff-overlay');
    this.assignmentSelectorShell = document.querySelector('.assignment-selector-shell');
    this.updateWorkspaceLoadingState(this.latestStatusMessage);
    this.editorToggleButton = this.createEditorToggleButton();
    this.bindEditorResizeHandle();
    this.initializeRestartAssignmentModal();
    this.initializeImportSavedCodeModal();
    this.initializeHeaderTransferActions();

    const assignmentDetailsContainer = document.getElementById('assignment-details');
    this.assignmentViewer.initialize(assignmentDetailsContainer);

    const submitButtonContainer = document.createElement('div');
    submitButtonContainer.id = 'submit-button-container';
    const editorActionsContainer = document.createElement('div');
    editorActionsContainer.id = 'editor-actions';
    editorActionsContainer.className = 'editor-actions';

    const editorPrimaryActions = document.createElement('div');
    editorPrimaryActions.className = 'editor-primary-actions';

    this.uploadInput = this.createUploadInput();
    this.uploadButton = this.createUploadButton();
    this.restartButton = this.createRestartButton();
    this.downloadButton = this.createDownloadButton();
    editorPrimaryActions.appendChild(this.uploadInput);
    editorPrimaryActions.appendChild(this.restartButton);
    editorPrimaryActions.appendChild(this.uploadButton);
    editorPrimaryActions.appendChild(this.downloadButton);
    editorPrimaryActions.appendChild(submitButtonContainer);

    editorActionsContainer.appendChild(this.editorToggleButton);
    editorActionsContainer.appendChild(editorPrimaryActions);

    const oldButton = document.getElementById('submit-button');
    if (oldButton && oldButton.parentNode) {
      oldButton.parentNode.replaceChild(editorActionsContainer, oldButton);
    }

    this.submitButton.initialize(submitButtonContainer, { label: 'Run Tests' });
    this.submitButton.disable();
    this.submitButton.onSubmit(() => this.handleSubmit());

    const resultsPanelContainer = document.getElementById('results-panel');
    this.resultsPanel.initialize(resultsPanelContainer);

    const feedbackDisplayContainer = document.getElementById('feedback-display');
    this.feedbackDisplay.initialize(feedbackDisplayContainer);

    this.assignmentViewer.clear();
    this.resultsPanel.clearResults();
    this.feedbackDisplay.clearFeedback();
    this.updateEditorCollapseState();
    this.updateWorkspaceSelectionState();

    console.log('UI components initialized');
  }

  /**
   * Create the editor collapse toggle button
   * @returns {HTMLButtonElement}
   */
  createEditorToggleButton() {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'editor-toggle-button';
    button.innerHTML = `
      <span class="editor-toggle-button-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">
          <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41Z" fill="currentColor"/>
        </svg>
      </span>
      <span class="editor-toggle-button-label">Hide Editor</span>
    `;
    button.addEventListener('click', () => this.toggleEditorCollapsed());
    return button;
  }

  /**
   * Create the hidden file input used to import Python files
   * @returns {HTMLInputElement}
   */
  createUploadInput() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.py,text/x-python,text/plain';
    input.hidden = true;
    input.tabIndex = -1;
    input.setAttribute('aria-hidden', 'true');
    input.addEventListener('change', (event) => {
      this.handleUploadSelection(event);
    });
    return input;
  }

  initializeHeaderTransferActions() {
    this.headerTransferActions = document.getElementById('header-transfer-actions');
    if (!this.headerTransferActions) {
      return;
    }

    this.importAllInput = this.createImportAllInput();
    this.exportAllButton = this.createExportAllButton();
    this.importAllButton = this.createImportAllButton();
    this.headerTransferActions.replaceChildren(
      this.importAllInput,
      this.exportAllButton
    );

    if (this.workspaceReadyActions) {
      this.workspaceReadyActions.replaceChildren(this.importAllButton);
    }
  }

  createImportAllInput() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.hidden = true;
    input.tabIndex = -1;
    input.setAttribute('aria-hidden', 'true');
    input.addEventListener('change', (event) => {
      this.handleImportAllSelection(event);
    });
    return input;
  }

  createExportAllButton() {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'header-data-button';
    button.title = 'Export all saved code';
    button.setAttribute('aria-label', 'Export all saved code');
    button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3a1 1 0 0 1 1 1v7.59l2.3-2.29a1 1 0 1 1 1.4 1.41l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.41L11 11.59V4a1 1 0 0 1 1-1Zm-7 14a1 1 0 0 1 1 1v1h12v-1a1 1 0 1 1 2 0v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1Z" fill="currentColor"/></svg>';
    button.addEventListener('click', () => this.handleExportAllData());
    return button;
  }

  createImportAllButton() {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'workspace-import-button';
    button.title = 'Import all saved code';
    button.setAttribute('aria-label', 'Import all saved code');
    button.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M12 21a1 1 0 0 1-1-1v-7.59l-2.3 2.29a1 1 0 1 1-1.4-1.41l4-4a1 1 0 0 1 1.4 0l4 4a1 1 0 0 1-1.4 1.41L13 12.41V20a1 1 0 0 1-1 1Zm7-14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8a1 1 0 1 1 2 0v1h12V8a1 1 0 0 1 1-1Z" fill="currentColor"/>
      </svg>
      <span>Import saved code</span>
    `;
    button.addEventListener('click', () => this.handleImportAllClick());
    return button;
  }

  /**
   * Create the editor upload button
   * @returns {HTMLButtonElement}
   */
  createUploadButton() {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'upload-button';
    button.disabled = true;
    button.title = 'Upload Python file';
    button.setAttribute('aria-label', 'Upload Python file');
    button.innerHTML =       `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M12 4a1 1 0 0 1 .7.29l4 4a1 1 0 1 1-1.4 1.42L13 7.41V16a1 1 0 1 1-2 0V7.41L8.7 9.71a1 1 0 1 1-1.4-1.42l4-4A1 1 0 0 1 12 4Zm-7 13a1 1 0 0 1 1 1v1h12v-1a1 1 0 1 1 2 0v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1Z" fill="currentColor"/>
      </svg>
    `;
    button.addEventListener('click', () => {
      this.handleUploadClick();
    });
    return button;
  }

  /**
   * Create the editor restart button
   * @returns {HTMLButtonElement}
   */
  createRestartButton() {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'restart-button';
    button.disabled = true;
    button.title = 'Restart assignment';
    button.setAttribute('aria-label', 'Restart assignment');
    button.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M12 5V2L7 6l5 4V7c2.76 0 5 2.24 5 5a5 5 0 0 1-8.66 3.46 1 1 0 0 0-1.41 1.42A7 7 0 1 0 12 5Z" fill="currentColor"/>
      </svg>
    `;
    button.addEventListener('click', () => this.requestAssignmentRestart());
    return button;
  }

  /**
   * Create the editor download button
   * @returns {HTMLButtonElement}
   */
  createDownloadButton() {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'download-button';
    button.disabled = true;
    button.title = 'Download code';
    button.setAttribute('aria-label', 'Download code');
    button.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M12 3a1 1 0 0 1 1 1v8.59l2.3-2.29a1 1 0 1 1 1.4 1.41l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.41L11 12.59V4a1 1 0 0 1 1-1Zm-7 14a1 1 0 0 1 1 1v1h12v-1a1 1 0 1 1 2 0v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1Z" fill="currentColor"/>
      </svg>
    `;
    button.addEventListener('click', () => this.handleDownload());
    return button;
  }

  initializeRestartAssignmentModal() {
    this.restartAssignmentModal = document.getElementById('restart-assignment-modal');
    this.restartAssignmentTitle = document.getElementById('restart-assignment-title');
    this.restartAssignmentDescription = document.getElementById('restart-assignment-description');
    this.restartConfirmButton = document.getElementById('restart-assignment-confirm');
    this.restartCancelButton = document.getElementById('restart-assignment-cancel');

    if (!this.restartAssignmentModal || !this.restartAssignmentTitle || !this.restartAssignmentDescription || !this.restartConfirmButton || !this.restartCancelButton) {
      throw new Error('Restart assignment modal elements are required');
    }

    this.restartAssignmentModal.addEventListener('click', (event) => {
      if (event.target === this.restartAssignmentModal) {
        this.closeRestartAssignmentModal();
      }
    });

    this.restartCancelButton.addEventListener('click', () => {
      this.closeRestartAssignmentModal();
    });

    this.restartConfirmButton.addEventListener('click', async () => {
      this.closeRestartAssignmentModal({ restoreFocus: false });
      await this.handleRestartAssignment();
    });
  }

  openRestartAssignmentModal() {
    if (!this.currentAssignment || !this.restartAssignmentModal || this.assignmentLoading) {
      return;
    }

    this.restartModalPreviousFocus = this.restartButton || document.activeElement;
    this.restartAssignmentTitle.textContent = `Restart ${this.currentAssignment.title}?`;
    this.restartAssignmentDescription.textContent = `This will replace your current code with the original template for ${this.currentAssignment.title}.`;
    this.restartAssignmentModal.hidden = false;
    document.body.classList.add('modal-open');
    document.addEventListener('keydown', this.boundRestartModalKeydownHandler);
    this.restartCancelButton.focus();
  }

  closeRestartAssignmentModal(options = {}) {
    const { restoreFocus = true } = options;

    if (!this.restartAssignmentModal || this.restartAssignmentModal.hidden) {
      return;
    }

    this.restartAssignmentModal.hidden = true;
    document.body.classList.remove('modal-open');
    document.removeEventListener('keydown', this.boundRestartModalKeydownHandler);

    if (restoreFocus && this.restartModalPreviousFocus && typeof this.restartModalPreviousFocus.focus === 'function') {
      this.restartModalPreviousFocus.focus();
    }

    this.restartModalPreviousFocus = null;
  }

  requestAssignmentRestart() {
    if (!this.currentAssignment || this.assignmentLoading) {
      return;
    }

    this.openRestartAssignmentModal();
  }


  initializeImportSavedCodeModal() {
    this.importSavedCodeModal = document.getElementById('import-saved-code-modal');
    this.importSavedCodeConfirmButton = document.getElementById('import-saved-code-confirm');
    this.importSavedCodeCancelButton = document.getElementById('import-saved-code-cancel');

    if (!this.importSavedCodeModal || !this.importSavedCodeConfirmButton || !this.importSavedCodeCancelButton) {
      throw new Error('Import saved code modal elements are required');
    }

    this.importSavedCodeModal.addEventListener('click', (event) => {
      if (event.target === this.importSavedCodeModal) {
        this.closeImportSavedCodeModal();
      }
    });

    this.importSavedCodeCancelButton.addEventListener('click', () => {
      this.closeImportSavedCodeModal();
    });

    this.importSavedCodeConfirmButton.addEventListener('click', () => {
      this.closeImportSavedCodeModal({ restoreFocus: false });

      if (!this.importAllInput || this.assignmentLoading) {
        return;
      }

      this.importAllInput.value = '';
      this.importAllInput.click();
    });
  }

  openImportSavedCodeModal() {
    if (!this.importSavedCodeModal || !this.importAllInput || this.assignmentLoading) {
      return;
    }

    this.importSavedCodeModalPreviousFocus = this.importAllButton || document.activeElement;
    this.importSavedCodeModal.hidden = false;
    document.body.classList.add('modal-open');
    document.addEventListener('keydown', this.boundImportSavedCodeModalKeydownHandler);
    this.importSavedCodeCancelButton.focus();
  }

  closeImportSavedCodeModal(options = {}) {
    const { restoreFocus = true } = options;

    if (!this.importSavedCodeModal || this.importSavedCodeModal.hidden) {
      return;
    }

    this.importSavedCodeModal.hidden = true;
    document.body.classList.remove('modal-open');
    document.removeEventListener('keydown', this.boundImportSavedCodeModalKeydownHandler);

    if (restoreFocus && this.importSavedCodeModalPreviousFocus && typeof this.importSavedCodeModalPreviousFocus.focus === 'function') {
      this.importSavedCodeModalPreviousFocus.focus();
    }

    this.importSavedCodeModalPreviousFocus = null;
  }

  bindEditorResizeHandle() {
    if (!this.editorResizeHandle) {
      return;
    }

    this.editorResizeHandle.addEventListener('pointerdown', (event) => {
      this.startEditorResize(event);
    });
  }

  startEditorResize(event) {
    if (!this.editorResizeShell || this.editorCollapsed || this.assignmentLoading) {
      return;
    }

    event.preventDefault();
    this.stopActiveResize();

    const shellRect = this.editorResizeShell.getBoundingClientRect();
    const startY = event.clientY;
    const startHeight = shellRect.height;
    const minHeight = parseFloat(this.editorResizeShell.dataset.minHeight || '')
      || parseFloat(getComputedStyle(this.editorResizeShell).minHeight)
      || 220;
    const doc = this.editorResizeShell.ownerDocument;
    const win = doc.defaultView || window;
    const pointerId = event.pointerId;

    doc.body.classList.add('is-resizing-editor');
    this.editorResizeShell.classList.add('is-resizing');
    this.editorResizeHandle.setPointerCapture?.(pointerId);

    const handleMove = (moveEvent) => {
      const nextHeight = Math.max(minHeight, Math.round(startHeight + (moveEvent.clientY - startY)));
      this.editorResizeShell.style.height = `${nextHeight}px`;
      this.codeEditor.layout();
    };

    const stopResize = () => {
      doc.body.classList.remove('is-resizing-editor');
      this.editorResizeShell.classList.remove('is-resizing');

      if (this.editorResizeHandle?.hasPointerCapture?.(pointerId)) {
        this.editorResizeHandle.releasePointerCapture(pointerId);
      }

      win.removeEventListener('pointermove', handleMove);
      win.removeEventListener('pointerup', stopResize);
      win.removeEventListener('pointercancel', stopResize);
      this.activeResizeStop = null;
      this.codeEditor.layout();
    };

    this.activeResizeStop = stopResize;
    win.addEventListener('pointermove', handleMove);
    win.addEventListener('pointerup', stopResize);
    win.addEventListener('pointercancel', stopResize);
  }

  stopActiveResize() {
    if (typeof this.activeResizeStop === 'function') {
      this.activeResizeStop();
    }
  }

  toggleEditorCollapsed() {
    this.editorCollapsed = !this.editorCollapsed;
    this.updateEditorCollapseState();
  }

  updateEditorCollapseState() {
    const label = this.editorCollapsed ? 'Show Editor' : 'Hide Editor';

    if (this.editorCollapsed) {
      this.stopActiveResize();
    }

    if (this.editorContainerElement) {
      this.editorContainerElement.classList.toggle('is-collapsed', this.editorCollapsed);
    }

    if (this.editorResizeShell) {
      this.editorResizeShell.hidden = this.editorCollapsed;
    }

    if (this.editorToggleButton) {
      this.editorToggleButton.classList.toggle('is-collapsed', this.editorCollapsed);
      this.editorToggleButton.title = label;
      this.editorToggleButton.setAttribute('aria-label', label);
      this.editorToggleButton.setAttribute('aria-expanded', String(!this.editorCollapsed));

      const labelNode = this.editorToggleButton.querySelector('.editor-toggle-button-label');
      if (labelNode) {
        labelNode.textContent = label;
      }
    }

    if (!this.editorCollapsed) {
      requestAnimationFrame(() => {
        this.codeEditor.layout();
      });
    }
  }

  /**
   * Load assignments from AssignmentLoader
   */
  async loadAssignments() {
    try {
      this.assignments = await this.assignmentLoader.loadAssignments();
      console.log(`Loaded ${this.assignments.length} assignments`);

      const assignmentListContainer = document.getElementById('assignment-list');
      this.assignmentSelector.initialize(assignmentListContainer, this.assignments);

      this.assignmentSelector.onAssignmentSelect((assignment) => {
        this.handleAssignmentSelection(assignment);
      });
    } catch (error) {
      console.error('Failed to load assignments:', error);
      this.updateStatus('Failed to load assignments');

      const assignmentListContainer = document.getElementById('assignment-list');
      assignmentListContainer.innerHTML = `
        <p class="assignment-empty" style="color: var(--error);">
          Failed to load assignments. Please check your connection and try again.
        </p>
      `;
    }
  }

  /**
   * Handle assignment selection workflow
   */
  async handleAssignmentSelection(assignment) {
    this.closeRestartAssignmentModal({ restoreFocus: false });
    this.closeImportSavedCodeModal({ restoreFocus: false });
    this.clearWorkspaceReadyFeedback();

    const selectionToken = ++this.assignmentSelectionToken;

    if (!assignment) {
      if (this.currentAssignment) {
        this.codeEditor.flushAutoSave();
      }

      this.currentAssignment = null;
      this.assignmentLoading = false;
      this.assignmentViewer.clear();
      this.resultsPanel.clearResults();
      this.feedbackDisplay.clearFeedback();
      this.codeEditor.setValue('', { suppressAutoSave: true });
      this.codeEditor.setReadOnly(false);
      this.updateWorkspaceSelectionState();
      this.updateStatus(this.runtimeReady ? 'Ready' : 'Loading Python runtime...');
      console.log('Assignment cleared');
      return;
    }

    if (this.currentAssignment?.id !== assignment.id) {
      this.codeEditor.flushAutoSave();
    }

    console.log('Assignment selected:', assignment);
    this.currentAssignment = assignment;
    this.assignmentLoading = true;

    this.assignmentViewer.setAssignment(assignment);
    this.resultsPanel.clearResults();
    this.feedbackDisplay.clearFeedback();
    this.codeEditor.setReadOnly(true);
    this.codeEditor.setValue('', { suppressAutoSave: true });
    this.updateWorkspaceSelectionState();
    this.updateStatus(`Loading ${assignment.title}...`);

    try {
      const starterCode = await this.resolveStarterCode(assignment);

      if (selectionToken !== this.assignmentSelectionToken) {
        return;
      }

      this.codeEditor.loadAssignment(assignment.id, starterCode);
      this.codeEditor.setReadOnly(false);
      this.codeEditor.focus();
      this.assignmentLoading = false;
      this.updateWorkspaceSelectionState();
      this.updateEditorCollapseState();
      this.updateStatus('Ready');

      console.log('Assignment loaded:', assignment.title);
    } catch (error) {
      if (selectionToken !== this.assignmentSelectionToken) {
        return;
      }

      console.error('Failed to load assignment template:', error);
      this.assignmentLoading = false;
      this.codeEditor.setReadOnly(false);
      this.updateWorkspaceSelectionState();
      this.showError(`Failed to load starter code: ${error.message}`);
      this.updateStatus('Failed to load starter code');
    }
  }

  async resolveStarterCode(assignment) {
    if (!assignment?.starterCode) {
      return '# Write your Python code here\n';
    }

    return this.starterTemplateLoader.loadTemplate(assignment.starterCode);
  }

  /**
   * Update UI sections that depend on an active assignment selection
   */
  updateWorkspaceSelectionState() {
    const hasAssignment = Boolean(this.currentAssignment);
    const editorContainer = document.querySelector('.editor-container');
    const resultsContainer = document.querySelector('.results-container');

    if (editorContainer) {
      editorContainer.hidden = !hasAssignment;
    }

    if (resultsContainer) {
      resultsContainer.hidden = !hasAssignment;
    }

    if (this.workspaceEmptyState) {
      this.workspaceEmptyState.hidden = hasAssignment;
      this.setWorkspaceEmptyStateMode(this.runtimeReady ? 'ready' : 'loading');
    }

    if (this.assignmentSelectorShell) {
      this.assignmentSelectorShell.classList.toggle('is-awaiting-selection', this.runtimeReady && !hasAssignment);
    }

    if (hasAssignment) {
      this.clearWorkspaceReadyFeedback();
    }

    if (this.importAllButton) {
      this.importAllButton.disabled = this.assignmentLoading || !this.runtimeReady || hasAssignment;
    }

    if (this.uploadButton) {
      this.uploadButton.disabled = !hasAssignment || this.assignmentLoading;
    }

    if (this.restartButton) {
      this.restartButton.disabled = !hasAssignment || this.assignmentLoading;
    }

    if (this.downloadButton) {
      this.downloadButton.disabled = !hasAssignment || this.assignmentLoading;
    }

    if (this.editorToggleButton) {
      this.editorToggleButton.disabled = !hasAssignment;
    }

    if (hasAssignment && this.runtimeReady && !this.assignmentLoading) {
      this.submitButton.enable();
    } else {
      this.submitButton.disable();
    }
  }

  /**
   * Download the student's code as a Python file
   */
  handleDownload() {
    if (!this.currentAssignment) {
      this.showError('Please select an assignment first.');
      return;
    }

    try {
      const filename = downloadSubmission(
        this.currentAssignment.title,
        this.codeEditor.getValue() || ''
      );
      this.updateStatus(`Downloaded ${filename}`);
    } catch (error) {
      console.error('Error downloading code:', error);
      this.showError(`Failed to download code: ${error.message}`);
      this.updateStatus('Download failed');
    }
  }

  handleExportAllData() {
    try {
      if (this.currentAssignment) {
        this.codeEditor.flushAutoSave();
      }

      const exportData = this.sessionManager.exportData();
      const filename = downloadSessionBackup(exportData);
      const saveCount = Object.keys(exportData.saves).length;
      const assignmentLabel = saveCount === 1 ? 'assignment' : 'assignments';
      this.updateStatus(`Exported ${saveCount} saved ${assignmentLabel} to ${filename}`);
    } catch (error) {
      console.error('Error exporting saved code:', error);
      this.showError(`Failed to export saved code: ${error.message}`);
      this.updateStatus('Export failed');
    }
  }

  handleImportAllClick() {
    if (!this.importAllInput || this.assignmentLoading) {
      return;
    }

    this.openImportSavedCodeModal();
  }

  async handleImportAllSelection(event) {
    const input = event?.target;
    const [file] = Array.from(input?.files || []);

    if (!file) {
      return;
    }

    try {
      if (this.currentAssignment) {
        this.codeEditor.flushAutoSave();
      }

      const importedData = parseSessionBackupText(await file.text());
      this.sessionManager.importData(importedData);
      this.resultsPanel.clearResults();
      this.feedbackDisplay.clearFeedback();

      if (this.currentAssignment) {
        await this.handleAssignmentSelection(this.currentAssignment);
      } else {
        this.updateWorkspaceSelectionState();
      }

      const saveCount = Object.keys(importedData.saves).length;
      const assignmentLabel = saveCount === 1 ? 'assignment' : 'assignments';
      const message = `Imported ${saveCount} saved ${assignmentLabel}.`;
      this.showWorkspaceReadyFeedback(message, 'success');
      this.updateStatus(`Imported ${saveCount} saved ${assignmentLabel}`);
    } catch (error) {
      console.error('Failed to import saved code:', error);
      this.showWorkspaceReadyFeedback(`Import failed: ${error.message}`, 'error');
      this.updateStatus('Import failed');
    } finally {
      if (input) {
        input.value = '';
      }
    }
  }

  handleUploadClick() {
    if (!this.currentAssignment || this.assignmentLoading || !this.uploadInput) {
      return;
    }

    this.uploadInput.value = '';
    this.uploadInput.click();
  }

  async handleUploadSelection(event) {
    const input = event?.target;
    const [file] = Array.from(input?.files || []);

    if (!file || !this.currentAssignment) {
      return;
    }

    const assignmentId = this.currentAssignment.id;

    try {
      const uploadedCode = await file.text();

      if (this.currentAssignment?.id !== assignmentId) {
        return;
      }

      this.codeEditor.setValue(uploadedCode);
      this.resultsPanel.clearResults();
      this.feedbackDisplay.clearFeedback();
      this.codeEditor.focus();
      this.updateStatus(`Loaded ${file.name}`);
    } catch (error) {
      console.error('Failed to load uploaded file:', error);
      this.showError(`Failed to load file: ${error.message}`);
      this.updateStatus('Upload failed');
    } finally {
      if (input) {
        input.value = '';
      }
    }
  }

  async handleRestartAssignment() {
    if (!this.currentAssignment || this.assignmentLoading) {
      return;
    }

    const assignment = this.currentAssignment;

    try {
      this.assignmentLoading = true;
      this.codeEditor.flushAutoSave();
      this.codeEditor.setReadOnly(true);
      this.resultsPanel.clearResults();
      this.feedbackDisplay.clearFeedback();
      this.updateWorkspaceSelectionState();
      this.updateStatus(`Restarting ${assignment.title}...`);

      if (this.sessionManager) {
        this.sessionManager.clearCode(assignment.id);
      }

      const starterCode = await this.resolveStarterCode(assignment);

      if (this.currentAssignment?.id !== assignment.id) {
        return;
      }

      this.codeEditor.loadAssignment(assignment.id, starterCode);
      this.codeEditor.setReadOnly(false);
      this.codeEditor.focus();
      this.updateEditorCollapseState();
      this.updateStatus('Ready');
    } catch (error) {
      console.error('Failed to restart assignment:', error);
      this.showError(`Failed to restart assignment: ${error.message}`);
      this.updateStatus('Restart failed');
    } finally {
      this.assignmentLoading = false;
      this.codeEditor.setReadOnly(false);
      this.updateWorkspaceSelectionState();
    }
  }

  /**
   * Handle code submission workflow
   */
  async handleSubmit() {
    if (!this.currentAssignment) {
      this.showError('Please select an assignment first.');
      return;
    }

    const studentCode = this.codeEditor.getValue();

    if (!studentCode || studentCode.trim() === '') {
      this.showError('Please write some code before submitting.');
      return;
    }

    this.submitButton.setLoading(true);
    this.submitButton.setStatusMessage('Running tests...');
    this.updateStatus('Executing code...');

    this.resultsPanel.clearResults();
    this.scrollToResults();

    try {
      const testSuiteCode = await this.autograderEngine.loadTestSuite(
        this.currentAssignment.testSuiteFile
      );

      this.updateStatus('Running tests...');
      const gradeResult = await this.autograderEngine.gradeSubmission(
        studentCode,
        testSuiteCode,
        this.currentAssignment.id
      );

      this.displayResults(gradeResult);
      this.scrollToResults();

      const passRate = gradeResult.totalTests > 0
        ? `${gradeResult.passedTests}/${gradeResult.totalTests}`
        : '0/0';
      this.updateStatus(`Tests complete: ${passRate} passed`);
    } catch (error) {
      console.error('Error during code execution:', error);
      this.showError(`Failed to run tests: ${error.message}`);
      this.updateStatus('Test execution failed');
      this.scrollToResults();
    } finally {
      this.submitButton.setLoading(false);
      this.submitButton.clearStatusMessage();
    }
  }

  /**
   * Display test results and feedback
   */
  displayResults(gradeResult) {
    if (gradeResult.timedOut) {
      const timeoutFeedback = this.feedbackGenerator.generateTimeoutFeedback();
      this.feedbackDisplay.displayFeedback(timeoutFeedback);
      return;
    }

    if (gradeResult.syntaxError) {
      const syntaxFeedback = this.feedbackGenerator.generateSyntaxErrorFeedback(
        gradeResult.syntaxError
      );
      this.feedbackDisplay.displayFeedback(syntaxFeedback);
      return;
    }

    if (gradeResult.error && gradeResult.totalTests === 0) {
      const errorFeedback = this.feedbackGenerator.generateRuntimeErrorFeedback(
        gradeResult.error
      );
      this.feedbackDisplay.displayFeedback(errorFeedback);
      return;
    }

    this.resultsPanel.displayResults(gradeResult);

    if (gradeResult.failedTests > 0) {
      const failedTest = gradeResult.testCases.find(tc => !tc.passed);
      if (failedTest) {
        const feedback = this.feedbackGenerator.generateFeedback(failedTest);
        this.feedbackDisplay.displayFeedback(feedback);
      }
    } else {
      this.feedbackDisplay.clearFeedback();
    }
  }

  /**
   * Update status indicator
   */
  updateStatus(message) {
    this.latestStatusMessage = message;

    const statusText = document.querySelector('.status-text');
    if (statusText) {
      statusText.textContent = message;
    }

    const normalizedMessage = String(message || '').toLowerCase();
    if (!this.currentAssignment) {
      if (normalizedMessage === 'ready') {
        this.setWorkspaceEmptyStateMode('ready');
      } else if (!this.runtimeReady) {
        this.setWorkspaceEmptyStateMode('loading');
      }
    }

    this.updateWorkspaceLoadingState(message);
  }

  setWorkspaceEmptyStateMode(mode) {
    if (!this.workspaceEmptyState) {
      return;
    }

    this.workspaceEmptyState.dataset.state = mode;
    this.workspaceEmptyState.classList.toggle('is-loading', mode === 'loading');

    if (this.workspaceLoadingState) {
      this.workspaceLoadingState.hidden = mode !== 'loading';
    }

    if (this.workspaceReadyState) {
      this.workspaceReadyState.hidden = mode !== 'ready';
    }
  }

  updateWorkspaceLoadingState(message) {
    const phase = this.getLoadingPhaseFromStatus(message);
    const title = this.getLoadingTitleFromPhase(phase, message);

    if (this.workspaceLoadingTitle) {
      this.workspaceLoadingTitle.textContent = title;
    }

    if (this.workspaceLoadingMessage) {
      this.workspaceLoadingMessage.textContent = message;
    }
  }

  getLoadingPhaseFromStatus(message) {
    const normalized = String(message || '').toLowerCase();

    if (normalized.includes('assignment')) {
      return 'assignments';
    }

    if (normalized.includes('editor')) {
      return 'editor';
    }

    return 'runtime';
  }

  getLoadingTitleFromPhase(phase, message) {
    if (String(message || '').toLowerCase().includes('ready')) {
      return 'Python lab is ready';
    }

    switch (phase) {
      case 'editor':
        return 'Sharpening the code editor';
      case 'assignments':
        return 'Gathering today\'s assignments';
      case 'runtime':
      default:
        return 'Waking up the Python runtime';
    }
  }

  async playStartupReadyTransition() {
    if (this.startupTransitionPlayed || this.currentAssignment) {
      return;
    }

    this.startupTransitionPlayed = true;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    if (!this.workspaceEmptyState || !this.workspaceLoadingState || !this.loadingHandoffOverlay || !this.assignmentSelectorShell) {
      return;
    }

    const loadingRect = this.workspaceLoadingState.getBoundingClientRect();
    const selectorRect = this.assignmentSelectorShell.getBoundingClientRect();

    if (!loadingRect.width || !loadingRect.height || !selectorRect.width || !selectorRect.height) {
      return;
    }

    const startX = loadingRect.left + (loadingRect.width / 2);
    const startY = loadingRect.top + Math.max(loadingRect.height * 0.24, 64);
    const endX = selectorRect.left + (selectorRect.width / 2);
    const endY = selectorRect.top + (selectorRect.height / 2);
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const distance = Math.hypot(deltaX, deltaY);
    const angle = Math.atan2(deltaY, deltaX);

    this.loadingHandoffOverlay.style.setProperty('--handoff-start-x', `${startX}px`);
    this.loadingHandoffOverlay.style.setProperty('--handoff-start-y', `${startY}px`);
    this.loadingHandoffOverlay.style.setProperty('--handoff-end-x', `${endX}px`);
    this.loadingHandoffOverlay.style.setProperty('--handoff-end-y', `${endY}px`);
    this.loadingHandoffOverlay.style.setProperty('--handoff-dx', `${deltaX}px`);
    this.loadingHandoffOverlay.style.setProperty('--handoff-dy', `${deltaY}px`);
    this.loadingHandoffOverlay.style.setProperty('--handoff-distance', `${distance}px`);
    this.loadingHandoffOverlay.style.setProperty('--handoff-angle', `${angle}rad`);

    this.loadingHandoffOverlay.hidden = false;
    this.loadingHandoffOverlay.setAttribute('aria-hidden', 'false');
    this.workspaceEmptyState.classList.add('is-handoff-running');
    this.assignmentSelectorShell.classList.add('is-receiving-handoff');

    await new Promise((resolve) => {
      requestAnimationFrame(() => {
        this.loadingHandoffOverlay.classList.add('is-active');
        resolve();
      });
    });

    await new Promise((resolve) => window.setTimeout(resolve, 1900));

    this.loadingHandoffOverlay.classList.remove('is-active');

    await new Promise((resolve) => window.setTimeout(resolve, 90));

    this.loadingHandoffOverlay.hidden = true;
    this.loadingHandoffOverlay.setAttribute('aria-hidden', 'true');
  }

  finishStartupReadyTransition() {
    if (!this.workspaceEmptyState && !this.assignmentSelectorShell) {
      return;
    }

    requestAnimationFrame(() => {
      this.workspaceEmptyState?.classList.remove('is-handoff-running');
      this.assignmentSelectorShell?.classList.remove('is-receiving-handoff');
    });
  }

  showWorkspaceReadyFeedback(message, type = 'info') {
    if (!this.workspaceReadyFeedback) {
      return;
    }

    if (this.workspaceReadyFeedbackTimeout) {
      window.clearTimeout(this.workspaceReadyFeedbackTimeout);
      this.workspaceReadyFeedbackTimeout = null;
    }

    this.workspaceReadyFeedback.textContent = message;
    this.workspaceReadyFeedback.dataset.type = type;
    this.workspaceReadyFeedback.hidden = false;

    this.workspaceReadyFeedbackTimeout = window.setTimeout(() => {
      this.clearWorkspaceReadyFeedback();
    }, 4200);
  }

  clearWorkspaceReadyFeedback() {
    if (!this.workspaceReadyFeedback) {
      return;
    }

    if (this.workspaceReadyFeedbackTimeout) {
      window.clearTimeout(this.workspaceReadyFeedbackTimeout);
      this.workspaceReadyFeedbackTimeout = null;
    }

    this.workspaceReadyFeedback.hidden = true;
    this.workspaceReadyFeedback.textContent = "";
    delete this.workspaceReadyFeedback.dataset.type;
  }

  scrollToResults() {
    if (!this.resultsContainerElement) {
      return;
    }

    const target = this.resultsContainerElement;
    const view = target.ownerDocument?.defaultView || window;
    view.requestAnimationFrame(() => {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    });
  }

  /**
   * Show error message to user
   */
  showError(message) {
    const resultsContainer = document.getElementById('results-panel');
    if (resultsContainer) {
      resultsContainer.innerHTML = `
        <div class="error-message">
          <span class="error-icon">⚠️</span>
          <span class="error-text">${message}</span>
        </div>
      `;
    }

    this.scrollToResults();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.initialize().catch(error => {
    console.error('Fatal error during initialization:', error);
  });
});








