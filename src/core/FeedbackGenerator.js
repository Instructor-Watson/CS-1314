/**
 * FeedbackGenerator - Transforms technical test results into beginner-friendly feedback
 * 
 * This class takes test results and errors from the AutograderEngine and creates
 * helpful, beginner-friendly feedback messages for students.
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */

export class FeedbackGenerator {
  constructor() {
    // Error type mappings from technical Python errors to beginner-friendly messages
    this.errorMappings = {
      'NameError': {
        title: 'Variable Not Found',
        template: 'You\'re trying to use a variable or function that hasn\'t been created yet.'
      },
      'TypeError': {
        title: 'Type Mismatch',
        template: 'You\'re trying to combine or use values in a way that doesn\'t work together (like adding a number to text).'
      },
      'SyntaxError': {
        title: 'Syntax Problem',
        template: 'There\'s a problem with how your code is written. Python can\'t understand it.'
      },
      'IndentationError': {
        title: 'Indentation Problem',
        template: 'Your code isn\'t indented correctly. Python needs consistent spacing at the start of lines.'
      },
      'AttributeError': {
        title: 'Attribute Not Found',
        template: 'You\'re trying to access something that doesn\'t exist on this object.'
      },
      'IndexError': {
        title: 'List Index Error',
        template: 'You\'re trying to access an item in a list that doesn\'t exist. Check that your index is within the list size.'
      },
      'KeyError': {
        title: 'Dictionary Key Error',
        template: 'You\'re trying to access a key in a dictionary that doesn\'t exist.'
      },
      'ValueError': {
        title: 'Invalid Value',
        template: 'The value you\'re using isn\'t valid for this operation.'
      },
      'ZeroDivisionError': {
        title: 'Division by Zero',
        template: 'You\'re trying to divide by zero, which isn\'t allowed in math.'
      },
      'AssertionError': {
        title: 'Test Failed',
        template: 'Your code produced a different result than expected.'
      }
    };
  }

  /**
   * Generate beginner-friendly feedback for a test result
   * @param {TestCaseResult} testResult - The test case result from AutograderEngine
   * @returns {FeedbackMessage}
   */
  generateFeedback(testResult) {
    if (!testResult) {
      return {
        title: 'Unknown Error',
        description: 'Unable to generate feedback for this test.',
        hint: null,
        codeSnippet: null
      };
    }

    // If test passed, return success feedback
    if (testResult.passed) {
      return {
        title: 'Test Passed',
        description: `Great job! ${testResult.displayName || testResult.name} passed successfully.`,
        hint: null,
        codeSnippet: null
      };
    }

    // Generate feedback for failed test
    const errorType = testResult.errorType || 'AssertionError';
    const errorMapping = this.errorMappings[errorType] || {
      title: 'Error',
      template: 'Something went wrong with your code.'
    };

    let description = errorMapping.template;

    // Add expected vs actual output if available
    if (testResult.expectedOutput !== null || testResult.actualOutput !== null) {
      description += '\n\n';
      if (testResult.expectedOutput !== null) {
        description += `Expected: ${testResult.expectedOutput}\n`;
      }
      if (testResult.actualOutput !== null) {
        description += `Your code produced: ${testResult.actualOutput}`;
      }
    }

    // Add the original error message if it provides useful context
    if (testResult.message && testResult.message.trim() !== '') {
      description += `\n\nDetails: ${this.simplifyError({ 
        type: errorType, 
        message: testResult.message 
      })}`;
    }

    // Generate a contextual hint
    const hint = this.generateHint(testResult);

    return {
      title: errorMapping.title,
      description,
      hint,
      codeSnippet: null
    };
  }

  /**
   * Simplify a technical Python error into beginner-friendly language
   * @param {PythonError} error - The Python error object
   * @returns {string} Simplified error message
   */
  simplifyError(error) {
    if (!error || !error.message) {
      return 'An unknown error occurred.';
    }

    const errorType = error.type || 'Error';
    const message = error.message;

    // Get the error mapping
    const mapping = this.errorMappings[errorType];
    
    if (!mapping) {
      // For unknown error types, try to simplify the message
      return this._simplifyErrorMessage(message);
    }

    // Extract useful information from the error message
    let simplifiedMessage = mapping.template;

    // Add line number if available
    if (error.lineNumber !== null && error.lineNumber !== undefined) {
      simplifiedMessage += ` (Line ${error.lineNumber})`;
    }

    // For specific error types, extract additional context
    if (errorType === 'NameError') {
      const nameMatch = message.match(/name '(\w+)' is not defined/);
      if (nameMatch) {
        simplifiedMessage = `You're trying to use '${nameMatch[1]}', but it hasn't been created yet.`;
      }
    } else if (errorType === 'TypeError') {
      // Try to extract what types were involved
      const typeMatch = message.match(/unsupported operand type\(s\) for (.+): '(.+)' and '(.+)'/);
      if (typeMatch) {
        simplifiedMessage = `You can't use ${typeMatch[1]} with ${typeMatch[2]} and ${typeMatch[3]}.`;
      }
    } else if (errorType === 'AttributeError') {
      const attrMatch = message.match(/'(\w+)' object has no attribute '(\w+)'/);
      if (attrMatch) {
        simplifiedMessage = `The ${attrMatch[1]} doesn't have a '${attrMatch[2]}' attribute.`;
      }
    }

    return simplifiedMessage;
  }

  /**
   * Generate a contextual hint based on the test case
   * @param {TestCaseResult} testCase - The test case result
   * @returns {string|null} A helpful hint or null if no hint available
   */
  generateHint(testCase) {
    if (!testCase) {
      return null;
    }

    const errorType = testCase.errorType;
    const testName = testCase.name || '';
    const message = testCase.message || '';

    // Generate hints based on error type
    if (errorType === 'NameError') {
      return 'Make sure you\'ve defined all variables and functions before using them. Check for typos in names.';
    }

    if (errorType === 'IndentationError') {
      return 'Python uses indentation to group code. Make sure all lines in a block have the same indentation (usually 4 spaces).';
    }

    if (errorType === 'SyntaxError') {
      if (message.includes('invalid syntax')) {
        return 'Check for missing colons (:) at the end of if, for, while, or def statements. Also check for matching parentheses and quotes.';
      }
      return 'Review your code for typos, missing punctuation, or incorrect Python syntax.';
    }

    if (errorType === 'TypeError') {
      return 'Check that you\'re using the right types of values. For example, you can\'t add a number to a string without converting one of them first.';
    }

    if (errorType === 'IndexError') {
      return 'Remember that list indices start at 0. If a list has 5 items, valid indices are 0, 1, 2, 3, 4.';
    }

    if (errorType === 'AssertionError' || !errorType) {
      // Generate hints based on test name patterns
      if (testName.includes('return')) {
        return 'Make sure your function returns a value using the return statement.';
      }
      if (testName.includes('type')) {
        return 'Check that your function returns the correct type of value (string, number, list, etc.).';
      }
      if (testName.includes('empty')) {
        return 'Consider what your function should do when given empty input.';
      }
      if (testName.includes('case') || testName.includes('upper') || testName.includes('lower')) {
        return 'Pay attention to uppercase and lowercase letters - they matter in Python!';
      }
      
      return 'Read the test description carefully and compare what your code does to what\'s expected.';
    }

    return null;
  }

  /**
   * Generate feedback for a syntax error
   * @param {Object} syntaxError - Syntax error object with line and message
   * @returns {FeedbackMessage}
   */
  generateSyntaxErrorFeedback(syntaxError) {
    if (!syntaxError) {
      return {
        title: 'Syntax Error',
        description: 'There\'s a syntax error in your code.',
        hint: 'Check your code for typos and missing punctuation.',
        codeSnippet: null
      };
    }

    let description = 'There\'s a problem with how your code is written. Python can\'t understand it.';
    
    if (syntaxError.line !== null && syntaxError.line !== undefined) {
      description += `\n\nThe error is on or near line ${syntaxError.line}.`;
    }

    if (syntaxError.message) {
      const simplified = this.simplifyError({
        type: 'SyntaxError',
        message: syntaxError.message,
        lineNumber: syntaxError.line
      });
      description += `\n\n${simplified}`;
    }

    return {
      title: 'Syntax Error',
      description,
      hint: 'Check for missing colons (:), unmatched parentheses or quotes, and proper indentation.',
      codeSnippet: null
    };
  }

  /**
   * Generate feedback for a timeout error
   * @returns {FeedbackMessage}
   */
  generateTimeoutFeedback() {
    return {
      title: 'Code Took Too Long',
      description: 'Your code took more than 10 seconds to run. This usually means there\'s an infinite loop or your code is doing too much work.',
      hint: 'Check for loops that might never end. Make sure loop conditions will eventually become false.',
      codeSnippet: null
    };
  }

  /**
   * Generate feedback for a general runtime error
   * @param {string} errorMessage - The error message
   * @returns {FeedbackMessage}
   */
  generateRuntimeErrorFeedback(errorMessage) {
    const errorType = this._extractErrorType(errorMessage);
    const lineNumber = this._extractLineNumber(errorMessage);

    const simplified = this.simplifyError({
      type: errorType,
      message: errorMessage,
      lineNumber
    });

    let description = simplified;
    if (lineNumber !== null) {
      description = `Error on line ${lineNumber}: ${simplified}`;
    }

    const mapping = this.errorMappings[errorType] || { title: 'Runtime Error' };

    return {
      title: mapping.title,
      description,
      hint: this.generateHint({ errorType, message: errorMessage }),
      codeSnippet: null
    };
  }

  /**
   * Simplify a raw error message
   * @private
   */
  _simplifyErrorMessage(message) {
    // Remove Python traceback noise
    const lines = message.split('\n');
    const lastLine = lines[lines.length - 1];
    
    // If the last line looks like an error message, use it
    if (lastLine && lastLine.includes(':')) {
      return lastLine.split(':').slice(1).join(':').trim();
    }

    return message;
  }

  /**
   * Extract error type from error message
   * @private
   */
  _extractErrorType(errorMessage) {
    if (!errorMessage) {
      return 'Error';
    }

    // Look for common Python error types
    for (const errorType of Object.keys(this.errorMappings)) {
      if (errorMessage.includes(errorType)) {
        return errorType;
      }
    }

    return 'Error';
  }

  /**
   * Extract line number from error message
   * @private
   */
  _extractLineNumber(errorMessage) {
    if (!errorMessage) {
      return null;
    }

    const lineMatch = errorMessage.match(/line (\d+)/i);
    if (lineMatch) {
      return parseInt(lineMatch[1], 10);
    }

    return null;
  }
}

/**
 * @typedef {Object} FeedbackMessage
 * @property {string} title - Brief, student-friendly title
 * @property {string} description - Detailed explanation in beginner-friendly language
 * @property {string|null} hint - Contextual hint to help fix the issue
 * @property {string|null} codeSnippet - Optional code snippet showing the issue
 */

/**
 * @typedef {Object} PythonError
 * @property {string} type - Error type (e.g., 'NameError', 'TypeError')
 * @property {string} message - Error message
 * @property {number|null} lineNumber - Line number where error occurred
 * @property {string} [traceback] - Full Python traceback
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
