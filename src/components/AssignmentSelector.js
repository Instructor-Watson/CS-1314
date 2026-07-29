/**
 * AssignmentSelector Component
 * Displays available assignments in a dropdown and handles selection events
 *
 * Requirements: 2.2, 8.1
 */

export class AssignmentSelector {
  constructor() {
    this.container = null;
    this.assignments = [];
    this.selectedAssignmentId = null;
    this.selectionCallback = null;
    this.selectElement = null;
  }

  /**
   * Initialize the AssignmentSelector
   * @param {HTMLElement} container - The DOM element to mount the selector
   * @param {Array} assignments - Array of assignment objects from AssignmentLoader
   */
  initialize(container, assignments = []) {
    if (!container) {
      throw new Error('Container element is required');
    }

    this.container = container;
    this.assignments = assignments;
    this.render();
  }

  /**
   * Set the list of assignments to display
   * @param {Array} assignments - Array of assignment objects
   */
  setAssignments(assignments) {
    if (!Array.isArray(assignments)) {
      throw new Error('Assignments must be an array');
    }

    this.assignments = assignments;

    if (!this.assignments.some(assignment => assignment.id === this.selectedAssignmentId)) {
      this.selectedAssignmentId = null;
    }

    this.render();
  }

  /**
   * Render the assignment dropdown
   * @private
   */
  render() {
    if (!this.container) {
      return;
    }

    this.container.innerHTML = '';

    const select = document.createElement('select');
    select.className = 'assignment-select';
    select.id = 'assignment-select';
    select.setAttribute('aria-label', 'Select an assignment');

    const placeholderOption = document.createElement('option');
    placeholderOption.value = '';
    placeholderOption.textContent = this.assignments.length > 0
      ? 'Select an assignment'
      : 'No assignments available';
    select.appendChild(placeholderOption);

    this.assignments.forEach((assignment) => {
      const option = document.createElement('option');
      option.value = assignment.id;
      option.textContent = assignment.title;
      select.appendChild(option);
    });

    if (this.selectedAssignmentId) {
      select.value = this.selectedAssignmentId;
    }

    if (this.assignments.length === 0) {
      select.disabled = true;
    }

    select.addEventListener('change', (event) => {
      const assignmentId = event.target.value;

      if (!assignmentId) {
        this.clearSelection({ emit: true });
        return;
      }

      this.selectAssignment(assignmentId);
    });

    this.selectElement = select;
    this.container.appendChild(select);
  }

  /**
   * Select an assignment by ID
   * @param {string} assignmentId - The ID of the assignment to select
   */
  selectAssignment(assignmentId) {
    const assignment = this.assignments.find(a => a.id === assignmentId);

    if (!assignment) {
      console.warn(`Assignment with id "${assignmentId}" not found`);
      return;
    }

    this.selectedAssignmentId = assignmentId;

    if (this.selectElement) {
      this.selectElement.value = assignmentId;
    }

    if (this.selectionCallback) {
      this.selectionCallback(assignment);
    }
  }

  /**
   * Register a callback for assignment selection events
   * @param {Function} callback - Function to call when an assignment is selected
   */
  onAssignmentSelect(callback) {
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }
    this.selectionCallback = callback;
  }

  /**
   * Get the currently selected assignment ID
   * @returns {string|null} The selected assignment ID or null if none selected
   */
  getSelectedAssignmentId() {
    return this.selectedAssignmentId;
  }

  /**
   * Get the currently selected assignment object
   * @returns {Object|null} The selected assignment object or null if none selected
   */
  getSelectedAssignment() {
    if (!this.selectedAssignmentId) {
      return null;
    }
    return this.assignments.find(a => a.id === this.selectedAssignmentId) || null;
  }

  /**
   * Clear the selection
   * @param {Object} options - Clear behavior options
   * @param {boolean} options.emit - Whether to notify listeners
   */
  clearSelection(options = {}) {
    const { emit = false } = options;

    this.selectedAssignmentId = null;

    if (this.selectElement) {
      this.selectElement.value = '';
    }

    if (emit && this.selectionCallback) {
      this.selectionCallback(null);
    }
  }

  /**
   * Dispose of the component and clean up resources
   */
  dispose() {
    if (this.container) {
      this.container.innerHTML = '';
    }
    this.container = null;
    this.assignments = [];
    this.selectedAssignmentId = null;
    this.selectionCallback = null;
    this.selectElement = null;
  }
}
