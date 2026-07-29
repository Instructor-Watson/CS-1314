/**
 * Property-based tests for FeedbackGenerator
 * Feature: python-autograder-web-app
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { FeedbackGenerator } from './FeedbackGenerator.js';

describe('FeedbackGenerator Property Tests', () => {
  const feedbackGenerator = new FeedbackGenerator();

  /**
   * Property 13: Feedback Generation for Failures
   * **Validates: Requirements 5.1**
   * 
   * For any test result where passed = false, generateFeedback must return 
   * a non-empty feedback message with a title and description.
   */
  it('Property 13: should generate non-empty feedback for all failed test results', () => {
    fc.assert(
      fc.property(
        // Generate various failed test results
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 50 }),
          className: fc.string({ minLength: 1, maxLength: 50 }),
          displayName: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: null }),
          passed: fc.constant(false), // Always false for this property
          message: fc.option(fc.string({ minLength: 0, maxLength: 200 }), { nil: '' }),
          expectedOutput: fc.option(
            fc.oneof(
              fc.string(),
              fc.integer().map(n => n.toString()),
              fc.boolean().map(b => b.toString())
            ),
            { nil: null }
          ),
          actualOutput: fc.option(
            fc.oneof(
              fc.string(),
              fc.integer().map(n => n.toString()),
              fc.boolean().map(b => b.toString())
            ),
            { nil: null }
          ),
          errorType: fc.option(
            fc.constantFrom(
              'NameError',
              'TypeError',
              'SyntaxError',
              'IndentationError',
              'AttributeError',
              'IndexError',
              'KeyError',
              'ValueError',
              'ZeroDivisionError',
              'AssertionError',
              null
            ),
            { nil: null }
          )
        }),
        (testResult) => {
          // Generate feedback for the failed test
          const feedback = feedbackGenerator.generateFeedback(testResult);

          // Verify feedback object exists
          expect(feedback).toBeDefined();
          expect(feedback).not.toBeNull();

          // Verify feedback has required fields
          expect(feedback).toHaveProperty('title');
          expect(feedback).toHaveProperty('description');
          expect(feedback).toHaveProperty('hint');
          expect(feedback).toHaveProperty('codeSnippet');

          // Verify title is non-empty string
          expect(typeof feedback.title).toBe('string');
          expect(feedback.title.length).toBeGreaterThan(0);
          expect(feedback.title.trim()).not.toBe('');

          // Verify description is non-empty string
          expect(typeof feedback.description).toBe('string');
          expect(feedback.description.length).toBeGreaterThan(0);
          expect(feedback.description.trim()).not.toBe('');

          // Verify hint is either null or a string
          expect(feedback.hint === null || typeof feedback.hint === 'string').toBe(true);

          // Verify codeSnippet is either null or a string
          expect(feedback.codeSnippet === null || typeof feedback.codeSnippet === 'string').toBe(true);
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property 14: Expected vs Actual Output Inclusion
   * **Validates: Requirements 5.2**
   * 
   * For any test result that includes expectedOutput or actualOutput,
   * the generated feedback must include both values in the description.
   */
  it('Property 14: should include expected and actual output in feedback when present', () => {
    fc.assert(
      fc.property(
        // Generate test results with expectedOutput and/or actualOutput
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 50 }),
          className: fc.string({ minLength: 1, maxLength: 50 }),
          displayName: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: null }),
          passed: fc.constant(false), // Failed tests to trigger feedback generation
          message: fc.option(fc.string({ minLength: 0, maxLength: 200 }), { nil: '' }),
          expectedOutput: fc.oneof(
            fc.string({ minLength: 1 }),
            fc.integer().map(n => n.toString()),
            fc.boolean().map(b => b.toString()),
            fc.constant(null)
          ),
          actualOutput: fc.oneof(
            fc.string({ minLength: 1 }),
            fc.integer().map(n => n.toString()),
            fc.boolean().map(b => b.toString()),
            fc.constant(null)
          ),
          errorType: fc.option(
            fc.constantFrom('AssertionError', 'TypeError', 'ValueError', null),
            { nil: null }
          )
        }).filter(testResult => 
          // Only test cases where at least one output is present
          testResult.expectedOutput !== null || testResult.actualOutput !== null
        ),
        (testResult) => {
          // Generate feedback for the test result
          const feedback = feedbackGenerator.generateFeedback(testResult);

          // Verify feedback exists
          expect(feedback).toBeDefined();
          expect(feedback.description).toBeDefined();
          expect(typeof feedback.description).toBe('string');

          // If expectedOutput is present, it must appear in the description
          if (testResult.expectedOutput !== null) {
            expect(feedback.description).toContain('Expected:');
            expect(feedback.description).toContain(testResult.expectedOutput);
          }

          // If actualOutput is present, it must appear in the description
          if (testResult.actualOutput !== null) {
            expect(feedback.description).toContain('Your code produced:');
            expect(feedback.description).toContain(testResult.actualOutput);
          }

          // If both are present, both must be in the description
          if (testResult.expectedOutput !== null && testResult.actualOutput !== null) {
            expect(feedback.description).toContain('Expected:');
            expect(feedback.description).toContain(testResult.expectedOutput);
            expect(feedback.description).toContain('Your code produced:');
            expect(feedback.description).toContain(testResult.actualOutput);
          }
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property 15: Syntax Error Line Number Reporting
   * **Validates: Requirements 5.4**
   * 
   * For any syntax error with a line number, the generated feedback 
   * must include that line number in the description.
   */
  it('Property 15: should include line number in syntax error feedback', () => {
    fc.assert(
      fc.property(
        // Generate syntax errors with line numbers
        fc.record({
          line: fc.integer({ min: 1, max: 1000 }), // Line numbers from 1 to 1000
          message: fc.option(
            fc.constantFrom(
              'invalid syntax',
              'unexpected EOF while parsing',
              'expected \':\' after if statement',
              'unmatched \')\'',
              'unexpected indent',
              'invalid character in identifier',
              'EOL while scanning string literal'
            ),
            { nil: 'invalid syntax' }
          )
        }),
        (syntaxError) => {
          // Generate feedback for the syntax error
          const feedback = feedbackGenerator.generateSyntaxErrorFeedback(syntaxError);

          // Verify feedback exists
          expect(feedback).toBeDefined();
          expect(feedback).not.toBeNull();

          // Verify feedback has required structure
          expect(feedback).toHaveProperty('title');
          expect(feedback).toHaveProperty('description');
          expect(feedback).toHaveProperty('hint');
          expect(feedback).toHaveProperty('codeSnippet');

          // Verify title is non-empty
          expect(typeof feedback.title).toBe('string');
          expect(feedback.title.length).toBeGreaterThan(0);

          // Verify description is non-empty
          expect(typeof feedback.description).toBe('string');
          expect(feedback.description.length).toBeGreaterThan(0);

          // CRITICAL: Verify line number is included in the description
          expect(feedback.description).toContain(syntaxError.line.toString());
          
          // Verify the line number appears in a meaningful context (e.g., "line 5" or "line 42")
          const lineNumberPattern = new RegExp(`line ${syntaxError.line}`, 'i');
          expect(feedback.description).toMatch(lineNumberPattern);
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property 16: Runtime Error Explanation
   * **Validates: Requirements 5.5**
   * 
   * For any runtime error message, generateRuntimeErrorFeedback must return 
   * feedback with a simplified, beginner-friendly explanation.
   */
  it('Property 16: should provide beginner-friendly explanation for runtime errors', () => {
    fc.assert(
      fc.property(
        // Generate various runtime error messages
        fc.record({
          errorType: fc.constantFrom(
            'NameError',
            'TypeError',
            'AttributeError',
            'IndexError',
            'KeyError',
            'ValueError',
            'ZeroDivisionError'
          ),
          variableName: fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s)),
          lineNumber: fc.option(fc.integer({ min: 1, max: 100 }), { nil: null })
        }),
        ({ errorType, variableName, lineNumber }) => {
          // Construct a runtime error message based on the error type
          let errorMessage = '';
          
          switch (errorType) {
            case 'NameError':
              errorMessage = `NameError: name '${variableName}' is not defined`;
              break;
            case 'TypeError':
              errorMessage = `TypeError: unsupported operand type(s) for +: 'int' and 'str'`;
              break;
            case 'AttributeError':
              errorMessage = `AttributeError: '${variableName}' object has no attribute 'method'`;
              break;
            case 'IndexError':
              errorMessage = `IndexError: list index out of range`;
              break;
            case 'KeyError':
              errorMessage = `KeyError: '${variableName}'`;
              break;
            case 'ValueError':
              errorMessage = `ValueError: invalid literal for int() with base 10: '${variableName}'`;
              break;
            case 'ZeroDivisionError':
              errorMessage = `ZeroDivisionError: division by zero`;
              break;
          }

          // Add line number to error message if present
          if (lineNumber !== null) {
            errorMessage = `  File "<string>", line ${lineNumber}\n${errorMessage}`;
          }

          // Generate feedback for the runtime error
          const feedback = feedbackGenerator.generateRuntimeErrorFeedback(errorMessage);

          // Verify feedback exists and has required structure
          expect(feedback).toBeDefined();
          expect(feedback).not.toBeNull();
          expect(feedback).toHaveProperty('title');
          expect(feedback).toHaveProperty('description');
          expect(feedback).toHaveProperty('hint');
          expect(feedback).toHaveProperty('codeSnippet');

          // Verify title is non-empty and beginner-friendly
          expect(typeof feedback.title).toBe('string');
          expect(feedback.title.length).toBeGreaterThan(0);
          expect(feedback.title.trim()).not.toBe('');

          // Verify description is non-empty and contains explanation
          expect(typeof feedback.description).toBe('string');
          expect(feedback.description.length).toBeGreaterThan(0);
          expect(feedback.description.trim()).not.toBe('');

          // Verify the error type is identified in the feedback
          // The description should contain beginner-friendly language, not just the raw error
          expect(feedback.description.length).toBeGreaterThan(errorType.length);

          // Verify hint is either null or a string
          expect(feedback.hint === null || typeof feedback.hint === 'string').toBe(true);

          // Verify codeSnippet is either null or a string
          expect(feedback.codeSnippet === null || typeof feedback.codeSnippet === 'string').toBe(true);

          // If line number was present, verify it's included in the description
          if (lineNumber !== null) {
            expect(feedback.description).toContain(lineNumber.toString());
          }
        }
      ),
      { numRuns: 10 }
    );
  });
});
