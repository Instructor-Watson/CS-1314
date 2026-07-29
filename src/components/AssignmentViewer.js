/**
 * AssignmentViewer Component
 * Displays assignment details including title, description, and an instructions link.
 *
 * Requirements: 2.3, 2.4
 */

export class AssignmentViewer {
  constructor() {
    this.container = null;
    this.assignment = null;
    this.instructionsBasePath = 'instructions';
  }

  /**
   * Initialize the AssignmentViewer
   * @param {HTMLElement} container - The DOM element to mount the viewer
   * @param {Object|null} assignment - Optional assignment object to display initially
   */
  initialize(container, assignment = null) {
    if (!container) {
      throw new Error('Container element is required');
    }

    this.container = container;
    this.assignment = assignment;
    this.render();
  }

  /**
   * Set the assignment to display
   * @param {Object|null} assignment - The assignment object to display, or null to clear
   */
  setAssignment(assignment) {
    this.assignment = assignment;
    this.render();
  }

  /**
   * Build the public URL for an assignment instructions file.
   * @param {string} instructionsFile - PDF filename from assignment metadata
   * @returns {string}
   */
  buildInstructionsUrl(instructionsFile) {
    if (!instructionsFile || typeof instructionsFile !== 'string') {
      throw new Error('Instructions filename must be a non-empty string');
    }

    const normalizedFilename = instructionsFile.replace(/^\/+/, '');
    return `${this.instructionsBasePath}/${normalizedFilename}`;
  }

  /**
   * Render the assignment details
   * @private
   */
  render() {
    if (!this.container) {
      return;
    }

    this.container.innerHTML = '';

    if (!this.assignment) {
      const placeholder = document.createElement('div');
      placeholder.className = 'assignment-viewer-placeholder';
      placeholder.innerHTML = `
        <p class="placeholder-text">Select an assignment to view details</p>
      `;
      this.container.appendChild(placeholder);
      return;
    }

    const viewer = document.createElement('div');
    viewer.className = 'assignment-viewer-content';

    const header = document.createElement('div');
    header.className = 'assignment-viewer-header';

    const headingGroup = document.createElement('div');
    headingGroup.className = 'assignment-viewer-heading-group';

    const title = document.createElement('h2');
    title.className = 'assignment-viewer-title';
    title.textContent = this.assignment.title || 'Untitled Assignment';
    headingGroup.appendChild(title);

    if (this.assignment.description) {
      const description = document.createElement('div');
      description.className = 'assignment-viewer-description';
      description.textContent = this.assignment.description;
      headingGroup.appendChild(description);
    }

    header.appendChild(headingGroup);

    if (this.assignment.instructions) {
      const instructionsLink = document.createElement('a');
      instructionsLink.className = 'assignment-instructions-button';
      instructionsLink.href = this.buildInstructionsUrl(this.assignment.instructions);
      instructionsLink.target = '_blank';
      instructionsLink.rel = 'noopener noreferrer';
      instructionsLink.setAttribute('aria-label', 'Open assignment instructions PDF in a new tab');
      instructionsLink.innerHTML = `
        <span class="assignment-instructions-button-copy">
          <span class="assignment-instructions-button-title">Open Instructions PDF</span>
          <span class="assignment-instructions-button-subtitle">Opens in a new tab</span>
        </span>
        <span class="assignment-instructions-button-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false">
            <path d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3Zm5 16V11h2v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h9v2H5v14h14Z" fill="currentColor"/>
          </svg>
        </span>
      `;
      header.appendChild(instructionsLink);
    }

    viewer.appendChild(header);
    this.container.appendChild(viewer);
  }

  /**
   * Get the currently displayed assignment
   * @returns {Object|null} The current assignment or null if none displayed
   */
  getAssignment() {
    return this.assignment;
  }

  /**
   * Clear the displayed assignment
   */
  clear() {
    this.assignment = null;
    this.render();
  }

  /**
   * Dispose of the component and clean up resources
   */
  dispose() {
    if (this.container) {
      this.container.innerHTML = '';
    }
    this.container = null;
    this.assignment = null;
  }
}
