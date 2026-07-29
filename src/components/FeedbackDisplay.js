/**
 * FeedbackDisplay Component
 * Displays beginner-friendly feedback messages for failed tests
 * 
 * Requirements: 5.1, 5.2, 5.4, 5.5, 6.4
 */

export class FeedbackDisplay {
  constructor() {
    this.container = null;
    this.feedback = null;
  }

  /**
   * Initialize the FeedbackDisplay
   * @param {HTMLElement} container - The DOM element to mount the component
   */
  initialize(container) {
    if (!container) {
      throw new Error('Container element is required');
    }

    this.container = container;
    this.render();
  }

  /**
   * Display feedback message
   * Requirement 6.4: Display feedback for failed tests
   * @param {FeedbackMessage} feedback - Feedback object from FeedbackGenerator
   */
  displayFeedback(feedback) {
    if (!feedback) {
      throw new Error('Feedback object is required');
    }

    this.feedback = feedback;
    this.render();
  }

  /**
   * Clear the feedback display
   */
  clearFeedback() {
    this.feedback = null;
    this.render();
  }

  /**
   * Render the feedback display
   * @private
   */
  render() {
    if (!this.container) {
      return;
    }

    // Clear existing content
    this.container.innerHTML = '';

    // If no feedback, show empty state
    if (!this.feedback) {
      this.renderEmptyState();
      return;
    }

    // Create feedback container
    const feedbackContainer = document.createElement('div');
    feedbackContainer.className = 'feedback-display';

    // Render feedback title
    const title = this.renderTitle();
    feedbackContainer.appendChild(title);

    // Render feedback description
    const description = this.renderDescription();
    feedbackContainer.appendChild(description);

    // Render hint if available
    if (this.feedback.hint) {
      const hint = this.renderHint();
      feedbackContainer.appendChild(hint);
    }

    // Render code snippet if available
    if (this.feedback.codeSnippet) {
      const codeSnippet = this.renderCodeSnippet();
      feedbackContainer.appendChild(codeSnippet);
    }

    this.container.appendChild(feedbackContainer);
  }

  /**
   * Render empty state when no feedback is available
   * Requirement: Handle cases where no feedback is available
   * @private
   */
  renderEmptyState() {
    return;
  }

  /**
   * Render the feedback title
   * Requirement 5.1: Display beginner-friendly feedback messages
   * @returns {HTMLElement}
   * @private
   */
  renderTitle() {
    const titleElement = document.createElement('div');
    titleElement.className = 'feedback-title';
    
    const icon = document.createElement('span');
    icon.className = 'feedback-icon';
    icon.textContent = '💡';
    
    const text = document.createElement('span');
    text.className = 'feedback-title-text';
    text.textContent = this.feedback.title;
    
    titleElement.appendChild(icon);
    titleElement.appendChild(text);
    
    return titleElement;
  }

  /**
   * Render the feedback description
   * Requirement 5.2: Display expected vs actual output
   * Requirement 5.4: Show syntax errors with line numbers
   * Requirement 5.5: Show runtime errors in beginner-friendly language
   * @returns {HTMLElement}
   * @private
   */
  renderDescription() {
    const descriptionElement = document.createElement('div');
    descriptionElement.className = 'feedback-description';
    
    // Split description by newlines to handle expected/actual output formatting
    const lines = this.feedback.description.split('\n');
    
    lines.forEach((line, index) => {
      if (line.trim() === '') {
        // Add spacing for empty lines
        if (index > 0 && index < lines.length - 1) {
          const spacer = document.createElement('div');
          spacer.className = 'feedback-spacer';
          descriptionElement.appendChild(spacer);
        }
        return;
      }

      // Check if this line is expected or actual output
      if (line.startsWith('Expected:')) {
        const expectedDiv = document.createElement('div');
        expectedDiv.className = 'feedback-output expected';
        
        const label = document.createElement('span');
        label.className = 'output-label';
        label.textContent = 'Expected: ';
        
        const value = document.createElement('span');
        value.className = 'output-value';
        value.textContent = line.substring('Expected:'.length).trim();
        
        expectedDiv.appendChild(label);
        expectedDiv.appendChild(value);
        descriptionElement.appendChild(expectedDiv);
      } else if (line.startsWith('Your code produced:')) {
        const actualDiv = document.createElement('div');
        actualDiv.className = 'feedback-output actual';
        
        const label = document.createElement('span');
        label.className = 'output-label';
        label.textContent = 'Your code produced: ';
        
        const value = document.createElement('span');
        value.className = 'output-value';
        value.textContent = line.substring('Your code produced:'.length).trim();
        
        actualDiv.appendChild(label);
        actualDiv.appendChild(value);
        descriptionElement.appendChild(actualDiv);
      } else if (line.startsWith('Details:')) {
        // Details section
        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'feedback-details';
        detailsDiv.textContent = line;
        descriptionElement.appendChild(detailsDiv);
      } else if (line.includes('Line ') || line.includes('line ')) {
        // Line number information (for syntax/runtime errors)
        const lineInfoDiv = document.createElement('div');
        lineInfoDiv.className = 'feedback-line-info';
        lineInfoDiv.textContent = line;
        descriptionElement.appendChild(lineInfoDiv);
      } else {
        // Regular text
        const textDiv = document.createElement('div');
        textDiv.className = 'feedback-text';
        textDiv.textContent = line;
        descriptionElement.appendChild(textDiv);
      }
    });
    
    return descriptionElement;
  }

  /**
   * Render the hint section
   * Requirement 5.1: Provide helpful hints for fixing issues
   * @returns {HTMLElement}
   * @private
   */
  renderHint() {
    const hintElement = document.createElement('div');
    hintElement.className = 'feedback-hint';
    
    const hintLabel = document.createElement('div');
    hintLabel.className = 'hint-label';
    hintLabel.textContent = '💡 Hint:';
    
    const hintText = document.createElement('div');
    hintText.className = 'hint-text';
    hintText.textContent = this.feedback.hint;
    
    hintElement.appendChild(hintLabel);
    hintElement.appendChild(hintText);
    
    return hintElement;
  }

  /**
   * Render code snippet if available
   * @returns {HTMLElement}
   * @private
   */
  renderCodeSnippet() {
    const snippetElement = document.createElement('div');
    snippetElement.className = 'feedback-code-snippet';
    
    const snippetLabel = document.createElement('div');
    snippetLabel.className = 'snippet-label';
    snippetLabel.textContent = 'Code:';
    
    const snippetCode = document.createElement('pre');
    snippetCode.className = 'snippet-code';
    
    const code = document.createElement('code');
    code.textContent = this.feedback.codeSnippet;
    
    snippetCode.appendChild(code);
    snippetElement.appendChild(snippetLabel);
    snippetElement.appendChild(snippetCode);
    
    return snippetElement;
  }

  /**
   * Get the current feedback
   * @returns {FeedbackMessage|null}
   */
  getFeedback() {
    return this.feedback;
  }

  /**
   * Check if feedback is currently displayed
   * @returns {boolean}
   */
  hasFeedback() {
    return this.feedback !== null;
  }

  /**
   * Dispose of the component and clean up resources
   */
  dispose() {
    if (this.container) {
      this.container.innerHTML = '';
    }
    this.container = null;
    this.feedback = null;
  }
}

/**
 * @typedef {Object} FeedbackMessage
 * @property {string} title - Brief, student-friendly title
 * @property {string} description - Detailed explanation in beginner-friendly language
 * @property {string|null} hint - Contextual hint to help fix the issue
 * @property {string|null} codeSnippet - Optional code snippet showing the issue
 */


