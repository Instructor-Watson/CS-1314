/**
 * Property-based tests for AutograderEngine
 * Feature: python-autograder-web-app
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fc from 'fast-check';
import { AutograderEngine } from './AutograderEngine.js';
import { PyodideManager } from './PyodideManager.js';
import { TestSuiteLoader } from './TestSuiteLoader.js';

describe('AutograderEngine Property Tests', () => {
  let engine;
  let pyodideManager;
  let testSuiteLoader;

  beforeAll(async () => {
    pyodideManager = new PyodideManager();
    await pyodideManager.initialize();
    testSuiteLoader = new TestSuiteLoader();
    engine = new AutograderEngine(pyodideManager, testSuiteLoader);
  }, 60000);

  /**
   * Property 10: Test Execution Completeness
   * **Validates: Requirements 4.2, 4.3**
   * 
   * For any student code and test suite combination, the Autograder should execute 
   * all test cases in the test suite and return results for each one.
   */
  it('Property 10: should execute all tests in test suite and return results for each', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate a number of test methods (1 to 10)
        fc.integer({ min: 1, max: 10 }),
        async (numTests) => {
          // Generate simple student code that defines functions
          const studentCode = `
def add(a, b):
    return a + b

def multiply(a, b):
    return a * b

def subtract(a, b):
    return a - b
`;

          // Generate a test suite with the specified number of test methods
          const testMethods = [];
          for (let i = 0; i < numTests; i++) {
            testMethods.push(`
    def test_method_${i}(self):
        """Test method ${i}"""
        result = add(${i}, ${i})
        self.assertEqual(result, ${i * 2})
`);
          }

          const testCode = `
import unittest

class TestMath(unittest.TestCase):
${testMethods.join('\n')}
`;

          const result = await engine.gradeSubmission(studentCode, testCode, 'test-completeness');

          // Verify that totalTests matches the number of test methods we created
          expect(result.totalTests).toBe(numTests);
          
          // Verify that we have results for all test cases
          expect(result.testCases).toHaveLength(numTests);
          
          // Verify that the sum of passed and failed tests equals total tests
          expect(result.passedTests + result.failedTests).toBe(result.totalTests);
          
          // Verify that each test case has a name
          result.testCases.forEach((testCase, index) => {
            expect(testCase.name).toBeTruthy();
            expect(testCase.name).toContain('test_method_');
          });
        }
      ),
      { numRuns: 10 }
    );
  }, 300000); // 5 minute timeout for the entire property test

  /**
   * Property 12: Test Isolation
   * **Validates: Requirements 4.6**
   * 
   * For any test suite with multiple test cases, if one test case fails or raises 
   * an exception, all other test cases should still execute independently.
   */
  it('Property 12: should execute all tests independently even when some fail', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate number of passing tests before failure (0 to 5)
        fc.integer({ min: 0, max: 5 }),
        // Generate number of passing tests after failure (1 to 5)
        fc.integer({ min: 1, max: 5 }),
        // Generate type of failure (assertion or exception)
        fc.constantFrom('assertion', 'exception'),
        async (numBeforeFail, numAfterFail, failureType) => {
          // Student code with functions
          const studentCode = `
def add(a, b):
    return a + b

def divide(a, b):
    return a / b
`;

          // Build test suite with passing tests, one failing test, and more passing tests
          const testMethods = [];
          
          // Add passing tests before the failure
          for (let i = 0; i < numBeforeFail; i++) {
            testMethods.push(`
    def test_pass_before_${i}(self):
        """Test that passes before failure ${i}"""
        result = add(${i}, ${i})
        self.assertEqual(result, ${i * 2})
`);
          }

          // Add one failing test
          if (failureType === 'assertion') {
            testMethods.push(`
    def test_failing(self):
        """Test that fails with assertion"""
        result = add(1, 1)
        self.assertEqual(result, 999)  # This will fail
`);
          } else {
            testMethods.push(`
    def test_failing(self):
        """Test that raises exception"""
        result = divide(1, 0)  # This will raise ZeroDivisionError
        self.assertEqual(result, 1)
`);
          }

          // Add passing tests after the failure
          for (let i = 0; i < numAfterFail; i++) {
            testMethods.push(`
    def test_pass_after_${i}(self):
        """Test that passes after failure ${i}"""
        result = add(${i + 10}, ${i + 10})
        self.assertEqual(result, ${(i + 10) * 2})
`);
          }

          const testCode = `
import unittest

class TestIsolation(unittest.TestCase):
${testMethods.join('\n')}
`;

          const result = await engine.gradeSubmission(studentCode, testCode, 'test-isolation');

          const totalExpectedTests = numBeforeFail + 1 + numAfterFail;

          // Verify all tests were executed
          expect(result.totalTests).toBe(totalExpectedTests);
          expect(result.testCases).toHaveLength(totalExpectedTests);

          // Verify exactly one test failed
          const failedTests = result.testCases.filter(tc => !tc.passed);
          expect(failedTests).toHaveLength(1);
          expect(failedTests[0].name).toBe('test_failing');

          // Verify all other tests passed
          const passedTests = result.testCases.filter(tc => tc.passed);
          expect(passedTests).toHaveLength(numBeforeFail + numAfterFail);

          // Verify the counts match
          expect(result.passedTests).toBe(numBeforeFail + numAfterFail);
          expect(result.failedTests).toBe(1);

          // Verify tests before failure executed
          for (let i = 0; i < numBeforeFail; i++) {
            const testCase = result.testCases.find(tc => tc.name === `test_pass_before_${i}`);
            expect(testCase).toBeDefined();
            expect(testCase.passed).toBe(true);
          }

          // Verify tests after failure executed
          for (let i = 0; i < numAfterFail; i++) {
            const testCase = result.testCases.find(tc => tc.name === `test_pass_after_${i}`);
            expect(testCase).toBeDefined();
            expect(testCase.passed).toBe(true);
          }
        }
      ),
      { numRuns: 10 }
    );
  }, 300000); // 5 minute timeout for the entire property test

  /**
   * Property 11: Test Failure Message Capture
   * **Validates: Requirements 4.4**
   * 
   * For any test case that fails with an assertion error, the captured test result 
   * should include the assertion message from the unittest framework.
   */
  it('Property 11: should capture assertion messages from failed tests', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate expected and actual values that don't match
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 101, max: 200 }),
        // Generate different assertion types
        fc.constantFrom('assertEqual', 'assertTrue', 'assertFalse', 'assertIn', 'assertIsNone'),
        async (expectedValue, actualValue, assertionType) => {
          // Student code that returns a value
          const studentCode = `
def get_value():
    return ${actualValue}

def get_list():
    return [1, 2, 3]

def get_none():
    return "not none"
`;

          // Build test suite with different types of assertions that will fail
          let testMethod;
          switch (assertionType) {
            case 'assertEqual':
              testMethod = `
    def test_assertion_failure(self):
        """Test that fails with assertEqual"""
        result = get_value()
        self.assertEqual(result, ${expectedValue})
`;
              break;
            case 'assertTrue':
              testMethod = `
    def test_assertion_failure(self):
        """Test that fails with assertTrue"""
        result = get_value()
        self.assertTrue(result < 50)
`;
              break;
            case 'assertFalse':
              testMethod = `
    def test_assertion_failure(self):
        """Test that fails with assertFalse"""
        result = get_value()
        self.assertFalse(result > 50)
`;
              break;
            case 'assertIn':
              testMethod = `
    def test_assertion_failure(self):
        """Test that fails with assertIn"""
        result = get_value()
        self.assertIn(result, get_list())
`;
              break;
            case 'assertIsNone':
              testMethod = `
    def test_assertion_failure(self):
        """Test that fails with assertIsNone"""
        result = get_none()
        self.assertIsNone(result)
`;
              break;
          }

          const testCode = `
import unittest

class TestFailureMessages(unittest.TestCase):
${testMethod}
`;

          const result = await engine.gradeSubmission(studentCode, testCode, 'test-failure-messages');

          // Verify that we have one test
          expect(result.totalTests).toBe(1);
          expect(result.testCases).toHaveLength(1);

          // Verify the test failed
          const testCase = result.testCases[0];
          expect(testCase.passed).toBe(false);

          // Verify that the failure message is captured and non-empty
          expect(testCase.message).toBeTruthy();
          expect(testCase.message.length).toBeGreaterThan(0);

          // Verify that the message contains meaningful information
          // (assertion messages typically contain the values being compared or the assertion type)
          expect(typeof testCase.message).toBe('string');

          // Verify error type is captured for assertion failures
          expect(testCase.errorType).toBeTruthy();
          expect(testCase.errorType).toBe('AssertionError');

          // Verify the test name is captured
          expect(testCase.name).toBe('test_assertion_failure');
        }
      ),
      { numRuns: 10 }
    );
  }, 300000); // 5 minute timeout for the entire property test
});
