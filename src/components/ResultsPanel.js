/**
 * ResultsPanel Component
 * Displays test results with summary and detailed information
 * 
 * Requirements: 5.6, 6.1, 6.2, 6.3, 6.5
 */

export class ResultsPanel {
  constructor() {
    this.container = null;
    this.results = null;
  }

  /**
   * Initialize the ResultsPanel
   * @param {HTMLElement} container - The DOM element to mount the panel
   */
  initialize(container) {
    if (!container) {
      throw new Error('Container element is required');
    }

    this.container = container;
    this.render();
  }

  /**
   * Display test results
   * Requirement 6.1: Display summary showing passed and failed tests
   * Requirement 6.2: Display detailed results for each test case
   * @param {Object} results - GradeResult object from AutograderEngine
   */
  displayResults(results) {
    if (!results) {
      throw new Error('Results object is required');
    }

    this.results = results;
    this.render();
  }

  /**
   * Clear the results display
   */
  clearResults() {
    this.results = null;
    this.render();
  }

  /**
   * Render the results panel
   * @private
   */
  render() {
    if (!this.container) {
      return;
    }

    // Clear existing content
    this.container.innerHTML = '';

    // If no results, show empty state
    if (!this.results) {
      this.renderEmptyState();
      return;
    }

    // Create results container
    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'results-panel';

    // Render summary section
    const summary = this.renderSummary();
    resultsContainer.appendChild(summary);

    // Render detailed test results
    const details = this.renderTestDetails();
    resultsContainer.appendChild(details);

    this.container.appendChild(resultsContainer);
  }

  /**
   * Render empty state when no results are available
   * @private
   */
  renderEmptyState() {
    const emptyState = document.createElement('div');
    emptyState.className = 'results-empty';
    emptyState.innerHTML = `
      <p class="results-empty-message">No test results yet. Submit your code to see results.</p>
    `;
    this.container.appendChild(emptyState);
  }

  /**
   * Render the test summary section
   * Requirement 6.1: Display summary showing number of passed and failed tests
   * Requirement 6.3: Display success message when all tests pass
   * @returns {HTMLElement}
   * @private
   */
  renderSummary() {
    const summary = document.createElement('div');
    summary.className = 'results-summary';

    const { totalTests, passedTests, failedTests } = this.results;

    // Determine if all tests passed
    const allPassed = totalTests > 0 && failedTests === 0;

    // Add success or failure class
    summary.classList.add(allPassed ? 'all-passed' : 'has-failures');

    // Success message when all tests pass (Requirement 6.3)
    if (allPassed) {
      const successMessage = document.createElement('div');
      successMessage.className = 'success-message';
      successMessage.innerHTML = `
        <span class="success-icon">✓</span>
        <span class="success-text">All tests passed! Great work!</span>
      `;
      summary.appendChild(successMessage);
    }

    // Test counts summary
    const countsContainer = document.createElement('div');
    countsContainer.className = 'test-counts';

    // Total tests
    const totalElement = document.createElement('div');
    totalElement.className = 'test-count total';
    totalElement.innerHTML = `
      <span class="count-label">Total:</span>
      <span class="count-value">${totalTests}</span>
    `;
    countsContainer.appendChild(totalElement);

    // Passed tests
    const passedElement = document.createElement('div');
    passedElement.className = 'test-count passed';
    passedElement.innerHTML = `
      <span class="count-label">Passed:</span>
      <span class="count-value">${passedTests}</span>
    `;
    countsContainer.appendChild(passedElement);

    // Failed tests
    const failedElement = document.createElement('div');
    failedElement.className = 'test-count failed';
    failedElement.innerHTML = `
      <span class="count-label">Failed:</span>
      <span class="count-value">${failedTests}</span>
    `;
    countsContainer.appendChild(failedElement);

    summary.appendChild(countsContainer);

    return summary;
  }

  /**
   * Render detailed test results for each test case
   * Requirement 6.2: Display detailed results for each test case
   * Requirement 6.5: Use visual indicators (colors, icons) for pass/fail status
   * Requirement 5.6: Highlight which specific test cases passed and failed
   * @returns {HTMLElement}
   * @private
   */
  renderTestDetails() {
    const details = document.createElement('div');
    details.className = 'test-details';

    // If no test cases, show message
    if (!this.results.testCases || this.results.testCases.length === 0) {
      const noTests = document.createElement('p');
      noTests.className = 'no-tests-message';
      noTests.textContent = 'No test cases were executed.';
      details.appendChild(noTests);
      return details;
    }

    // Create a test case item for each test
    this.results.testCases.forEach((testCase, index) => {
      const testItem = this.renderTestCase(testCase, index);
      details.appendChild(testItem);
    });

    return details;
  }

  /**
   * Render a single test case item
   * Requirement 6.5: Use visual indicators (colors, icons) to distinguish passed and failed tests
   * @param {Object} testCase - TestCaseResult object
   * @param {number} index - Test case index
   * @returns {HTMLElement}
   * @private
   */
  renderTestCase(testCase, index) {
    const item = document.createElement('div');
    item.className = `test-case ${testCase.passed ? 'passed' : 'failed'}`;
    item.dataset.testIndex = index;

    // Test header with status icon
    const header = document.createElement('div');
    header.className = 'test-case-header';

    // Status icon (Requirement 6.5: Visual indicators)
    const icon = document.createElement('span');
    icon.className = 'test-status-icon';
    icon.textContent = testCase.passed ? '✓' : '✗';
    header.appendChild(icon);

    // Test name
    const name = document.createElement('span');
    name.className = 'test-case-name';
    name.textContent = testCase.displayName || testCase.name;
    header.appendChild(name);

    item.appendChild(header);

    // Test message (for failed tests or additional info)
    if (testCase.message && testCase.message.trim() !== '') {
      const message = document.createElement('div');
      message.className = 'test-case-message';
      message.textContent = testCase.message;
      item.appendChild(message);
    }

    // Expected vs Actual output (if available)
    if (testCase.expectedOutput !== null || testCase.actualOutput !== null) {
      const outputContainer = document.createElement('div');
      outputContainer.className = 'test-case-output';

      if (testCase.expectedOutput !== null) {
        const expected = document.createElement('div');
        expected.className = 'output-expected';
        expected.innerHTML = `
          <span class="output-label">Expected:</span>
          <span class="output-value">${this.escapeHtml(String(testCase.expectedOutput))}</span>
        `;
        outputContainer.appendChild(expected);
      }

      if (testCase.actualOutput !== null) {
        const actual = document.createElement('div');
        actual.className = 'output-actual';
        actual.innerHTML = `
          <span class="output-label">Actual:</span>
          <span class="output-value">${this.escapeHtml(String(testCase.actualOutput))}</span>
        `;
        outputContainer.appendChild(actual);
      }

      item.appendChild(outputContainer);
    }

    // Error type (if available)
    if (testCase.errorType && !testCase.passed && testCase.errorType !== 'AssertionError') {
      const errorType = document.createElement('div');
      errorType.className = 'test-case-error-type';
      errorType.textContent = `Error Type: ${testCase.errorType}`;
      item.appendChild(errorType);
    }

    return item;
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string}
   * @private
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Get the current results
   * @returns {Object|null}
   */
  getResults() {
    return this.results;
  }

  /**
   * Check if results are currently displayed
   * @returns {boolean}
   */
  hasResults() {
    return this.results !== null;
  }

  /**
   * Dispose of the component and clean up resources
   */
  dispose() {
    if (this.container) {
      this.container.innerHTML = '';
    }
    this.container = null;
    this.results = null;
  }
}

