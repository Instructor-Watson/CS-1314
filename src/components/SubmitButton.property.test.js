/**
 * Property-based tests for SubmitButton
 * Feature: python-autograder-web-app
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fc from 'fast-check';
import { SubmitButton } from './SubmitButton.js';

describe('SubmitButton Property Tests', () => {
  let button;
  let container;

  beforeEach(() => {
    // Create a mock container element
    container = document.createElement('div');
    container.id = 'test-submit-button-property';
    document.body.appendChild(container);
    
    button = new SubmitButton();
    button.initialize(container);
  });

  afterEach(() => {
    if (button) {
      button.dispose();
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  /**
   * Property 6: Code Submission Triggers Execution
   * **Validates: Requirements 3.1**
   * 
   * For any non-empty Python code string, submitting the code should invoke 
   * the Python_Runtime's execution method.
   * 
   * This property verifies that when the submit button is clicked with valid code,
   * the registered callback is invoked, which would trigger the autograder execution.
   */
  it('Property 6: should trigger callback when submit button is clicked with valid code', () => {
    fc.assert(
      fc.property(
        // Generate various non-empty Python code strings
        fc.oneof(
          // Simple Python statements
          fc.stringMatching(/^[a-z_][a-z0-9_]{0,20} = \d+$/), // Variable assignment
          fc.constant('print("Hello, World!")'),
          fc.constant('def greet():\n    return "Hello"'),
          fc.constant('x = 10\ny = 20\nprint(x + y)'),
          fc.constant('for i in range(5):\n    print(i)'),
          fc.constant('if True:\n    pass'),
          fc.constant('class MyClass:\n    pass'),
          // More complex code
          fc.constant('def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n-1)'),
          fc.constant('import math\nprint(math.pi)'),
          fc.constant('try:\n    x = 1/0\nexcept:\n    pass'),
          // Code with various lengths
          fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0)
        ),
        (code) => {
          // Create a mock callback to track invocations
          const mockCallback = vi.fn();
          
          // Register the callback
          button.onSubmit(mockCallback);
          
          // Enable the button (simulating Pyodide ready state)
          button.enable();
          
          // Ensure button is not in loading state
          button.setLoading(false);
          
          // Verify button is enabled and ready
          expect(button.isButtonEnabled()).toBe(true);
          expect(button.isButtonLoading()).toBe(false);
          
          // Simulate clicking the submit button with the code
          // In a real scenario, the code would be passed to the callback
          // Here we verify that the callback is invoked
          button.button.click();
          
          // Verify the callback was invoked exactly once
          expect(mockCallback).toHaveBeenCalledTimes(1);
          
          // Verify the callback was called (which would trigger execution)
          expect(mockCallback).toHaveBeenCalled();
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Additional property test: Submit button should not trigger callback when disabled
   * This complements Property 6 by verifying the negative case
   */
  it('should not trigger callback when button is disabled', () => {
    fc.assert(
      fc.property(
        // Generate various code strings
        fc.string({ minLength: 1, maxLength: 100 }),
        (code) => {
          // Create a mock callback
          const mockCallback = vi.fn();
          
          // Register the callback
          button.onSubmit(mockCallback);
          
          // Keep button disabled (simulating Pyodide not ready)
          button.disable();
          
          // Verify button is disabled
          expect(button.isButtonEnabled()).toBe(false);
          
          // Try to click the button
          button.button.click();
          
          // Verify the callback was NOT invoked
          expect(mockCallback).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Additional property test: Submit button should not trigger callback when loading
   * This complements Property 6 by verifying execution is not triggered during loading
   */
  it('should not trigger callback when button is in loading state', () => {
    fc.assert(
      fc.property(
        // Generate various code strings
        fc.string({ minLength: 1, maxLength: 100 }),
        (code) => {
          // Create a mock callback
          const mockCallback = vi.fn();
          
          // Register the callback
          button.onSubmit(mockCallback);
          
          // Enable button first
          button.enable();
          
          // Set loading state (simulating code execution in progress)
          button.setLoading(true);
          
          // Verify button is in loading state
          expect(button.isButtonLoading()).toBe(true);
          
          // Try to click the button
          button.button.click();
          
          // Verify the callback was NOT invoked
          expect(mockCallback).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property test: Multiple submissions should trigger callback multiple times
   * Verifies that the button can handle repeated submissions
   */
  it('should trigger callback for each submission when clicked multiple times', () => {
    fc.assert(
      fc.property(
        // Generate a number of clicks (1-10)
        fc.integer({ min: 1, max: 10 }),
        (numClicks) => {
          // Create a mock callback
          const mockCallback = vi.fn();
          
          // Register the callback
          button.onSubmit(mockCallback);
          
          // Enable the button
          button.enable();
          
          // Click the button multiple times
          for (let i = 0; i < numClicks; i++) {
            button.button.click();
          }
          
          // Verify the callback was invoked the correct number of times
          expect(mockCallback).toHaveBeenCalledTimes(numClicks);
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property test: Button state transitions should maintain callback functionality
   * Verifies that enabling/disabling/loading state changes don't break callback
   */
  it('should maintain callback functionality through state transitions', () => {
    fc.assert(
      fc.property(
        // Generate a sequence of state transitions
        fc.array(
          fc.constantFrom('enable', 'disable', 'loading-on', 'loading-off'),
          { minLength: 2, maxLength: 10 }
        ),
        (stateTransitions) => {
          // Create a mock callback
          const mockCallback = vi.fn();
          
          // Register the callback
          button.onSubmit(mockCallback);
          
          // Apply state transitions
          for (const transition of stateTransitions) {
            switch (transition) {
              case 'enable':
                button.enable();
                break;
              case 'disable':
                button.disable();
                break;
              case 'loading-on':
                button.setLoading(true);
                break;
              case 'loading-off':
                button.setLoading(false);
                break;
            }
          }
          
          // After all transitions, if button is enabled and not loading, it should work
          const shouldWork = button.isButtonEnabled() && !button.isButtonLoading();
          
          // Reset mock
          mockCallback.mockClear();
          
          // Try to click
          button.button.click();
          
          // Verify callback behavior matches expected state
          if (shouldWork) {
            expect(mockCallback).toHaveBeenCalledTimes(1);
          } else {
            expect(mockCallback).not.toHaveBeenCalled();
          }
        }
      ),
      { numRuns: 10 }
    );
  });
});
