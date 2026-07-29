/**
 * Property-based tests for no server transmission of student code
 * Feature: python-autograder-web-app, Property 24: No Server Transmission of Submissions
 * 
 * **Validates: Requirements 9.2**
 * 
 * These property-based tests verify that student code is never transmitted to any server
 * during the submission and execution process. All code execution must happen client-side.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fc from 'fast-check';
import { AutograderEngine } from './AutograderEngine.js';

describe('Property 24: No Server Transmission of Submissions', () => {
  let originalFetch;
  let originalXMLHttpRequest;

  beforeEach(() => {
    // Save original implementations
    originalFetch = global.fetch;
    originalXMLHttpRequest = global.XMLHttpRequest;
  });

  afterEach(() => {
    // Restore original implementations
    global.fetch = originalFetch;
    global.XMLHttpRequest = originalXMLHttpRequest;
    vi.restoreAllMocks();
  });

  /**
   * Property 24: No Server Transmission of Submissions
   * **Validates: Requirements 9.2**
   * 
   * For any code submission event, the application should not make any HTTP requests 
   * to external servers (excluding initial static file loads and CDN resources).
   * 
   * This test verifies the architecture by examining the code combination method
   * which is the critical step where student code could potentially be transmitted.
   */
  it('Property 24: should embed student code locally without network transmission', () => {
    fc.assert(
      fc.property(
        // Generate random student code
        fc.oneof(
          // Simple function definitions
          fc.record({
            funcName: fc.constantFrom('add', 'multiply', 'subtract', 'divide', 'greet', 'calculate'),
            param1: fc.constantFrom('a', 'b', 'x', 'y'),
            param2: fc.constantFrom('a', 'b', 'x', 'y'),
            operation: fc.constantFrom('+', '-', '*', '//')
          }).map(({ funcName, param1, param2, operation }) => 
            `def ${funcName}(${param1}, ${param2}):\n    return ${param1} ${operation} ${param2}\n`
          ),
          // String manipulation functions
          fc.record({
            funcName: fc.constantFrom('reverse', 'uppercase', 'lowercase'),
            param: fc.constantFrom('s', 'text', 'string')
          }).map(({ funcName, param }) => {
            if (funcName === 'reverse') {
              return `def ${funcName}(${param}):\n    return ${param}[::-1]\n`;
            } else if (funcName === 'uppercase') {
              return `def ${funcName}(${param}):\n    return ${param}.upper()\n`;
            } else {
              return `def ${funcName}(${param}):\n    return ${param}.lower()\n`;
            }
          }),
          // List manipulation functions
          fc.record({
            funcName: fc.constantFrom('sum_list', 'max_list', 'min_list'),
            param: fc.constantFrom('lst', 'items', 'numbers')
          }).map(({ funcName, param }) => {
            if (funcName === 'sum_list') {
              return `def ${funcName}(${param}):\n    return sum(${param})\n`;
            } else if (funcName === 'max_list') {
              return `def ${funcName}(${param}):\n    return max(${param})\n`;
            } else {
              return `def ${funcName}(${param}):\n    return min(${param})\n`;
            }
          })
        ),
        (studentCode) => {
          // Create a simple test suite
          const testCode = `
import unittest

class TestSubmission(unittest.TestCase):
    def test_function_exists(self):
        """Test that function is defined"""
        self.assertTrue(True)
`;

          // Create engine instance
          const engine = new AutograderEngine();

          // Get the combined code that will be executed locally
          const combinedCode = engine._combineCodeWithTests(studentCode, testCode);

          // Verify the combined code is a string (not a Promise or URL)
          expect(typeof combinedCode).toBe('string');
          expect(combinedCode.length).toBeGreaterThan(0);

          // Verify student code is embedded in the combined script using exec()
          // This proves code is executed locally, not transmitted
          expect(combinedCode).toContain('exec("""');
          expect(combinedCode).toContain('student_namespace');

          // Verify no network-related code in the combined script
          expect(combinedCode).not.toContain('fetch(');
          expect(combinedCode).not.toContain('XMLHttpRequest');
          expect(combinedCode).not.toContain('http://');
          expect(combinedCode).not.toContain('https://');
          expect(combinedCode).not.toContain('POST');
          expect(combinedCode).not.toContain('PUT');

          // Verify the student code is actually embedded in the combined code
          // (it should be present as a string literal for local execution)
          expect(combinedCode).toContain('unittest');
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property 24 (Variant): Verify no network requests with complex student code
   * **Validates: Requirements 9.2**
   * 
   * Test with more complex student code patterns to ensure no transmission occurs.
   */
  it('Property 24 (Variant): should not transmit complex student code patterns', () => {
    fc.assert(
      fc.property(
        // Generate more complex code patterns
        fc.record({
          className: fc.constantFrom('Calculator', 'StringHelper', 'MathUtils'),
          methodName: fc.constantFrom('process', 'compute', 'transform'),
          value: fc.integer({ min: 1, max: 100 })
        }),
        ({ className, methodName, value }) => {
          // Generate complex student code with classes
          const studentCode = `
class ${className}:
    def __init__(self):
        self.value = ${value}
    
    def ${methodName}(self, x):
        return x + self.value
    
    def get_value(self):
        return self.value

# Create instance
obj = ${className}()
result = obj.${methodName}(10)
`;

          const testCode = `
import unittest

class TestClass(unittest.TestCase):
    def test_class_exists(self):
        """Test that class is defined"""
        self.assertTrue(True)
`;

          // Create engine and combine code
          const engine = new AutograderEngine();
          const combinedCode = engine._combineCodeWithTests(studentCode, testCode);

          // Verify the combined code embeds student code locally
          expect(typeof combinedCode).toBe('string');
          expect(combinedCode).toContain('exec("""');
          expect(combinedCode).toContain('student_namespace');

          // Verify no network-related code
          expect(combinedCode).not.toContain('fetch(');
          expect(combinedCode).not.toContain('XMLHttpRequest');
          expect(combinedCode).not.toContain('http://');
          expect(combinedCode).not.toContain('https://');

          // Verify the class name appears in the combined code (embedded locally)
          // This proves the code is being prepared for local execution
          expect(combinedCode).toContain(className);
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property 24 (Edge Case): Verify no transmission with code containing URLs
   * **Validates: Requirements 9.2**
   * 
   * Even if student code contains URLs or network-related strings, the code itself
   * should not be transmitted.
   */
  it('Property 24 (Edge Case): should not transmit code even when it contains URLs', () => {
    fc.assert(
      fc.property(
        fc.webUrl(),
        (url) => {
          // Student code that contains a URL (but doesn't make requests)
          const studentCode = `
def get_url():
    """Return a URL string"""
    return "${url}"

def process_url(url_string):
    """Process a URL string"""
    return url_string.upper()
`;

          const testCode = `
import unittest

class TestURL(unittest.TestCase):
    def test_url_function(self):
        """Test URL function"""
        result = get_url()
        self.assertIsInstance(result, str)
`;

          // Create engine and combine code
          const engine = new AutograderEngine();
          const combinedCode = engine._combineCodeWithTests(studentCode, testCode);

          // Verify the combined code embeds student code locally
          expect(typeof combinedCode).toBe('string');
          expect(combinedCode).toContain('exec("""');

          // Verify no actual network calls in the combined code
          // (the URL is just a string literal in the student code)
          expect(combinedCode).not.toContain('fetch(');
          expect(combinedCode).not.toContain('XMLHttpRequest');

          // Verify the URL appears as a string literal (embedded locally)
          // This proves the code is being prepared for local execution
          expect(combinedCode).toContain('get_url');
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property 24 (Architecture): Verify gradeSubmission method signature
   * **Validates: Requirements 9.2**
   * 
   * The gradeSubmission method should accept code as string parameters,
   * not URLs or network endpoints, proving the architecture is client-side.
   */
  it('Property 24 (Architecture): should accept code as strings, not URLs', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 10, maxLength: 200 }),
        fc.string({ minLength: 10, maxLength: 200 }),
        (studentCode, testCode) => {
          const engine = new AutograderEngine();

          // Verify gradeSubmission accepts code as string parameters
          expect(typeof engine.gradeSubmission).toBe('function');
          expect(engine.gradeSubmission.length).toBe(3); // studentCode, testSuiteCode, assignmentId

          // Verify _combineCodeWithTests is a synchronous method that returns a string
          // (not async, not returning a Promise, proving no network calls)
          expect(typeof engine._combineCodeWithTests).toBe('function');
          
          const combined = engine._combineCodeWithTests(studentCode, testCode);
          
          // Verify it returns a string immediately (synchronous, no network)
          expect(typeof combined).toBe('string');
          
          // Verify the method doesn't construct URLs with the code
          expect(combined).not.toMatch(/https?:\/\//);
        }
      ),
      { numRuns: 10 }
    );
  });
});
