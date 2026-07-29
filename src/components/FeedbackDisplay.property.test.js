/**
 * Property-based tests for FeedbackDisplay
 * Feature: python-autograder-web-app
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { FeedbackDisplay } from './FeedbackDisplay.js';

describe('FeedbackDisplay Property Tests', () => {
  let display;
  let container;

  beforeEach(() => {
    // Create a real DOM container
    container = document.createElement('div');
    container.id = 'test-feedback-display-property';
    document.body.appendChild(container);
    
    display = new FeedbackDisplay();
    display.initialize(container);
  });

  afterEach(() => {
    if (display) {
      display.dispose();
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  /**
   * Property 20: Failed Test Feedback Display
   * **Validates: Requirements 6.4**
   * 
   * For any test case that fails, the results display should include the 
   * generated feedback message for that specific test case.
   */
  it('Property 20: should display feedback message for failed tests', () => {
    fc.assert(
      fc.property(
        // Generate feedback messages for failed tests
        fc.record({
          title: fc.string({ minLength: 5, maxLength: 100 }),
          description: fc.string({ minLength: 20, maxLength: 500 }),
          hint: fc.option(fc.string({ minLength: 10, maxLength: 200 }), { nil: null }),
          codeSnippet: fc.option(fc.string({ minLength: 5, maxLength: 100 }), { nil: null })
        }).filter(feedback => 
          // Ensure title and description are non-empty after trimming
          feedback.title.trim().length > 0 && feedback.description.trim().length > 0
        ),
        (feedback) => {
          // Display the feedback
          display.displayFeedback(feedback);
          
          // Verify the feedback container is present
          const feedbackContainer = container.querySelector('.feedback-display');
          expect(feedbackContainer).not.toBeNull();
          
          // Verify the title is displayed
          const titleElement = container.querySelector('.feedback-title');
          expect(titleElement).not.toBeNull();
          
          const titleTextElement = titleElement.querySelector('.feedback-title-text');
          expect(titleTextElement).not.toBeNull();
          expect(titleTextElement.textContent).toBe(feedback.title);
          
          // Verify the title has an icon
          const iconElement = titleElement.querySelector('.feedback-icon');
          expect(iconElement).not.toBeNull();
          expect(iconElement.textContent).toBe('💡');
          
          // Verify the description is displayed
          const descriptionElement = container.querySelector('.feedback-description');
          expect(descriptionElement).not.toBeNull();
          
          // The description should contain the feedback text
          // (it may be split into multiple child elements for formatting)
          const descriptionText = descriptionElement.textContent;
          expect(descriptionText.length).toBeGreaterThan(0);
          
          // Check if the description contains key parts of the feedback
          // (allowing for formatting differences)
          const feedbackLines = feedback.description.split('\n').filter(line => line.trim().length > 0);
          feedbackLines.forEach(line => {
            // Each non-empty line should appear somewhere in the description
            expect(descriptionText).toContain(line.trim());
          });
          
          // Verify the hint is displayed if present
          if (feedback.hint !== null) {
            const hintElement = container.querySelector('.feedback-hint');
            expect(hintElement).not.toBeNull();
            
            const hintTextElement = hintElement.querySelector('.hint-text');
            expect(hintTextElement).not.toBeNull();
            expect(hintTextElement.textContent).toBe(feedback.hint);
            
            // Verify hint has a label
            const hintLabelElement = hintElement.querySelector('.hint-label');
            expect(hintLabelElement).not.toBeNull();
            expect(hintLabelElement.textContent).toBe('💡 Hint:');
          } else {
            // If no hint, the hint element should not be present
            const hintElement = container.querySelector('.feedback-hint');
            expect(hintElement).toBeNull();
          }
          
          // Verify the code snippet is displayed if present
          if (feedback.codeSnippet !== null) {
            const snippetElement = container.querySelector('.feedback-code-snippet');
            expect(snippetElement).not.toBeNull();
            
            const snippetCodeElement = snippetElement.querySelector('.snippet-code code');
            expect(snippetCodeElement).not.toBeNull();
            expect(snippetCodeElement.textContent).toBe(feedback.codeSnippet);
            
            // Verify snippet has a label
            const snippetLabelElement = snippetElement.querySelector('.snippet-label');
            expect(snippetLabelElement).not.toBeNull();
            expect(snippetLabelElement.textContent).toBe('Code:');
          } else {
            // If no code snippet, the snippet element should not be present
            const snippetElement = container.querySelector('.feedback-code-snippet');
            expect(snippetElement).toBeNull();
          }
          
          // Verify that the feedback is retrievable
          const retrievedFeedback = display.getFeedback();
          expect(retrievedFeedback).not.toBeNull();
          expect(retrievedFeedback.title).toBe(feedback.title);
          expect(retrievedFeedback.description).toBe(feedback.description);
          expect(retrievedFeedback.hint).toBe(feedback.hint);
          expect(retrievedFeedback.codeSnippet).toBe(feedback.codeSnippet);
          
          // Verify hasFeedback returns true
          expect(display.hasFeedback()).toBe(true);
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Additional property test: Feedback with expected/actual output formatting
   * Verifies that feedback with expected/actual output is properly formatted
   */
  it('should properly format feedback with expected and actual output', () => {
    fc.assert(
      fc.property(
        // Generate feedback with expected/actual output in the description
        fc.record({
          title: fc.string({ minLength: 5, maxLength: 100 }).filter(s => s.trim().length > 0),
          expectedValue: fc.oneof(
            fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
            fc.integer().map(n => n.toString()),
            fc.boolean().map(b => b.toString())
          ),
          actualValue: fc.oneof(
            fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
            fc.integer().map(n => n.toString()),
            fc.boolean().map(b => b.toString())
          ),
          hint: fc.option(fc.string({ minLength: 10, maxLength: 200 }), { nil: null }),
          codeSnippet: fc.option(fc.string({ minLength: 5, maxLength: 100 }), { nil: null })
        }).map(data => ({
          title: data.title,
          description: `Expected: ${data.expectedValue}\nYour code produced: ${data.actualValue}`,
          hint: data.hint,
          codeSnippet: data.codeSnippet,
          expectedValue: data.expectedValue,
          actualValue: data.actualValue
        })),
        (feedback) => {
          // Display the feedback
          display.displayFeedback(feedback);
          
          // Verify the description is displayed
          const descriptionElement = container.querySelector('.feedback-description');
          expect(descriptionElement).not.toBeNull();
          
          // Verify expected output is formatted correctly
          const expectedElement = descriptionElement.querySelector('.feedback-output.expected');
          expect(expectedElement).not.toBeNull();
          
          const expectedLabel = expectedElement.querySelector('.output-label');
          expect(expectedLabel).not.toBeNull();
          expect(expectedLabel.textContent).toBe('Expected: ');
          
          const expectedValue = expectedElement.querySelector('.output-value');
          expect(expectedValue).not.toBeNull();
          // Trim both values for comparison since the component may trim whitespace
          expect(expectedValue.textContent.trim()).toBe(feedback.expectedValue.trim());
          
          // Verify actual output is formatted correctly
          const actualElement = descriptionElement.querySelector('.feedback-output.actual');
          expect(actualElement).not.toBeNull();
          
          const actualLabel = actualElement.querySelector('.output-label');
          expect(actualLabel).not.toBeNull();
          expect(actualLabel.textContent).toBe('Your code produced: ');
          
          const actualValue = actualElement.querySelector('.output-value');
          expect(actualValue).not.toBeNull();
          // Trim both values for comparison since the component may trim whitespace
          expect(actualValue.textContent.trim()).toBe(feedback.actualValue.trim());
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Additional property test: Feedback with line number information
   * Verifies that feedback with line numbers is properly displayed
   */
  it('should properly display feedback with line number information', () => {
    fc.assert(
      fc.property(
        // Generate feedback with line number information
        fc.record({
          title: fc.string({ minLength: 5, maxLength: 100 }),
          lineNumber: fc.integer({ min: 1, max: 1000 }),
          errorMessage: fc.string({ minLength: 10, maxLength: 200 }),
          hint: fc.option(fc.string({ minLength: 10, maxLength: 200 }), { nil: null }),
          codeSnippet: fc.option(fc.string({ minLength: 5, maxLength: 100 }), { nil: null })
        }).map(data => ({
          title: data.title,
          description: `Error on line ${data.lineNumber}: ${data.errorMessage}`,
          hint: data.hint,
          codeSnippet: data.codeSnippet,
          lineNumber: data.lineNumber
        })),
        (feedback) => {
          // Display the feedback
          display.displayFeedback(feedback);
          
          // Verify the description is displayed
          const descriptionElement = container.querySelector('.feedback-description');
          expect(descriptionElement).not.toBeNull();
          
          // Verify line number information is displayed
          const lineInfoElement = descriptionElement.querySelector('.feedback-line-info');
          expect(lineInfoElement).not.toBeNull();
          
          // Verify the line number appears in the text
          expect(lineInfoElement.textContent).toContain(`line ${feedback.lineNumber}`);
        }
      ),
      { numRuns: 10 }
    );
  });
});
