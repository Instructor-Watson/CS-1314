/**
 * Unit tests for ResultsPanel component
 * Tests rendering, result display, and visual indicators
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ResultsPanel } from './ResultsPanel.js';

describe('ResultsPanel', () => {
  let resultsPanel;
  let container;

  beforeEach(() => {
    resultsPanel = new ResultsPanel();
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    resultsPanel.dispose();
    document.body.removeChild(container);
  });

  describe('initialization', () => {
    it('should initialize with a container element', () => {
      resultsPanel.initialize(container);
      expect(resultsPanel.container).toBe(container);
    });

    it('should throw error if container is not provided', () => {
      expect(() => resultsPanel.initialize(null)).toThrow('Container element is required');
    });

    it('should render empty state on initialization', () => {
      resultsPanel.initialize(container);
      expect(container.querySelector('.results-empty')).toBeTruthy();
      expect(container.textContent).toContain('No test results yet');
    });
  });

  describe('displayResults', () => {
    beforeEach(() => {
      resultsPanel.initialize(container);
    });

    it('should throw error if results object is not provided', () => {
      expect(() => resultsPanel.displayResults(null)).toThrow('Results object is required');
    });

    it('should display test summary with correct counts', () => {
      const results = {
        totalTests: 5,
        passedTests: 3,
        failedTests: 2,
        testCases: []
      };

      resultsPanel.displayResults(results);

      const summary = container.querySelector('.results-summary');
      expect(summary).toBeTruthy();
      expect(summary.textContent).toContain('Total:');
      expect(summary.textContent).toContain('5');
      expect(summary.textContent).toContain('Passed:');
      expect(summary.textContent).toContain('3');
      expect(summary.textContent).toContain('Failed:');
      expect(summary.textContent).toContain('2');
    });

    it('should display success message when all tests pass', () => {
      const results = {
        totalTests: 3,
        passedTests: 3,
        failedTests: 0,
        testCases: [
          { name: 'test1', passed: true, message: '', displayName: 'Test 1' },
          { name: 'test2', passed: true, message: '', displayName: 'Test 2' },
          { name: 'test3', passed: true, message: '', displayName: 'Test 3' }
        ]
      };

      resultsPanel.displayResults(results);

      const successMessage = container.querySelector('.success-message');
      expect(successMessage).toBeTruthy();
      expect(successMessage.textContent).toContain('All tests passed');
    });

    it('should not display success message when tests fail', () => {
      const results = {
        totalTests: 3,
        passedTests: 2,
        failedTests: 1,
        testCases: [
          { name: 'test1', passed: true, message: '', displayName: 'Test 1' },
          { name: 'test2', passed: false, message: 'Failed', displayName: 'Test 2' },
          { name: 'test3', passed: true, message: '', displayName: 'Test 3' }
        ]
      };

      resultsPanel.displayResults(results);

      const successMessage = container.querySelector('.success-message');
      expect(successMessage).toBeFalsy();
    });

    it('should display detailed results for each test case', () => {
      const results = {
        totalTests: 2,
        passedTests: 1,
        failedTests: 1,
        testCases: [
          { name: 'test_pass', passed: true, message: '', displayName: 'Test Pass' },
          { name: 'test_fail', passed: false, message: 'Assertion failed', displayName: 'Test Fail' }
        ]
      };

      resultsPanel.displayResults(results);

      const testCases = container.querySelectorAll('.test-case');
      expect(testCases.length).toBe(2);
    });

    it('should use visual indicators for passed tests', () => {
      const results = {
        totalTests: 1,
        passedTests: 1,
        failedTests: 0,
        testCases: [
          { name: 'test_pass', passed: true, message: '', displayName: 'Test Pass' }
        ]
      };

      resultsPanel.displayResults(results);

      const testCase = container.querySelector('.test-case');
      expect(testCase.classList.contains('passed')).toBe(true);
      
      const icon = container.querySelector('.test-status-icon');
      expect(icon.textContent).toBe('✓');
    });

    it('should use visual indicators for failed tests', () => {
      const results = {
        totalTests: 1,
        passedTests: 0,
        failedTests: 1,
        testCases: [
          { name: 'test_fail', passed: false, message: 'Failed', displayName: 'Test Fail' }
        ]
      };

      resultsPanel.displayResults(results);

      const testCase = container.querySelector('.test-case');
      expect(testCase.classList.contains('failed')).toBe(true);
      
      const icon = container.querySelector('.test-status-icon');
      expect(icon.textContent).toBe('✗');
    });

    it('should display test case names', () => {
      const results = {
        totalTests: 1,
        passedTests: 1,
        failedTests: 0,
        testCases: [
          { name: 'test_example', passed: true, message: '', displayName: 'Example Test' }
        ]
      };

      resultsPanel.displayResults(results);

      const testName = container.querySelector('.test-case-name');
      expect(testName.textContent).toBe('Example Test');
    });

    it('should display test case messages', () => {
      const results = {
        totalTests: 1,
        passedTests: 0,
        failedTests: 1,
        testCases: [
          { name: 'test_fail', passed: false, message: 'Expected 5 but got 3', displayName: 'Test Fail' }
        ]
      };

      resultsPanel.displayResults(results);

      const message = container.querySelector('.test-case-message');
      expect(message).toBeTruthy();
      expect(message.textContent).toBe('Expected 5 but got 3');
    });

    it('should display expected and actual output when available', () => {
      const results = {
        totalTests: 1,
        passedTests: 0,
        failedTests: 1,
        testCases: [
          {
            name: 'test_fail',
            passed: false,
            message: 'Mismatch',
            displayName: 'Test Fail',
            expectedOutput: '5',
            actualOutput: '3'
          }
        ]
      };

      resultsPanel.displayResults(results);

      const outputContainer = container.querySelector('.test-case-output');
      expect(outputContainer).toBeTruthy();
      expect(outputContainer.textContent).toContain('Expected:');
      expect(outputContainer.textContent).toContain('5');
      expect(outputContainer.textContent).toContain('Actual:');
      expect(outputContainer.textContent).toContain('3');
    });

    it('should display error type for failed tests', () => {
      const results = {
        totalTests: 1,
        passedTests: 0,
        failedTests: 1,
        testCases: [
          {
            name: 'test_error',
            passed: false,
            message: 'Type error occurred',
            displayName: 'Test Error',
            errorType: 'TypeError'
          }
        ]
      };

      resultsPanel.displayResults(results);

      const errorType = container.querySelector('.test-case-error-type');
      expect(errorType).toBeTruthy();
      expect(errorType.textContent).toContain('TypeError');
    });
    it('should not display AssertionError type for normal failed checks', () => {
      const results = {
        totalTests: 1,
        passedTests: 0,
        failedTests: 1,
        testCases: [
          {
            name: 'test_assertion',
            passed: false,
            message: 'Your output is very close.',
            displayName: 'Test Assertion',
            errorType: 'AssertionError'
          }
        ]
      };

      resultsPanel.displayResults(results);

      const errorType = container.querySelector('.test-case-error-type');
      expect(errorType).toBeFalsy();
    });

    it('should handle empty test cases array', () => {
      const results = {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        testCases: []
      };

      resultsPanel.displayResults(results);

      const noTests = container.querySelector('.no-tests-message');
      expect(noTests).toBeTruthy();
      expect(noTests.textContent).toContain('No test cases were executed');
    });

    it('should escape HTML in test output to prevent XSS', () => {
      const results = {
        totalTests: 1,
        passedTests: 0,
        failedTests: 1,
        testCases: [
          {
            name: 'test_xss',
            passed: false,
            message: 'Failed',
            displayName: 'Test XSS',
            expectedOutput: '<script>alert("xss")</script>',
            actualOutput: '<img src=x onerror=alert(1)>'
          }
        ]
      };

      resultsPanel.displayResults(results);

      const outputContainer = container.querySelector('.test-case-output');
      expect(outputContainer.innerHTML).not.toContain('<script>');
      expect(outputContainer.innerHTML).not.toContain('<img');
      expect(outputContainer.innerHTML).toContain('&lt;script&gt;');
      expect(outputContainer.innerHTML).toContain('&lt;img');
    });
  });

  describe('clearResults', () => {
    it('should clear results and show empty state', () => {
      resultsPanel.initialize(container);

      const results = {
        totalTests: 1,
        passedTests: 1,
        failedTests: 0,
        testCases: [
          { name: 'test1', passed: true, message: '', displayName: 'Test 1' }
        ]
      };

      resultsPanel.displayResults(results);
      expect(container.querySelector('.results-panel')).toBeTruthy();

      resultsPanel.clearResults();
      expect(container.querySelector('.results-panel')).toBeFalsy();
      expect(container.querySelector('.results-empty')).toBeTruthy();
    });
  });

  describe('getResults', () => {
    it('should return null when no results are set', () => {
      resultsPanel.initialize(container);
      expect(resultsPanel.getResults()).toBeNull();
    });

    it('should return the current results', () => {
      resultsPanel.initialize(container);

      const results = {
        totalTests: 1,
        passedTests: 1,
        failedTests: 0,
        testCases: []
      };

      resultsPanel.displayResults(results);
      expect(resultsPanel.getResults()).toBe(results);
    });
  });

  describe('hasResults', () => {
    it('should return false when no results are set', () => {
      resultsPanel.initialize(container);
      expect(resultsPanel.hasResults()).toBe(false);
    });

    it('should return true when results are set', () => {
      resultsPanel.initialize(container);

      const results = {
        totalTests: 1,
        passedTests: 1,
        failedTests: 0,
        testCases: []
      };

      resultsPanel.displayResults(results);
      expect(resultsPanel.hasResults()).toBe(true);
    });
  });

  describe('dispose', () => {
    it('should clean up resources', () => {
      resultsPanel.initialize(container);

      const results = {
        totalTests: 1,
        passedTests: 1,
        failedTests: 0,
        testCases: []
      };

      resultsPanel.displayResults(results);
      resultsPanel.dispose();

      expect(resultsPanel.container).toBeNull();
      expect(resultsPanel.results).toBeNull();
      expect(container.innerHTML).toBe('');
    });
  });

  describe('edge cases', () => {
    beforeEach(() => {
      resultsPanel.initialize(container);
    });

    it('should handle test case with null message', () => {
      const results = {
        totalTests: 1,
        passedTests: 1,
        failedTests: 0,
        testCases: [
          { name: 'test1', passed: true, message: null, displayName: 'Test 1' }
        ]
      };

      resultsPanel.displayResults(results);
      const testCase = container.querySelector('.test-case');
      expect(testCase).toBeTruthy();
    });

    it('should handle test case with empty message', () => {
      const results = {
        totalTests: 1,
        passedTests: 1,
        failedTests: 0,
        testCases: [
          { name: 'test1', passed: true, message: '', displayName: 'Test 1' }
        ]
      };

      resultsPanel.displayResults(results);
      const message = container.querySelector('.test-case-message');
      expect(message).toBeFalsy();
    });

    it('should use test name as fallback when displayName is not provided', () => {
      const results = {
        totalTests: 1,
        passedTests: 1,
        failedTests: 0,
        testCases: [
          { name: 'test_fallback', passed: true, message: '' }
        ]
      };

      resultsPanel.displayResults(results);
      const testName = container.querySelector('.test-case-name');
      expect(testName.textContent).toBe('test_fallback');
    });

    it('should handle zero total tests', () => {
      const results = {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        testCases: []
      };

      resultsPanel.displayResults(results);
      const summary = container.querySelector('.results-summary');
      expect(summary).toBeTruthy();
      expect(summary.textContent).toContain('0');
    });

    it('should not show success message when total tests is zero', () => {
      const results = {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        testCases: []
      };

      resultsPanel.displayResults(results);
      const successMessage = container.querySelector('.success-message');
      expect(successMessage).toBeFalsy();
    });
  });
});


