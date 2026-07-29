/**
 * Unit tests for AutograderEngine
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AutograderEngine } from './AutograderEngine.js';
import { PyodideManager } from './PyodideManager.js';
import { TestSuiteLoader } from './TestSuiteLoader.js';

describe('AutograderEngine', () => {
  let engine;
  let pyodideManager;
  let testSuiteLoader;

  beforeEach(async () => {
    pyodideManager = new PyodideManager();
    await pyodideManager.initialize();
    testSuiteLoader = new TestSuiteLoader();
    engine = new AutograderEngine(pyodideManager, testSuiteLoader);
  }, 30000);

  describe('gradeSubmission', () => {
    it('should throw error if PyodideManager is not initialized', async () => {
      const uninitializedManager = new PyodideManager();
      const uninitializedEngine = new AutograderEngine(uninitializedManager, testSuiteLoader);

      const studentCode = 'def greet():\n    return "Hello"';
      const testCode = 'import unittest\nclass Test(unittest.TestCase):\n    pass';

      await expect(
        uninitializedEngine.gradeSubmission(studentCode, testCode, 'test-1')
      ).rejects.toThrow('not initialized');
    });

    it('should throw error for empty student code', async () => {
      const testCode = 'import unittest\nclass Test(unittest.TestCase):\n    pass';

      await expect(
        engine.gradeSubmission('', testCode, 'test-1')
      ).rejects.toThrow('Student code cannot be empty');

      await expect(
        engine.gradeSubmission('   ', testCode, 'test-1')
      ).rejects.toThrow('Student code cannot be empty');
    });

    it('should throw error for empty test suite code', async () => {
      const studentCode = 'def greet():\n    return "Hello"';

      await expect(
        engine.gradeSubmission(studentCode, '', 'test-1')
      ).rejects.toThrow('Test suite code cannot be empty');

      await expect(
        engine.gradeSubmission(studentCode, '   ', 'test-1')
      ).rejects.toThrow('Test suite code cannot be empty');
    });

    it('should execute successful test and return passing result', async () => {
      const studentCode = `
def greet():
    return "Hello, World!"
`;

      const testCode = `
import unittest

class TestGreet(unittest.TestCase):
    def test_greet_returns_hello_world(self):
        """Test that greet() returns 'Hello, World!'"""
        result = greet()
        self.assertEqual(result, "Hello, World!")
`;

      const result = await engine.gradeSubmission(studentCode, testCode, 'test-1');

      expect(result.totalTests).toBe(1);
      expect(result.passedTests).toBe(1);
      expect(result.failedTests).toBe(0);
      expect(result.timedOut).toBe(false);
      expect(result.testCases).toHaveLength(1);
      expect(result.testCases[0].passed).toBe(true);
      expect(result.testCases[0].name).toBe('test_greet_returns_hello_world');
    });

    it('should support tests that validate script output without requiring a function', async () => {
      const studentCode = 'print("Hello World!")';

      const testCode = `
import unittest

class TestOutput(unittest.TestCase):
    def test_program_prints_hello_world(self):
        """Program prints Hello World!"""
        result = run_student_code()
        self.assertIsNone(result["error"])
        self.assertEqual(result["stdout"].strip(), "Hello World!")
`;

      const result = await engine.gradeSubmission(studentCode, testCode, 'hello-world');

      expect(result.totalTests).toBe(1);
      expect(result.passedTests).toBe(1);
      expect(result.failedTests).toBe(0);
      expect(result.testCases[0].displayName).toBe('Program prints Hello World!');
    });
    it('should support interactive script tests that patch input before run_student_code', async () => {
      const studentCode = `
temperature = input("What is the temperature today? ")
weather = input("What is the weather like? ")

if temperature == "cold" and weather == "snowy":
    print("Wear a warm coat, gloves, and a hat.")
else:
    print("Please try again. You have provided an invalid option.")
`;

      const testCode = `
import unittest
from unittest.mock import patch

class TestInteractiveOutput(unittest.TestCase):
    def test_cold_snowy(self):
        with patch('builtins.input', side_effect=['cold', 'snowy']):
            result = run_student_code()

        self.assertIsNone(result["error"])
        self.assertIn("Wear a warm coat, gloves, and a hat.", result["stdout"])
`;

      const result = await engine.gradeSubmission(studentCode, testCode, 'flow-control');

      expect(result.totalTests).toBe(1);
      expect(result.passedTests).toBe(1);
      expect(result.failedTests).toBe(0);
      expect(result.timedOut).toBe(false);
    });


    it('should run script-style submissions as __main__ for output checks', async () => {
      const studentCode = `
def main():
    print("Hello World!")

if __name__ == "__main__":
    main()
`;

      const testCode = `
import unittest

class TestOutput(unittest.TestCase):
    def test_program_prints_hello_world(self):
        result = run_student_code()
        self.assertEqual(result["stdout"].strip(), "Hello World!")
`;

      const result = await engine.gradeSubmission(studentCode, testCode, 'hello-world');

      expect(result.totalTests).toBe(1);
      expect(result.passedTests).toBe(1);
      expect(result.failedTests).toBe(0);
    });

    it('should execute failing test and return failure result', async () => {
      const studentCode = `
def greet():
    return "Goodbye"
`;

      const testCode = `
import unittest

class TestGreet(unittest.TestCase):
    def test_greet_returns_hello_world(self):
        """Test that greet() returns 'Hello, World!'"""
        result = greet()
        self.assertEqual(result, "Hello, World!")
`;

      const result = await engine.gradeSubmission(studentCode, testCode, 'test-1');

      expect(result.totalTests).toBe(1);
      expect(result.passedTests).toBe(0);
      expect(result.failedTests).toBe(1);
      expect(result.timedOut).toBe(false);
      expect(result.testCases).toHaveLength(1);
      expect(result.testCases[0].passed).toBe(false);
      expect(result.testCases[0].message).toBeTruthy();
      expect(result.testCases[0].errorType).toBe('AssertionError');
    });

    it('should execute multiple tests and return mixed results', async () => {
      const studentCode = `
def add(a, b):
    return a + b

def subtract(a, b):
    return a - b - 1  # Intentional bug
`;

      const testCode = `
import unittest

class TestMath(unittest.TestCase):
    def test_add(self):
        """Test addition"""
        self.assertEqual(add(2, 3), 5)
    
    def test_subtract(self):
        """Test subtraction"""
        self.assertEqual(subtract(5, 3), 2)
`;

      const result = await engine.gradeSubmission(studentCode, testCode, 'test-1');

      expect(result.totalTests).toBe(2);
      expect(result.passedTests).toBe(1);
      expect(result.failedTests).toBe(1);
      expect(result.testCases).toHaveLength(2);
      
      const addTest = result.testCases.find(tc => tc.name === 'test_add');
      const subtractTest = result.testCases.find(tc => tc.name === 'test_subtract');
      
      expect(addTest.passed).toBe(true);
      expect(subtractTest.passed).toBe(false);
    });

    it('should handle syntax errors in student code', async () => {
      const studentCode = `
def greet()
    return "Hello"  # Missing colon
`;

      const testCode = `
import unittest

class TestGreet(unittest.TestCase):
    def test_greet(self):
        self.assertEqual(greet(), "Hello")
`;

      const result = await engine.gradeSubmission(studentCode, testCode, 'test-1');

      expect(result.totalTests).toBe(0);
      expect(result.passedTests).toBe(0);
      expect(result.failedTests).toBe(0);
      expect(result.error).toBeTruthy();
      expect(result.syntaxError).toBeTruthy();
    });

    it('should handle runtime errors in student code', async () => {
      const studentCode = `
def greet():
    return undefined_variable
`;

      const testCode = `
import unittest

class TestGreet(unittest.TestCase):
    def test_greet(self):
        result = greet()
        self.assertEqual(result, "Hello")
`;

      const result = await engine.gradeSubmission(studentCode, testCode, 'test-1');

      expect(result.totalTests).toBe(1);
      expect(result.failedTests).toBe(1);
      expect(result.testCases).toHaveLength(1);
      expect(result.testCases[0].passed).toBe(false);
      expect(result.testCases[0].errorType).toBeTruthy();
    });

    it('should handle timeout for long-running code', async () => {
      const studentCode = `
import time
def greet():
    time.sleep(2)
    return "Hello"
`;

      const testCode = `
import unittest

class TestGreet(unittest.TestCase):
    def test_greet(self):
        result = greet()
        self.assertEqual(result, "Hello")
`;

      const result = await engine.gradeSubmission(studentCode, testCode, 'test-1');

      expect(result.timedOut).toBe(true);
      expect(result.totalTests).toBe(0);
      expect(result.error).toContain('timed out');
    }, 15000);

    it('should isolate test execution (one failure does not stop others)', async () => {
      const studentCode = `
def func1():
    return "correct"

def func2():
    raise ValueError("Error in func2")

def func3():
    return "also correct"
`;

      const testCode = `
import unittest

class TestFunctions(unittest.TestCase):
    def test_func1(self):
        """Test func1"""
        self.assertEqual(func1(), "correct")
    
    def test_func2(self):
        """Test func2"""
        result = func2()
        self.assertEqual(result, "should work")
    
    def test_func3(self):
        """Test func3"""
        self.assertEqual(func3(), "also correct")
`;

      const result = await engine.gradeSubmission(studentCode, testCode, 'test-1');

      expect(result.totalTests).toBe(3);
      expect(result.passedTests).toBe(2);
      expect(result.failedTests).toBe(1);
      
      // Verify all three tests were executed
      expect(result.testCases).toHaveLength(3);
      
      const func1Test = result.testCases.find(tc => tc.name === 'test_func1');
      const func2Test = result.testCases.find(tc => tc.name === 'test_func2');
      const func3Test = result.testCases.find(tc => tc.name === 'test_func3');
      
      expect(func1Test.passed).toBe(true);
      expect(func2Test.passed).toBe(false);
      expect(func3Test.passed).toBe(true);
    });

    it('should capture assertion messages from failed tests', async () => {
      const studentCode = `
def calculate():
    return 42
`;

      const testCode = `
import unittest

class TestCalculate(unittest.TestCase):
    def test_calculate(self):
        """Test calculation"""
        result = calculate()
        self.assertEqual(result, 100, "Expected 100 but got different value")
`;

      const result = await engine.gradeSubmission(studentCode, testCode, 'test-1');

      expect(result.testCases).toHaveLength(1);
      expect(result.testCases[0].passed).toBe(false);
      expect(result.testCases[0].message).toBeTruthy();
      expect(result.testCases[0].message).toContain('42');
    });

    it('should include test docstrings as display names', async () => {
      const studentCode = `
def greet():
    return "Hello"
`;

      const testCode = `
import unittest

class TestGreet(unittest.TestCase):
    def test_greet_returns_string(self):
        """Verify that greet returns a string value"""
        result = greet()
        self.assertIsInstance(result, str)
`;

      const result = await engine.gradeSubmission(studentCode, testCode, 'test-1');

      expect(result.testCases).toHaveLength(1);
      expect(result.testCases[0].displayName).toBe('Verify that greet returns a string value');
    });

    it('should handle code with special characters and quotes', async () => {
      const studentCode = `
def get_message():
    return 'He said "Hello" to me'
`;

      const testCode = `
import unittest

class TestMessage(unittest.TestCase):
    def test_message(self):
        """Test message with quotes"""
        result = get_message()
        self.assertEqual(result, 'He said "Hello" to me')
`;

      const result = await engine.gradeSubmission(studentCode, testCode, 'test-1');

      expect(result.totalTests).toBe(1);
      expect(result.passedTests).toBe(1);
      expect(result.testCases[0].passed).toBe(true);
    });
  });

  describe('loadTestSuite', () => {
    it('should load test suite from file path', async () => {
      const mockTestCode = 'import unittest\nclass Test(unittest.TestCase):\n    pass';
      
      vi.spyOn(testSuiteLoader, 'loadTestSuite').mockResolvedValue(mockTestCode);

      const result = await engine.loadTestSuite('tests/test_example.py');

      expect(result).toBe(mockTestCode);
      expect(testSuiteLoader.loadTestSuite).toHaveBeenCalledWith('tests/test_example.py');
    });
  });

  describe('_parseSyntaxError', () => {
    it('should parse syntax error with line number', () => {
      const errorMessage = 'SyntaxError: invalid syntax at line 5';
      const result = engine._parseSyntaxError(errorMessage);

      expect(result).toBeTruthy();
      expect(result.line).toBe(5);
      expect(result.message).toBe(errorMessage);
    });

    it('should parse syntax error without line number', () => {
      const errorMessage = 'SyntaxError: invalid syntax';
      const result = engine._parseSyntaxError(errorMessage);

      expect(result).toBeTruthy();
      expect(result.line).toBeNull();
      expect(result.message).toBe(errorMessage);
    });

    it('should return null for non-syntax errors', () => {
      const errorMessage = 'NameError: name "x" is not defined';
      const result = engine._parseSyntaxError(errorMessage);

      expect(result).toBeNull();
    });

    it('should return null for empty error message', () => {
      const result = engine._parseSyntaxError('');

      expect(result).toBeNull();
    });
  });
});

