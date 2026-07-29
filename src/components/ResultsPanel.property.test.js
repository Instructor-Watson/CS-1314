/**
 * Property-based tests for ResultsPanel
 * Feature: python-autograder-web-app
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { ResultsPanel } from './ResultsPanel.js';

describe('ResultsPanel Property Tests', () => {
  let panel;
  let container;

  beforeEach(() => {
    // Create a real DOM container
    container = document.createElement('div');
    container.id = 'test-results-panel-property';
    document.body.appendChild(container);
    
    panel = new ResultsPanel();
    panel.initialize(container);
  });

  afterEach(() => {
    if (panel) {
      panel.dispose();
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  /**
   * Property 17: Test Result Status Display
   * **Validates: Requirements 5.6, 6.5**
   * 
   * For any set of test results, the displayed feedback should clearly distinguish 
   * which test cases passed and which failed using different visual indicators.
   */
  it('Property 17: should distinguish passed and failed tests with visual indicators', () => {
    fc.assert(
      fc.property(
        // Generate test results with a mix of passed and failed tests
        fc.record({
          totalTests: fc.integer({ min: 1, max: 20 }),
          testCases: fc.array(
            fc.record({
              name: fc.stringMatching(/^test_[a-z0-9_]{3,30}$/),
              className: fc.stringMatching(/^Test[A-Z][a-zA-Z0-9]{2,20}$/),
              displayName: fc.string({ minLength: 10, maxLength: 100 }),
              passed: fc.boolean(),
              message: fc.option(fc.string({ minLength: 0, maxLength: 200 }), { nil: '' }),
              expectedOutput: fc.option(
                fc.oneof(fc.string(), fc.integer().map(n => n.toString())),
                { nil: null }
              ),
              actualOutput: fc.option(
                fc.oneof(fc.string(), fc.integer().map(n => n.toString())),
                { nil: null }
              ),
              errorType: fc.option(
                fc.constantFrom('AssertionError', 'TypeError', 'ValueError', null),
                { nil: null }
              ),
              executionTime: fc.integer({ min: 1, max: 5000 })
            }),
            { minLength: 1, maxLength: 20 }
          ),
          executionTime: fc.integer({ min: 10, max: 10000 }),
          timedOut: fc.constant(false)
        }).chain(result => {
          // Ensure totalTests matches testCases length
          const totalTests = result.testCases.length;
          const passedTests = result.testCases.filter(tc => tc.passed).length;
          const failedTests = totalTests - passedTests;
          
          return fc.constant({
            totalTests,
            passedTests,
            failedTests,
            testCases: result.testCases,
            executionTime: result.executionTime,
            timedOut: result.timedOut
          });
        }),
        (results) => {
          // Display the results
          panel.displayResults(results);
          
          // Verify that each test case is displayed with appropriate visual indicators
          results.testCases.forEach((testCase, index) => {
            const testElement = container.querySelector(`[data-test-index="${index}"]`);
            
            expect(testElement).not.toBeNull();
            
            // Verify the test case has the correct status class
            if (testCase.passed) {
              expect(testElement.classList.contains('passed')).toBe(true);
              expect(testElement.classList.contains('failed')).toBe(false);
            } else {
              expect(testElement.classList.contains('failed')).toBe(true);
              expect(testElement.classList.contains('passed')).toBe(false);
            }
            
            // Verify visual indicator (icon) is present
            const iconElement = testElement.querySelector('.test-status-icon');
            expect(iconElement).not.toBeNull();
            
            // Verify icon content matches status
            if (testCase.passed) {
              expect(iconElement.textContent).toBe('✓');
            } else {
              expect(iconElement.textContent).toBe('✗');
            }
            
            // Verify test name is displayed
            const nameElement = testElement.querySelector('.test-case-name');
            expect(nameElement).not.toBeNull();
            expect(nameElement.textContent).toBe(testCase.displayName || testCase.name);
          });
          
          // Verify that passed and failed tests are visually distinguishable
          const passedElements = container.querySelectorAll('.test-case.passed');
          const failedElements = container.querySelectorAll('.test-case.failed');
          
          expect(passedElements.length).toBe(results.passedTests);
          expect(failedElements.length).toBe(results.failedTests);
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property 18: Test Summary Accuracy
   * **Validates: Requirements 6.1**
   * 
   * For any test execution result, the displayed summary counts (total, passed, failed) 
   * should exactly match the counts derived from the individual test case results.
   */
  it('Property 18: should display accurate test summary counts', () => {
    fc.assert(
      fc.property(
        // Generate test results with various combinations of passed/failed tests
        fc.array(
          fc.record({
            name: fc.stringMatching(/^test_[a-z0-9_]{3,30}$/),
            className: fc.stringMatching(/^Test[A-Z][a-zA-Z0-9]{2,20}$/),
            displayName: fc.string({ minLength: 10, maxLength: 100 }),
            passed: fc.boolean(),
            message: fc.option(fc.string({ minLength: 0, maxLength: 200 }), { nil: '' }),
            expectedOutput: fc.option(fc.string(), { nil: null }),
            actualOutput: fc.option(fc.string(), { nil: null }),
            errorType: fc.option(fc.constantFrom('AssertionError', 'TypeError', null), { nil: null }),
            executionTime: fc.integer({ min: 1, max: 5000 })
          }),
          { minLength: 1, maxLength: 20 }
        ).map(testCases => {
          // Calculate counts from test cases
          const totalTests = testCases.length;
          const passedTests = testCases.filter(tc => tc.passed).length;
          const failedTests = totalTests - passedTests;
          
          return {
            totalTests,
            passedTests,
            failedTests,
            testCases,
            executionTime: Math.floor(Math.random() * 10000),
            timedOut: false
          };
        }),
        (results) => {
          // Display the results
          panel.displayResults(results);
          
          // Find the summary section
          const summaryElement = container.querySelector('.results-summary');
          expect(summaryElement).not.toBeNull();
          
          // Find the count elements
          const totalElement = container.querySelector('.test-count.total .count-value');
          const passedElement = container.querySelector('.test-count.passed .count-value');
          const failedElement = container.querySelector('.test-count.failed .count-value');
          
          expect(totalElement).not.toBeNull();
          expect(passedElement).not.toBeNull();
          expect(failedElement).not.toBeNull();
          
          // Verify the displayed counts match the actual counts
          expect(parseInt(totalElement.textContent)).toBe(results.totalTests);
          expect(parseInt(passedElement.textContent)).toBe(results.passedTests);
          expect(parseInt(failedElement.textContent)).toBe(results.failedTests);
          
          // Verify the counts are consistent
          expect(results.passedTests + results.failedTests).toBe(results.totalTests);
          
          // Verify the displayed counts are also consistent
          const displayedTotal = parseInt(totalElement.textContent);
          const displayedPassed = parseInt(passedElement.textContent);
          const displayedFailed = parseInt(failedElement.textContent);
          
          expect(displayedPassed + displayedFailed).toBe(displayedTotal);
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property 19: Complete Test Results Display
   * **Validates: Requirements 6.2**
   * 
   * For any test execution with N test cases, the results display should show 
   * detailed information for all N test cases.
   */
  it('Property 19: should display detailed information for all test cases', () => {
    fc.assert(
      fc.property(
        // Generate test results with varying numbers of test cases
        fc.integer({ min: 1, max: 20 }).chain(numTests => 
          fc.tuple(
            fc.constant(numTests),
            fc.array(
              fc.record({
                name: fc.stringMatching(/^test_[a-z0-9_]{3,30}$/),
                className: fc.stringMatching(/^Test[A-Z][a-zA-Z0-9]{2,20}$/),
                displayName: fc.string({ minLength: 10, maxLength: 100 }),
                passed: fc.boolean(),
                message: fc.option(fc.string({ minLength: 0, maxLength: 200 }), { nil: '' }),
                expectedOutput: fc.option(fc.string(), { nil: null }),
                actualOutput: fc.option(fc.string(), { nil: null }),
                errorType: fc.option(fc.constantFrom('AssertionError', 'TypeError', null), { nil: null }),
                executionTime: fc.integer({ min: 1, max: 5000 })
              }),
              { minLength: numTests, maxLength: numTests }
            )
          )
        ).map(([numTests, testCases]) => {
          const passedTests = testCases.filter(tc => tc.passed).length;
          const failedTests = numTests - passedTests;
          
          return {
            totalTests: numTests,
            passedTests,
            failedTests,
            testCases,
            executionTime: Math.floor(Math.random() * 10000),
            timedOut: false
          };
        }),
        (results) => {
          // Display the results
          panel.displayResults(results);
          
          // Count the number of test case elements displayed
          const testCaseElements = container.querySelectorAll('.test-case');
          
          // Verify that the number of displayed test cases matches the total
          expect(testCaseElements.length).toBe(results.totalTests);
          expect(testCaseElements.length).toBe(results.testCases.length);
          
          // Verify each test case has detailed information
          results.testCases.forEach((testCase, index) => {
            const testElement = container.querySelector(`[data-test-index="${index}"]`);
            
            expect(testElement).not.toBeNull();
            
            // Verify test name is displayed
            const nameElement = testElement.querySelector('.test-case-name');
            expect(nameElement).not.toBeNull();
            expect(nameElement.textContent).toBe(testCase.displayName || testCase.name);
            
            // Verify status icon is displayed
            const iconElement = testElement.querySelector('.test-status-icon');
            expect(iconElement).not.toBeNull();
            
            // Verify message is displayed if present
            if (testCase.message && testCase.message.trim() !== '') {
              const messageElement = testElement.querySelector('.test-case-message');
              expect(messageElement).not.toBeNull();
              expect(messageElement.textContent).toBe(testCase.message);
            }
            
            // Verify expected/actual output is displayed if present
            if (testCase.expectedOutput !== null) {
              const expectedElement = testElement.querySelector('.output-expected');
              expect(expectedElement).not.toBeNull();
              expect(expectedElement.textContent).toContain(testCase.expectedOutput);
            }
            
            if (testCase.actualOutput !== null) {
              const actualElement = testElement.querySelector('.output-actual');
              expect(actualElement).not.toBeNull();
              expect(actualElement.textContent).toContain(testCase.actualOutput);
            }
            
            // Verify error type is displayed for failed tests if present
            if (!testCase.passed && testCase.errorType) {
              const errorTypeElement = testElement.querySelector('.test-case-error-type');
              expect(errorTypeElement).not.toBeNull();
              expect(errorTypeElement.textContent).toContain(testCase.errorType);
            }
          });
        }
      ),
      { numRuns: 10 }
    );
  });
});
