/**
 * Unit tests for FeedbackDisplay component
 * Tests rendering of feedback messages, expected/actual output, and error handling
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { FeedbackDisplay } from './FeedbackDisplay.js';

describe('FeedbackDisplay', () => {
  let feedbackDisplay;
  let container;

  beforeEach(() => {
    feedbackDisplay = new FeedbackDisplay();
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  describe('initialization', () => {
    it('should initialize with a container element', () => {
      feedbackDisplay.initialize(container);
      expect(feedbackDisplay.container).toBe(container);
    });

    it('should throw error if container is not provided', () => {
      expect(() => feedbackDisplay.initialize(null)).toThrow('Container element is required');
    });

    it('should render empty state on initialization', () => {
      feedbackDisplay.initialize(container);
      expect(container.querySelector('.feedback-empty')).toBeTruthy();
    });
  });

  describe('displayFeedback', () => {
    beforeEach(() => {
      feedbackDisplay.initialize(container);
    });

    it('should display feedback with title and description', () => {
      const feedback = {
        title: 'Test Failed',
        description: 'Your code produced incorrect output.',
        hint: null,
        codeSnippet: null
      };

      feedbackDisplay.displayFeedback(feedback);

      const titleElement = container.querySelector('.feedback-title-text');
      expect(titleElement).toBeTruthy();
      expect(titleElement.textContent).toBe('Test Failed');

      const descriptionElement = container.querySelector('.feedback-description');
      expect(descriptionElement).toBeTruthy();
      expect(descriptionElement.textContent).toContain('Your code produced incorrect output');
    });

    it('should throw error if feedback is not provided', () => {
      expect(() => feedbackDisplay.displayFeedback(null)).toThrow('Feedback object is required');
    });

    it('should display expected vs actual output', () => {
      const feedback = {
        title: 'Test Failed',
        description: 'Expected: 42\nYour code produced: 24',
        hint: null,
        codeSnippet: null
      };

      feedbackDisplay.displayFeedback(feedback);

      const expectedOutput = container.querySelector('.feedback-output.expected');
      expect(expectedOutput).toBeTruthy();
      expect(expectedOutput.textContent).toContain('Expected:');
      expect(expectedOutput.textContent).toContain('42');

      const actualOutput = container.querySelector('.feedback-output.actual');
      expect(actualOutput).toBeTruthy();
      expect(actualOutput.textContent).toContain('Your code produced:');
      expect(actualOutput.textContent).toContain('24');
    });

    it('should display hint when available', () => {
      const feedback = {
        title: 'Variable Not Found',
        description: 'You are trying to use a variable that does not exist.',
        hint: 'Make sure you have defined all variables before using them.',
        codeSnippet: null
      };

      feedbackDisplay.displayFeedback(feedback);

      const hintElement = container.querySelector('.feedback-hint');
      expect(hintElement).toBeTruthy();
      expect(hintElement.textContent).toContain('Hint:');
      expect(hintElement.textContent).toContain('Make sure you have defined all variables');
    });

    it('should not display hint section when hint is null', () => {
      const feedback = {
        title: 'Test Failed',
        description: 'Something went wrong.',
        hint: null,
        codeSnippet: null
      };

      feedbackDisplay.displayFeedback(feedback);

      const hintElement = container.querySelector('.feedback-hint');
      expect(hintElement).toBeFalsy();
    });

    it('should display code snippet when available', () => {
      const feedback = {
        title: 'Syntax Error',
        description: 'There is a problem with your code.',
        hint: null,
        codeSnippet: 'def greet()\n    return "Hello"'
      };

      feedbackDisplay.displayFeedback(feedback);

      const snippetElement = container.querySelector('.feedback-code-snippet');
      expect(snippetElement).toBeTruthy();
      
      const codeElement = snippetElement.querySelector('code');
      expect(codeElement).toBeTruthy();
      expect(codeElement.textContent).toBe('def greet()\n    return "Hello"');
    });

    it('should not display code snippet section when codeSnippet is null', () => {
      const feedback = {
        title: 'Test Failed',
        description: 'Something went wrong.',
        hint: null,
        codeSnippet: null
      };

      feedbackDisplay.displayFeedback(feedback);

      const snippetElement = container.querySelector('.feedback-code-snippet');
      expect(snippetElement).toBeFalsy();
    });

    it('should display line number information for syntax errors', () => {
      const feedback = {
        title: 'Syntax Error',
        description: 'There is a problem with your code.\n\nThe error is on or near line 5.',
        hint: 'Check for missing colons and parentheses.',
        codeSnippet: null
      };

      feedbackDisplay.displayFeedback(feedback);

      const lineInfo = container.querySelector('.feedback-line-info');
      expect(lineInfo).toBeTruthy();
      expect(lineInfo.textContent).toContain('line 5');
    });

    it('should display details section when present', () => {
      const feedback = {
        title: 'Type Error',
        description: 'You are trying to combine incompatible types.\n\nDetails: Cannot add string and integer.',
        hint: null,
        codeSnippet: null
      };

      feedbackDisplay.displayFeedback(feedback);

      const details = container.querySelector('.feedback-details');
      expect(details).toBeTruthy();
      expect(details.textContent).toContain('Details:');
      expect(details.textContent).toContain('Cannot add string and integer');
    });

    it('should handle multiline descriptions correctly', () => {
      const feedback = {
        title: 'Test Failed',
        description: 'First line\n\nSecond line\nThird line',
        hint: null,
        codeSnippet: null
      };

      feedbackDisplay.displayFeedback(feedback);

      const textElements = container.querySelectorAll('.feedback-text');
      expect(textElements.length).toBeGreaterThan(0);
    });

    it('should display feedback icon', () => {
      const feedback = {
        title: 'Test Failed',
        description: 'Something went wrong.',
        hint: null,
        codeSnippet: null
      };

      feedbackDisplay.displayFeedback(feedback);

      const icon = container.querySelector('.feedback-icon');
      expect(icon).toBeTruthy();
      expect(icon.textContent).toBe('💡');
    });
  });

  describe('clearFeedback', () => {
    beforeEach(() => {
      feedbackDisplay.initialize(container);
    });

    it('should clear feedback and show empty state', () => {
      const feedback = {
        title: 'Test Failed',
        description: 'Something went wrong.',
        hint: null,
        codeSnippet: null
      };

      feedbackDisplay.displayFeedback(feedback);
      expect(container.querySelector('.feedback-display')).toBeTruthy();

      feedbackDisplay.clearFeedback();
      expect(container.querySelector('.feedback-display')).toBeFalsy();
      expect(container.querySelector('.feedback-empty')).toBeTruthy();
    });
  });

  describe('getFeedback', () => {
    beforeEach(() => {
      feedbackDisplay.initialize(container);
    });

    it('should return null when no feedback is set', () => {
      expect(feedbackDisplay.getFeedback()).toBeNull();
    });

    it('should return current feedback', () => {
      const feedback = {
        title: 'Test Failed',
        description: 'Something went wrong.',
        hint: null,
        codeSnippet: null
      };

      feedbackDisplay.displayFeedback(feedback);
      expect(feedbackDisplay.getFeedback()).toBe(feedback);
    });
  });

  describe('hasFeedback', () => {
    beforeEach(() => {
      feedbackDisplay.initialize(container);
    });

    it('should return false when no feedback is set', () => {
      expect(feedbackDisplay.hasFeedback()).toBe(false);
    });

    it('should return true when feedback is set', () => {
      const feedback = {
        title: 'Test Failed',
        description: 'Something went wrong.',
        hint: null,
        codeSnippet: null
      };

      feedbackDisplay.displayFeedback(feedback);
      expect(feedbackDisplay.hasFeedback()).toBe(true);
    });

    it('should return false after clearing feedback', () => {
      const feedback = {
        title: 'Test Failed',
        description: 'Something went wrong.',
        hint: null,
        codeSnippet: null
      };

      feedbackDisplay.displayFeedback(feedback);
      feedbackDisplay.clearFeedback();
      expect(feedbackDisplay.hasFeedback()).toBe(false);
    });
  });

  describe('dispose', () => {
    beforeEach(() => {
      feedbackDisplay.initialize(container);
    });

    it('should clean up resources', () => {
      const feedback = {
        title: 'Test Failed',
        description: 'Something went wrong.',
        hint: null,
        codeSnippet: null
      };

      feedbackDisplay.displayFeedback(feedback);
      feedbackDisplay.dispose();

      expect(feedbackDisplay.container).toBeNull();
      expect(feedbackDisplay.feedback).toBeNull();
      expect(container.innerHTML).toBe('');
    });
  });

  describe('edge cases', () => {
    beforeEach(() => {
      feedbackDisplay.initialize(container);
    });

    it('should handle empty title', () => {
      const feedback = {
        title: '',
        description: 'Something went wrong.',
        hint: null,
        codeSnippet: null
      };

      feedbackDisplay.displayFeedback(feedback);
      const titleElement = container.querySelector('.feedback-title-text');
      expect(titleElement).toBeTruthy();
      expect(titleElement.textContent).toBe('');
    });

    it('should handle empty description', () => {
      const feedback = {
        title: 'Test Failed',
        description: '',
        hint: null,
        codeSnippet: null
      };

      feedbackDisplay.displayFeedback(feedback);
      const descriptionElement = container.querySelector('.feedback-description');
      expect(descriptionElement).toBeTruthy();
    });

    it('should handle feedback with only expected output', () => {
      const feedback = {
        title: 'Test Failed',
        description: 'Expected: 42',
        hint: null,
        codeSnippet: null
      };

      feedbackDisplay.displayFeedback(feedback);
      const expectedOutput = container.querySelector('.feedback-output.expected');
      expect(expectedOutput).toBeTruthy();
      
      const actualOutput = container.querySelector('.feedback-output.actual');
      expect(actualOutput).toBeFalsy();
    });

    it('should handle feedback with only actual output', () => {
      const feedback = {
        title: 'Test Failed',
        description: 'Your code produced: 24',
        hint: null,
        codeSnippet: null
      };

      feedbackDisplay.displayFeedback(feedback);
      const actualOutput = container.querySelector('.feedback-output.actual');
      expect(actualOutput).toBeTruthy();
      
      const expectedOutput = container.querySelector('.feedback-output.expected');
      expect(expectedOutput).toBeFalsy();
    });

    it('should handle empty hint string', () => {
      const feedback = {
        title: 'Test Failed',
        description: 'Something went wrong.',
        hint: '',
        codeSnippet: null
      };

      feedbackDisplay.displayFeedback(feedback);
      // Empty string is falsy in conditional checks, so hint section should not be displayed
      const hintElement = container.querySelector('.feedback-hint');
      expect(hintElement).toBeFalsy();
    });

    it('should handle empty code snippet string', () => {
      const feedback = {
        title: 'Test Failed',
        description: 'Something went wrong.',
        hint: null,
        codeSnippet: ''
      };

      feedbackDisplay.displayFeedback(feedback);
      // Empty string is falsy in conditional checks, so snippet section should not be displayed
      const snippetElement = container.querySelector('.feedback-code-snippet');
      expect(snippetElement).toBeFalsy();
    });
  });

  describe('integration with FeedbackGenerator', () => {
    beforeEach(() => {
      feedbackDisplay.initialize(container);
    });

    it('should display feedback from FeedbackGenerator for NameError', () => {
      const feedback = {
        title: 'Variable Not Found',
        description: "You're trying to use 'x', but it hasn't been created yet.",
        hint: "Make sure you've defined all variables and functions before using them. Check for typos in names.",
        codeSnippet: null
      };

      feedbackDisplay.displayFeedback(feedback);

      expect(container.querySelector('.feedback-title-text').textContent).toBe('Variable Not Found');
      expect(container.textContent).toContain("You're trying to use 'x'");
      expect(container.textContent).toContain("Make sure you've defined all variables");
    });

    it('should display feedback from FeedbackGenerator for syntax error with line number', () => {
      const feedback = {
        title: 'Syntax Error',
        description: "There's a problem with how your code is written. Python can't understand it.\n\nThe error is on or near line 3.",
        hint: 'Check for missing colons (:), unmatched parentheses or quotes, and proper indentation.',
        codeSnippet: null
      };

      feedbackDisplay.displayFeedback(feedback);

      expect(container.querySelector('.feedback-title-text').textContent).toBe('Syntax Error');
      expect(container.querySelector('.feedback-line-info')).toBeTruthy();
      expect(container.textContent).toContain('line 3');
    });

    it('should display feedback from FeedbackGenerator for timeout error', () => {
      const feedback = {
        title: 'Code Took Too Long',
        description: "Your code took more than 10 seconds to run. This usually means there's an infinite loop or your code is doing too much work.",
        hint: 'Check for loops that might never end. Make sure loop conditions will eventually become false.',
        codeSnippet: null
      };

      feedbackDisplay.displayFeedback(feedback);

      expect(container.querySelector('.feedback-title-text').textContent).toBe('Code Took Too Long');
      expect(container.textContent).toContain('10 seconds');
      expect(container.textContent).toContain('infinite loop');
    });
  });
});
