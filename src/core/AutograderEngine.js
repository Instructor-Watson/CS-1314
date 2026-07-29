/**
 * AutograderEngine - Executes student code against test suites
 * 
 * This class orchestrates the execution of student code with unittest test suites,
 * parses the results, and returns structured grade information.
 * 
 * Requirements: 3.1, 4.1, 4.2, 4.3, 4.4, 4.6
 */

import { PyodideManager } from './PyodideManager.js';
import { TestSuiteLoader } from './TestSuiteLoader.js';

export class AutograderEngine {
  constructor(pyodideManager = null, testSuiteLoader = null) {
    this.pyodideManager = pyodideManager || new PyodideManager();
    this.testSuiteLoader = testSuiteLoader || new TestSuiteLoader();
  }

  /**
   * Grade a student submission against a test suite
   * @param {string} studentCode - The student's Python code
   * @param {string} testSuiteCode - The unittest test suite code
   * @param {string} assignmentId - The assignment identifier
   * @returns {Promise<GradeResult>}
   */
  async gradeSubmission(studentCode, testSuiteCode, assignmentId) {
    if (!this.pyodideManager.isReady()) {
      throw new Error('PyodideManager is not initialized');
    }

    if (!studentCode || studentCode.trim() === '') {
      throw new Error('Student code cannot be empty');
    }

    if (!testSuiteCode || testSuiteCode.trim() === '') {
      throw new Error('Test suite code cannot be empty');
    }

    const startTime = performance.now();

    try {
      const combinedCode = this._combineCodeWithTests(studentCode, testSuiteCode);
      const executionResult = await this.pyodideManager.runPython(combinedCode);
      const executionTime = performance.now() - startTime;

      if (executionResult.timedOut) {
        return {
          totalTests: 0,
          passedTests: 0,
          failedTests: 0,
          testCases: [],
          executionTime,
          timedOut: true,
          error: executionResult.error
        };
      }

      if (!executionResult.success) {
        return {
          totalTests: 0,
          passedTests: 0,
          failedTests: 0,
          testCases: [],
          executionTime,
          timedOut: false,
          error: executionResult.error,
          syntaxError: this._parseSyntaxError(executionResult.error)
        };
      }

      const testResults = this._parseUnittestOutput(executionResult.output);

      if (testResults.setupError) {
        return this._buildSetupErrorResult(testResults.setupError, executionTime);
      }

      return {
        totalTests: testResults.totalTests,
        passedTests: testResults.passedTests,
        failedTests: testResults.failedTests,
        testCases: testResults.testCases,
        executionTime,
        timedOut: false
      };
    } catch (error) {
      const executionTime = performance.now() - startTime;
      return {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        testCases: [],
        executionTime,
        timedOut: false,
        error: error.message
      };
    }
  }

  /**
   * Load a test suite from a file path
   * @param {string} testFilePath - Path to the test suite file
   * @returns {Promise<string>}
   */
  async loadTestSuite(testFilePath) {
    return await this.testSuiteLoader.loadTestSuite(testFilePath);
  }

  /**
   * Combine student code with test suite in an isolated namespace
   * @private
   */
  _combineCodeWithTests(studentCode, testSuiteCode) {
    return `
import unittest
import json
import traceback
from io import StringIO
from contextlib import redirect_stdout, redirect_stderr

STUDENT_SOURCE = """${this._escapePythonString(studentCode)}"""

def _blocked_input(prompt=""):
    raise EOFError("Interactive input deferred until run_student_code().")

def _execute_student_code(run_as_main, allow_input=True):
    execution_namespace = {
        "__name__": "__main__" if run_as_main else "__student__"
    }
    stdout_buffer = StringIO()
    stderr_buffer = StringIO()
    original_input = __builtins__.input

    if not allow_input:
        __builtins__.input = _blocked_input

    try:
        with redirect_stdout(stdout_buffer), redirect_stderr(stderr_buffer):
            exec(STUDENT_SOURCE, execution_namespace)
    except Exception as e:
        return {
            "namespace": execution_namespace,
            "stdout": stdout_buffer.getvalue(),
            "stderr": stderr_buffer.getvalue(),
            "error": str(e),
            "errorType": type(e).__name__,
            "line": getattr(e, "lineno", None),
            "traceback": traceback.format_exc()
        }
    finally:
        __builtins__.input = original_input

    return {
        "namespace": execution_namespace,
        "stdout": stdout_buffer.getvalue(),
        "stderr": stderr_buffer.getvalue(),
        "error": None,
        "errorType": None,
        "line": None,
        "traceback": None
    }

def run_student_code(run_as_main=True):
    return _execute_student_code(run_as_main, allow_input=True)

def _is_deferred_input_error(run_result):
    if not run_result["error"]:
        return False

    error_type = run_result.get("errorType")
    message = (run_result.get("error") or "").lower()

    return error_type == "EOFError" or (
        error_type == "OSError" and "i/o error" in message
    )

initial_student_run = _execute_student_code(False, allow_input=False)
student_namespace = initial_student_run["namespace"]
student_namespace["run_student_code"] = run_student_code
student_namespace["student_source"] = STUDENT_SOURCE
student_namespace["initial_student_run"] = initial_student_run
student_namespace["initial_student_stdout"] = initial_student_run["stdout"]
student_namespace["initial_student_stderr"] = initial_student_run["stderr"]

setup_error = None
allow_initial_student_error = False

try:
    exec("""${this._escapePythonString(testSuiteCode)}""", student_namespace)
    allow_initial_student_error = bool(student_namespace.get("ALLOW_INITIAL_STUDENT_ERROR"))
except Exception as e:
    setup_error = {
        "error": "test_suite_error",
        "message": str(e),
        "type": type(e).__name__,
        "line": getattr(e, "lineno", None),
        "traceback": traceback.format_exc()
    }

if not setup_error and initial_student_run["error"] and not _is_deferred_input_error(initial_student_run) and not allow_initial_student_error:
    setup_error = {
        "error": "student_code_error",
        "message": initial_student_run["error"],
        "type": initial_student_run["errorType"],
        "line": initial_student_run["line"],
        "traceback": initial_student_run["traceback"]
    }

if setup_error:
    output = {
        "totalTests": 0,
        "passedTests": 0,
        "failedTests": 0,
        "testCases": [],
        "setupError": setup_error
    }
else:
    class DetailedTestResult(unittest.TestResult):
        def __init__(self):
            super().__init__()
            self.test_results = []
        
        def startTest(self, test):
            super().startTest(test)
            self.current_test = {
                "name": test._testMethodName,
                "className": test.__class__.__name__,
                "docstring": test._testMethodDoc or ""
            }
        
        def addSuccess(self, test):
            super().addSuccess(test)
            self.current_test["status"] = "passed"
            self.current_test["message"] = ""
            self.test_results.append(self.current_test)
        
        def addFailure(self, test, err):
            super().addFailure(test, err)
            self.current_test["status"] = "failed"
            self.current_test["message"] = self._formatError(err)
            self.current_test["errorType"] = "AssertionError"
            self.test_results.append(self.current_test)
        
        def addError(self, test, err):
            super().addError(test, err)
            self.current_test["status"] = "error"
            self.current_test["message"] = self._formatError(err)
            self.current_test["errorType"] = err[0].__name__ if err[0] else "Error"
            self.test_results.append(self.current_test)
        
        def _formatError(self, err):
            if err and len(err) >= 2:
                return str(err[1])
            return "Unknown error"

    loader = unittest.TestLoader()
    suite = unittest.TestSuite()

    for name, obj in student_namespace.items():
        if isinstance(obj, type) and issubclass(obj, unittest.TestCase) and obj != unittest.TestCase:
            tests = loader.loadTestsFromTestCase(obj)
            suite.addTests(tests)

    result = DetailedTestResult()
    suite.run(result)

    output = {
        "totalTests": result.testsRun,
        "passedTests": result.testsRun - len(result.failures) - len(result.errors),
        "failedTests": len(result.failures) + len(result.errors),
        "testCases": result.test_results
    }

print(json.dumps(output))
`;
  }

  /**
   * Escape Python string for embedding in triple-quoted string
   * @private
   */
  _escapePythonString(code) {
    return code
      .replace(/\\/g, '\\\\')
      .replace(/"""/g, '\\"\\"\\"');
  }

  /**
   * Parse unittest output to extract test results
   * @private
   */
  _parseUnittestOutput(output) {
    try {
      const lines = output.trim().split('\n');
      const jsonLine = lines[lines.length - 1];
      const results = JSON.parse(jsonLine);

      if (results.setupError) {
        return {
          totalTests: 0,
          passedTests: 0,
          failedTests: 0,
          testCases: [],
          setupError: results.setupError
        };
      }

      const testCases = results.testCases.map(tc => ({
        name: tc.name,
        className: tc.className,
        displayName: tc.docstring || tc.name,
        passed: tc.status === 'passed',
        message: tc.message || '',
        expectedOutput: null,
        actualOutput: null,
        errorType: tc.errorType || null
      }));

      return {
        totalTests: results.totalTests,
        passedTests: results.passedTests,
        failedTests: results.failedTests,
        testCases,
        setupError: null
      };
    } catch (error) {
      return {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        testCases: [],
        parseError: error.message,
        setupError: null
      };
    }
  }

  /**
   * Build a grade result for student-code or test-suite setup failures
   * @private
   */
  _buildSetupErrorResult(setupError, executionTime) {
    const line = setupError.line ?? this._extractLineNumber(setupError.traceback || setupError.message);
    const errorMessage = setupError.type
      ? `${setupError.type}: ${setupError.message}`
      : setupError.message;

    return {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      testCases: [],
      executionTime,
      timedOut: false,
      error: errorMessage,
      syntaxError: this._isSyntaxErrorType(setupError.type)
        ? {
            line,
            message: setupError.message
          }
        : null
    };
  }

  /**
   * Parse syntax error from error message
   * @private
   */
  _parseSyntaxError(errorMessage) {
    if (!errorMessage) {
      return null;
    }

    const line = this._extractLineNumber(errorMessage);

    if (line !== null) {
      return {
        line,
        message: errorMessage
      };
    }

    if (errorMessage.toLowerCase().includes('syntax')) {
      return {
        line: null,
        message: errorMessage
      };
    }

    return null;
  }

  /**
   * Extract the most specific line number from a Python error string
   * @private
   */
  _extractLineNumber(errorMessage) {
    if (!errorMessage) {
      return null;
    }

    const matches = [...errorMessage.matchAll(/line (\d+)/gi)];
    if (matches.length === 0) {
      return null;
    }

    return parseInt(matches[matches.length - 1][1], 10);
  }

  /**
   * Check whether an error type is syntax-related
   * @private
   */
  _isSyntaxErrorType(errorType) {
    return ['SyntaxError', 'IndentationError', 'TabError'].includes(errorType);
  }
}

/**
 * @typedef {Object} GradeResult
 * @property {number} totalTests - Total number of tests executed
 * @property {number} passedTests - Number of tests that passed
 * @property {number} failedTests - Number of tests that failed
 * @property {TestCaseResult[]} testCases - Detailed results for each test case
 * @property {number} executionTime - Time taken to execute in milliseconds
 * @property {boolean} timedOut - Whether execution timed out
 * @property {string} [error] - Error message if execution failed
 * @property {Object} [syntaxError] - Syntax error details if applicable
 */

/**
 * @typedef {Object} TestCaseResult
 * @property {string} name - Test method name
 * @property {string} className - Test class name
 * @property {string} displayName - Human-readable test name
 * @property {boolean} passed - Whether the test passed
 * @property {string} message - Test result message or error
 * @property {string|null} expectedOutput - Expected output (if available)
 * @property {string|null} actualOutput - Actual output (if available)
 * @property {string|null} errorType - Type of error if test failed
 */


