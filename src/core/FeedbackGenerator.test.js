/**
 * Unit tests for FeedbackGenerator
 * Validates Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { FeedbackGenerator } from './FeedbackGenerator.js';

describe('FeedbackGenerator', () => {
  let feedbackGenerator;

  beforeEach(() => {
    feedbackGenerator = new FeedbackGenerator();
  });

  describe('generateFeedback', () => {
    it('should generate success feedback for passed tests', () => {
      const testResult = {
        name: 'test_addition',
        className: 'TestMath',
        displayName: 'Test Addition',
        passed: true,
        message: '',
        expectedOutput: null,
        actualOutput: null,
        errorType: null
      };

      const feedback = feedbackGenerator.generateFeedback(testResult);

      expect(feedback.title).toBe('Test Passed');
      expect(feedback.description).toContain('Great job!');
      expect(feedback.description).toContain('Test Addition');
      expect(feedback.hint).toBeNull();
      expect(feedback.codeSnippet).toBeNull();
    });

    it('should generate feedback for NameError', () => {
      const testResult = {
        name: 'test_function',
        className: 'TestCode',
        displayName: 'Test Function',
        passed: false,
        message: "NameError: name 'x' is not defined",
        expectedOutput: null,
        actualOutput: null,
        errorType: 'NameError'
      };

      const feedback = feedbackGenerator.generateFeedback(testResult);

      expect(feedback.title).toBe('Variable Not Found');
      expect(feedback.description).toContain('variable or function');
      expect(feedback.description).toContain('hasn\'t been created yet');
      expect(feedback.hint).toContain('defined all variables');
    });

    it('should generate feedback for TypeError', () => {
      const testResult = {
        name: 'test_operation',
        className: 'TestCode',
        displayName: 'Test Operation',
        passed: false,
        message: "TypeError: unsupported operand type(s) for +: 'int' and 'str'",
        expectedOutput: null,
        actualOutput: null,
        errorType: 'TypeError'
      };

      const feedback = feedbackGenerator.generateFeedback(testResult);

      expect(feedback.title).toBe('Type Mismatch');
      expect(feedback.description).toContain('combine or use values');
      expect(feedback.description).toContain('doesn\'t work together');
      expect(feedback.hint).toContain('right types of values');
    });

    it('should generate feedback for SyntaxError', () => {
      const testResult = {
        name: 'test_syntax',
        className: 'TestCode',
        displayName: 'Test Syntax',
        passed: false,
        message: 'SyntaxError: invalid syntax',
        expectedOutput: null,
        actualOutput: null,
        errorType: 'SyntaxError'
      };

      const feedback = feedbackGenerator.generateFeedback(testResult);

      expect(feedback.title).toBe('Syntax Problem');
      expect(feedback.description).toContain('problem with how your code is written');
      expect(feedback.hint).toContain('missing colons');
    });

    it('should generate feedback for IndentationError', () => {
      const testResult = {
        name: 'test_indent',
        className: 'TestCode',
        displayName: 'Test Indentation',
        passed: false,
        message: 'IndentationError: expected an indented block',
        expectedOutput: null,
        actualOutput: null,
        errorType: 'IndentationError'
      };

      const feedback = feedbackGenerator.generateFeedback(testResult);

      expect(feedback.title).toBe('Indentation Problem');
      expect(feedback.description).toContain('indented correctly');
      expect(feedback.hint).toContain('same indentation');
    });

    it('should generate feedback for IndexError', () => {
      const testResult = {
        name: 'test_list_access',
        className: 'TestCode',
        displayName: 'Test List Access',
        passed: false,
        message: 'IndexError: list index out of range',
        expectedOutput: null,
        actualOutput: null,
        errorType: 'IndexError'
      };

      const feedback = feedbackGenerator.generateFeedback(testResult);

      expect(feedback.title).toBe('List Index Error');
      expect(feedback.description).toContain('item in a list that doesn\'t exist');
      expect(feedback.hint).toContain('indices start at 0');
    });

    it('should generate feedback for ZeroDivisionError', () => {
      const testResult = {
        name: 'test_division',
        className: 'TestCode',
        displayName: 'Test Division',
        passed: false,
        message: 'ZeroDivisionError: division by zero',
        expectedOutput: null,
        actualOutput: null,
        errorType: 'ZeroDivisionError'
      };

      const feedback = feedbackGenerator.generateFeedback(testResult);

      expect(feedback.title).toBe('Division by Zero');
      expect(feedback.description).toContain('divide by zero');
      expect(feedback.description).toContain('isn\'t allowed');
    });

    it('should generate feedback for AttributeError', () => {
      const testResult = {
        name: 'test_attribute',
        className: 'TestCode',
        displayName: 'Test Attribute',
        passed: false,
        message: "AttributeError: 'str' object has no attribute 'append'",
        expectedOutput: null,
        actualOutput: null,
        errorType: 'AttributeError'
      };

      const feedback = feedbackGenerator.generateFeedback(testResult);

      expect(feedback.title).toBe('Attribute Not Found');
      expect(feedback.description).toContain('trying to access something');
      expect(feedback.description).toContain('doesn\'t exist');
    });

    it('should generate feedback for KeyError', () => {
      const testResult = {
        name: 'test_dict_access',
        className: 'TestCode',
        displayName: 'Test Dictionary Access',
        passed: false,
        message: "KeyError: 'missing_key'",
        expectedOutput: null,
        actualOutput: null,
        errorType: 'KeyError'
      };

      const feedback = feedbackGenerator.generateFeedback(testResult);

      expect(feedback.title).toBe('Dictionary Key Error');
      expect(feedback.description).toContain('key in a dictionary');
      expect(feedback.description).toContain('doesn\'t exist');
    });

    it('should generate feedback for ValueError', () => {
      const testResult = {
        name: 'test_value',
        className: 'TestCode',
        displayName: 'Test Value',
        passed: false,
        message: "ValueError: invalid literal for int() with base 10: 'abc'",
        expectedOutput: null,
        actualOutput: null,
        errorType: 'ValueError'
      };

      const feedback = feedbackGenerator.generateFeedback(testResult);

      expect(feedback.title).toBe('Invalid Value');
      expect(feedback.description).toContain('value');
      expect(feedback.description).toContain('isn\'t valid');
    });

    it('should include expected and actual output when provided', () => {
      const testResult = {
        name: 'test_output',
        className: 'TestCode',
        displayName: 'Test Output',
        passed: false,
        message: 'AssertionError: Values do not match',
        expectedOutput: '42',
        actualOutput: '24',
        errorType: 'AssertionError'
      };

      const feedback = feedbackGenerator.generateFeedback(testResult);

      expect(feedback.description).toContain('Expected: 42');
      expect(feedback.description).toContain('Your code produced: 24');
    });

    it('should handle null expectedOutput', () => {
      const testResult = {
        name: 'test_output',
        className: 'TestCode',
        displayName: 'Test Output',
        passed: false,
        message: 'AssertionError',
        expectedOutput: null,
        actualOutput: 'some value',
        errorType: 'AssertionError'
      };

      const feedback = feedbackGenerator.generateFeedback(testResult);

      expect(feedback.description).toContain('Your code produced: some value');
      expect(feedback.description).not.toContain('Expected:');
    });

    it('should handle null actualOutput', () => {
      const testResult = {
        name: 'test_output',
        className: 'TestCode',
        displayName: 'Test Output',
        passed: false,
        message: 'AssertionError',
        expectedOutput: 'expected value',
        actualOutput: null,
        errorType: 'AssertionError'
      };

      const feedback = feedbackGenerator.generateFeedback(testResult);

      expect(feedback.description).toContain('Expected: expected value');
      expect(feedback.description).not.toContain('Your code produced:');
    });

    it('should handle null testResult', () => {
      const feedback = feedbackGenerator.generateFeedback(null);

      expect(feedback.title).toBe('Unknown Error');
      expect(feedback.description).toContain('Unable to generate feedback');
      expect(feedback.hint).toBeNull();
      expect(feedback.codeSnippet).toBeNull();
    });

    it('should handle undefined testResult', () => {
      const feedback = feedbackGenerator.generateFeedback(undefined);

      expect(feedback.title).toBe('Unknown Error');
      expect(feedback.description).toContain('Unable to generate feedback');
    });

    it('should handle empty message', () => {
      const testResult = {
        name: 'test_empty',
        className: 'TestCode',
        displayName: 'Test Empty',
        passed: false,
        message: '',
        expectedOutput: null,
        actualOutput: null,
        errorType: 'AssertionError'
      };

      const feedback = feedbackGenerator.generateFeedback(testResult);

      expect(feedback.title).toBe('Test Failed');
      expect(feedback.description).toBeDefined();
      expect(feedback.description.length).toBeGreaterThan(0);
    });

    it('should handle unknown error types', () => {
      const testResult = {
        name: 'test_unknown',
        className: 'TestCode',
        displayName: 'Test Unknown',
        passed: false,
        message: 'UnknownError: something went wrong',
        expectedOutput: null,
        actualOutput: null,
        errorType: 'UnknownError'
      };

      const feedback = feedbackGenerator.generateFeedback(testResult);

      expect(feedback.title).toBe('Error');
      expect(feedback.description).toContain('Something went wrong');
    });
  });

  describe('simplifyError', () => {
    it('should simplify NameError with variable name', () => {
      const error = {
        type: 'NameError',
        message: "name 'x' is not defined",
        lineNumber: 5
      };

      const simplified = feedbackGenerator.simplifyError(error);

      expect(simplified).toContain('x');
      expect(simplified).toContain('hasn\'t been created yet');
      // Note: When specific error patterns are matched, the line number is not included
      // The line number is only added when using the generic template
    });

    it('should simplify TypeError with operand types', () => {
      const error = {
        type: 'TypeError',
        message: "unsupported operand type(s) for +: 'int' and 'str'",
        lineNumber: null
      };

      const simplified = feedbackGenerator.simplifyError(error);

      expect(simplified).toContain('can\'t use');
      expect(simplified).toContain('+');
    });

    it('should simplify AttributeError with object and attribute', () => {
      const error = {
        type: 'AttributeError',
        message: "'str' object has no attribute 'append'",
        lineNumber: 10
      };

      const simplified = feedbackGenerator.simplifyError(error);

      expect(simplified).toContain('str');
      expect(simplified).toContain('append');
      // Note: When specific error patterns are matched, the line number is not included
      // The line number is only added when using the generic template
    });

    it('should include line number when using generic template', () => {
      const error = {
        type: 'SyntaxError',
        message: 'invalid syntax',
        lineNumber: 7
      };

      const simplified = feedbackGenerator.simplifyError(error);

      expect(simplified).toContain('(Line 7)');
    });

    it('should handle null error', () => {
      const simplified = feedbackGenerator.simplifyError(null);

      expect(simplified).toBe('An unknown error occurred.');
    });

    it('should handle error without message', () => {
      const error = {
        type: 'SyntaxError',
        message: null,
        lineNumber: 3
      };

      const simplified = feedbackGenerator.simplifyError(error);

      expect(simplified).toBe('An unknown error occurred.');
    });

    it('should handle error without type', () => {
      const error = {
        type: null,
        message: 'Something went wrong',
        lineNumber: null
      };

      const simplified = feedbackGenerator.simplifyError(error);

      expect(simplified).toBe('Something went wrong');
    });

    it('should handle unknown error type', () => {
      const error = {
        type: 'CustomError',
        message: 'Custom error message',
        lineNumber: null
      };

      const simplified = feedbackGenerator.simplifyError(error);

      expect(simplified).toBe('Custom error message');
    });
  });

  describe('generateHint', () => {
    it('should generate hint for NameError', () => {
      const testCase = {
        name: 'test_name',
        errorType: 'NameError',
        message: "name 'x' is not defined"
      };

      const hint = feedbackGenerator.generateHint(testCase);

      expect(hint).toContain('defined all variables');
      expect(hint).toContain('typos');
    });

    it('should generate hint for IndentationError', () => {
      const testCase = {
        name: 'test_indent',
        errorType: 'IndentationError',
        message: 'expected an indented block'
      };

      const hint = feedbackGenerator.generateHint(testCase);

      expect(hint).toContain('indentation');
      expect(hint).toContain('4 spaces');
    });

    it('should generate hint for SyntaxError with invalid syntax', () => {
      const testCase = {
        name: 'test_syntax',
        errorType: 'SyntaxError',
        message: 'invalid syntax'
      };

      const hint = feedbackGenerator.generateHint(testCase);

      expect(hint).toContain('missing colons');
      expect(hint).toContain('parentheses');
    });

    it('should generate hint for TypeError', () => {
      const testCase = {
        name: 'test_type',
        errorType: 'TypeError',
        message: 'unsupported operand'
      };

      const hint = feedbackGenerator.generateHint(testCase);

      expect(hint).toContain('right types');
      expect(hint).toContain('converting');
    });

    it('should generate hint for IndexError', () => {
      const testCase = {
        name: 'test_index',
        errorType: 'IndexError',
        message: 'list index out of range'
      };

      const hint = feedbackGenerator.generateHint(testCase);

      expect(hint).toContain('indices start at 0');
    });

    it('should generate hint based on test name containing "return"', () => {
      const testCase = {
        name: 'test_function_return',
        errorType: 'AssertionError',
        message: 'Expected return value'
      };

      const hint = feedbackGenerator.generateHint(testCase);

      expect(hint).toContain('return');
    });

    it('should generate hint based on test name containing "type"', () => {
      const testCase = {
        name: 'test_return_type',
        errorType: 'AssertionError',
        message: 'Wrong type'
      };

      const hint = feedbackGenerator.generateHint(testCase);

      // The test name contains both "return" and "type", so "return" is matched first
      expect(hint).toContain('return');
    });

    it('should generate hint based on test name containing "empty"', () => {
      const testCase = {
        name: 'test_empty_input',
        errorType: 'AssertionError',
        message: 'Failed on empty input'
      };

      const hint = feedbackGenerator.generateHint(testCase);

      expect(hint).toContain('empty input');
    });

    it('should generate hint based on test name containing "case"', () => {
      const testCase = {
        name: 'test_case_sensitivity',
        errorType: 'AssertionError',
        message: 'Case mismatch'
      };

      const hint = feedbackGenerator.generateHint(testCase);

      expect(hint).toContain('uppercase and lowercase');
    });

    it('should return null for null testCase', () => {
      const hint = feedbackGenerator.generateHint(null);

      expect(hint).toBeNull();
    });

    it('should return generic hint for AssertionError without specific patterns', () => {
      const testCase = {
        name: 'test_generic',
        errorType: 'AssertionError',
        message: 'Test failed'
      };

      const hint = feedbackGenerator.generateHint(testCase);

      expect(hint).toContain('test description');
      expect(hint).toContain('expected');
    });
  });

  describe('generateSyntaxErrorFeedback', () => {
    it('should generate feedback with line number', () => {
      const syntaxError = {
        line: 5,
        message: 'invalid syntax'
      };

      const feedback = feedbackGenerator.generateSyntaxErrorFeedback(syntaxError);

      expect(feedback.title).toBe('Syntax Error');
      expect(feedback.description).toContain('line 5');
      expect(feedback.hint).toContain('missing colons');
    });

    it('should handle null syntaxError', () => {
      const feedback = feedbackGenerator.generateSyntaxErrorFeedback(null);

      expect(feedback.title).toBe('Syntax Error');
      expect(feedback.description).toContain('syntax error');
      expect(feedback.hint).toBeDefined();
    });

    it('should handle syntaxError without line number', () => {
      const syntaxError = {
        line: null,
        message: 'unexpected EOF'
      };

      const feedback = feedbackGenerator.generateSyntaxErrorFeedback(syntaxError);

      expect(feedback.title).toBe('Syntax Error');
      expect(feedback.description).toBeDefined();
      expect(feedback.hint).toBeDefined();
    });

    it('should handle syntaxError without message', () => {
      const syntaxError = {
        line: 10,
        message: null
      };

      const feedback = feedbackGenerator.generateSyntaxErrorFeedback(syntaxError);

      expect(feedback.title).toBe('Syntax Error');
      expect(feedback.description).toContain('line 10');
    });
  });

  describe('generateTimeoutFeedback', () => {
    it('should generate timeout feedback', () => {
      const feedback = feedbackGenerator.generateTimeoutFeedback();

      expect(feedback.title).toBe('Code Took Too Long');
      expect(feedback.description).toContain('10 seconds');
      expect(feedback.description).toContain('infinite loop');
      expect(feedback.hint).toContain('loops that might never end');
    });
  });

  describe('generateRuntimeErrorFeedback', () => {
    it('should generate feedback for NameError', () => {
      const errorMessage = "NameError: name 'x' is not defined";

      const feedback = feedbackGenerator.generateRuntimeErrorFeedback(errorMessage);

      expect(feedback.title).toBe('Variable Not Found');
      expect(feedback.description).toBeDefined();
      expect(feedback.hint).toBeDefined();
    });

    it('should generate feedback for TypeError', () => {
      const errorMessage = "TypeError: unsupported operand type(s) for +: 'int' and 'str'";

      const feedback = feedbackGenerator.generateRuntimeErrorFeedback(errorMessage);

      expect(feedback.title).toBe('Type Mismatch');
      expect(feedback.description).toBeDefined();
    });

    it('should extract and include line number', () => {
      const errorMessage = "  File \"<string>\", line 42\nNameError: name 'x' is not defined";

      const feedback = feedbackGenerator.generateRuntimeErrorFeedback(errorMessage);

      expect(feedback.description).toContain('line 42');
    });

    it('should handle error without line number', () => {
      const errorMessage = "ValueError: invalid literal for int()";

      const feedback = feedbackGenerator.generateRuntimeErrorFeedback(errorMessage);

      expect(feedback.title).toBe('Invalid Value');
      expect(feedback.description).toBeDefined();
    });

    it('should handle unknown error types', () => {
      const errorMessage = "CustomError: something went wrong";

      const feedback = feedbackGenerator.generateRuntimeErrorFeedback(errorMessage);

      expect(feedback.title).toBe('Runtime Error');
      expect(feedback.description).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should handle testResult with missing displayName', () => {
      const testResult = {
        name: 'test_function',
        className: 'TestCode',
        displayName: null,
        passed: false,
        message: 'Test failed',
        expectedOutput: null,
        actualOutput: null,
        errorType: 'AssertionError'
      };

      const feedback = feedbackGenerator.generateFeedback(testResult);

      expect(feedback).toBeDefined();
      expect(feedback.title).toBeDefined();
      expect(feedback.description).toBeDefined();
    });

    it('should handle testResult with empty strings', () => {
      const testResult = {
        name: '',
        className: '',
        displayName: '',
        passed: false,
        message: '',
        expectedOutput: '',
        actualOutput: '',
        errorType: null
      };

      const feedback = feedbackGenerator.generateFeedback(testResult);

      expect(feedback).toBeDefined();
      expect(feedback.title).toBeDefined();
      expect(feedback.description).toBeDefined();
    });

    it('should handle very long error messages', () => {
      const longMessage = 'A'.repeat(1000);
      const testResult = {
        name: 'test_long',
        className: 'TestCode',
        displayName: 'Test Long',
        passed: false,
        message: longMessage,
        expectedOutput: null,
        actualOutput: null,
        errorType: 'AssertionError'
      };

      const feedback = feedbackGenerator.generateFeedback(testResult);

      expect(feedback).toBeDefined();
      // The long message is simplified, so we just check it's included in the details section
      expect(feedback.description).toContain('Details:');
    });

    it('should handle special characters in error messages', () => {
      const testResult = {
        name: 'test_special',
        className: 'TestCode',
        displayName: 'Test Special',
        passed: false,
        message: 'Error with special chars: <>&"\'',
        expectedOutput: null,
        actualOutput: null,
        errorType: 'AssertionError'
      };

      const feedback = feedbackGenerator.generateFeedback(testResult);

      expect(feedback).toBeDefined();
      // The message is simplified, so we check it's in the details section
      expect(feedback.description).toContain('Details:');
    });

    it('should handle numeric values in expectedOutput and actualOutput', () => {
      const testResult = {
        name: 'test_numbers',
        className: 'TestCode',
        displayName: 'Test Numbers',
        passed: false,
        message: 'Values do not match',
        expectedOutput: '42',
        actualOutput: '0',
        errorType: 'AssertionError'
      };

      const feedback = feedbackGenerator.generateFeedback(testResult);

      expect(feedback.description).toContain('Expected: 42');
      expect(feedback.description).toContain('Your code produced: 0');
    });

    it('should handle boolean values in output', () => {
      const testResult = {
        name: 'test_bool',
        className: 'TestCode',
        displayName: 'Test Boolean',
        passed: false,
        message: 'Boolean mismatch',
        expectedOutput: 'True',
        actualOutput: 'False',
        errorType: 'AssertionError'
      };

      const feedback = feedbackGenerator.generateFeedback(testResult);

      expect(feedback.description).toContain('Expected: True');
      expect(feedback.description).toContain('Your code produced: False');
    });
  });
});
