import { describe, it, expect, vi } from 'vitest';
import { AutograderEngine } from './AutograderEngine.js';

describe('AutograderEngine setup error mapping', () => {
  it('maps syntax errors back to the student source line number', async () => {
    const pyodideManager = {
      isReady: () => true,
      runPython: vi.fn().mockResolvedValue({
        success: true,
        output: JSON.stringify({
          totalTests: 0,
          passedTests: 0,
          failedTests: 0,
          testCases: [],
          setupError: {
            error: 'student_code_error',
            message: 'unterminated string literal (detected at line 1)',
            type: 'SyntaxError',
            line: 1,
            traceback: 'Traceback... line 1'
          }
        })
      })
    };

    const engine = new AutograderEngine(pyodideManager, { loadTestSuite: vi.fn() });

    const result = await engine.gradeSubmission(
      'print("Hello world!)',
      'import unittest',
      'hello-world'
    );

    expect(pyodideManager.runPython).toHaveBeenCalledTimes(1);
    expect(result.totalTests).toBe(0);
    expect(result.failedTests).toBe(0);
    expect(result.syntaxError).toEqual({
      line: 1,
      message: 'unterminated string literal (detected at line 1)'
    });
    expect(result.error).toBe('SyntaxError: unterminated string literal (detected at line 1)');
  });

  it('keeps non-syntax setup errors out of syntax feedback', async () => {
    const pyodideManager = {
      isReady: () => true,
      runPython: vi.fn().mockResolvedValue({
        success: true,
        output: JSON.stringify({
          totalTests: 0,
          passedTests: 0,
          failedTests: 0,
          testCases: [],
          setupError: {
            error: 'student_code_error',
            message: 'name "missing_value" is not defined',
            type: 'NameError',
            line: 2,
            traceback: 'Traceback... line 2'
          }
        })
      })
    };

    const engine = new AutograderEngine(pyodideManager, { loadTestSuite: vi.fn() });

    const result = await engine.gradeSubmission(
      'print(missing_value)',
      'import unittest',
      'hello-world'
    );

    expect(result.syntaxError).toBeNull();
    expect(result.error).toBe('NameError: name "missing_value" is not defined');
  });

  it('prefers the innermost line number when parsing Python tracebacks', () => {
    const engine = new AutograderEngine();
    const parsed = engine._parseSyntaxError(
      'Traceback... File "<exec>", line 573 ... File "<string>", line 1 ... SyntaxError: unterminated string literal'
    );

    expect(parsed).toEqual({
      line: 1,
      message: 'Traceback... File "<exec>", line 573 ... File "<string>", line 1 ... SyntaxError: unterminated string literal'
    });
  });
});
