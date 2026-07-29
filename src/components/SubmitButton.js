/**
 * SubmitButton Component
 * Triggers code submission and shows execution status
 *
 * Requirements: 3.6, 14.3
 */

export class SubmitButton {
  constructor() {
    this.button = null;
    this.container = null;
    this.isEnabled = false;
    this.isLoading = false;
    this.statusMessage = '';
    this.label = 'Submit Code';
    this.submitCallback = null;
  }

  /**
   * Initialize the SubmitButton
   * @param {HTMLElement} container - The DOM element to mount the button
   * @param {Object} options - Configuration options
   * @param {string} options.label - Button label text (default: "Submit Code")
   */
  initialize(container, options = {}) {
    if (!container) {
      throw new Error('Container element is required');
    }

    this.container = container;
    this.render(options);
  }

  /**
   * Render the submit button
   * @private
   */
  render(options = {}) {
    if (!this.container) {
      return;
    }

    this.label = options.label || this.label || 'Submit Code';

    // Clear existing content
    this.container.innerHTML = '';

    // Create button wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'submit-button-wrapper';

    // Create button
    this.button = document.createElement('button');
    this.button.className = 'submit-button';
    this.button.disabled = !this.isEnabled;
    this.button.setAttribute('aria-label', this.label);
    this.button.innerHTML = `
      <span class="submit-button-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">
          <path d="M8 6.82v10.36a1 1 0 0 0 1.52.85l8.14-5.18a1 1 0 0 0 0-1.69L9.52 5.98A1 1 0 0 0 8 6.82Z" fill="currentColor"/>
        </svg>
      </span>
      <span class="submit-button-label">${this.label}</span>
    `;

    // Add loading class if loading
    if (this.isLoading) {
      this.button.classList.add('loading');
      this.button.disabled = true;
    }

    // Add click handler
    this.button.addEventListener('click', () => {
      this.handleSubmit();
    });

    wrapper.appendChild(this.button);

    // Create status message element
    if (this.statusMessage) {
      const statusElement = document.createElement('div');
      statusElement.className = 'submit-status';
      statusElement.textContent = this.statusMessage;
      wrapper.appendChild(statusElement);
    }

    this.container.appendChild(wrapper);
  }

  /**
   * Handle button click
   * @private
   */
  handleSubmit() {
    if (!this.isEnabled || this.isLoading) {
      return;
    }

    if (this.submitCallback) {
      this.submitCallback();
    }
  }

  /**
   * Enable the submit button
   * Requirement 14.3: Enable button when Pyodide is ready
   */
  enable() {
    this.isEnabled = true;
    if (this.button) {
      this.button.disabled = false;
    }
  }

  /**
   * Disable the submit button
   * Requirement 14.3: Disable button when Pyodide is not ready or executing
   */
  disable() {
    this.isEnabled = false;
    if (this.button) {
      this.button.disabled = true;
    }
  }

  /**
   * Set loading state
   * Requirement 3.6: Show loading state during execution
   * @param {boolean} loading - Whether the button should show loading state
   */
  setLoading(loading) {
    this.isLoading = loading;

    if (this.button) {
      if (loading) {
        this.button.classList.add('loading');
        this.button.disabled = true;
      } else {
        this.button.classList.remove('loading');
        this.button.disabled = !this.isEnabled;
      }
    }
  }

  /**
   * Set status message
   * Requirement 3.6: Display execution status messages
   * @param {string} message - Status message to display
   */
  setStatusMessage(message) {
    this.statusMessage = message || '';

    // Re-render to update status message
    if (this.container) {
      this.render({ label: this.label || 'Submit Code' });
    }
  }

  /**
   * Clear status message
   */
  clearStatusMessage() {
    this.setStatusMessage('');
  }

  /**
   * Register a callback for submit events
   * Requirement 3.6: Provide callback mechanism for submission events
   * @param {Function} callback - Function to call when submit button is clicked
   */
  onSubmit(callback) {
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }
    this.submitCallback = callback;
  }

  /**
   * Get the current enabled state
   * @returns {boolean}
   */
  isButtonEnabled() {
    return this.isEnabled;
  }

  /**
   * Get the current loading state
   * @returns {boolean}
   */
  isButtonLoading() {
    return this.isLoading;
  }

  /**
   * Dispose of the component and clean up resources
   */
  dispose() {
    if (this.container) {
      this.container.innerHTML = '';
    }
    this.button = null;
    this.container = null;
    this.isEnabled = false;
    this.isLoading = false;
    this.statusMessage = '';
    this.label = 'Submit Code';
    this.submitCallback = null;
  }
}
