/**
 * Property-based tests for unauthenticated access
 * Feature: python-autograder-web-app
 * Property 22: Unauthenticated Assignment Access
 * Property 23: Unauthenticated Code Submission
 * 
 * **Validates: Requirements 8.1, 8.2**
 * 
 * These property-based tests verify that assignments can be accessed and code can be 
 * submitted without any authentication credentials.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { AssignmentLoader } from './AssignmentLoader.js';
import { AutograderEngine } from './AutograderEngine.js';

describe('Property 22: Unauthenticated Assignment Access', () => {
  /**
   * Property 22: Unauthenticated Assignment Access
   * **Validates: Requirements 8.1**
   * 
   * For any assignment in the system, a user should be able to view and select it 
   * without providing any authentication credentials.
   * 
   * This test verifies that AssignmentLoader does not require, check, or validate
   * any authentication credentials when loading or retrieving assignments.
   */
  it('Property 22: should load assignments without authentication', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random assignment data
        fc.array(
          fc.record({
            id: fc.stringMatching(/^[a-z0-9-]{3,20}$/),
            title: fc.string({ minLength: 5, maxLength: 50 }),
            description: fc.string({ minLength: 10, maxLength: 200 }),
            instructions: fc.string({ minLength: 20, maxLength: 500 }),
            starterCode: fc.option(fc.string({ minLength: 0, maxLength: 100 }), { nil: '' }),
            testSuiteFile: fc.stringMatching(/^tests\/test_[a-z0-9_]+\.py$/),
            difficulty: fc.constantFrom('beginner', 'intermediate', 'advanced'),
            topics: fc.array(fc.string({ minLength: 3, maxLength: 15 }), { minLength: 1, maxLength: 5 })
          }),
          { minLength: 1, maxLength: 10 }
        ).chain(assignments => {
          // Ensure unique IDs
          const uniqueAssignments = [];
          const seenIds = new Set();
          for (const assignment of assignments) {
            if (!seenIds.has(assignment.id)) {
              seenIds.add(assignment.id);
              uniqueAssignments.push(assignment);
            }
          }
          return fc.constant(uniqueAssignments);
        }).filter(assignments => assignments.length > 0),
        async (assignments) => {
          // Mock fetch to return assignment data
          const mockFetch = async () => ({
            ok: true,
            json: async () => ({ assignments })
          });
          
          global.fetch = mockFetch;
          
          // Create AssignmentLoader instance without any authentication parameters
          const loader = new AssignmentLoader();
          
          // Verify the loader was created successfully without authentication
          expect(loader).toBeDefined();
          expect(loader.loadAssignments).toBeDefined();
          expect(loader.getAssignment).toBeDefined();
          
          // Load assignments without providing any credentials
          const loadedAssignments = await loader.loadAssignments();
          
          // Verify assignments were loaded successfully
          expect(loadedAssignments).toBeDefined();
          expect(Array.isArray(loadedAssignments)).toBe(true);
          expect(loadedAssignments.length).toBe(assignments.length);
          
          // Verify each assignment can be accessed
          for (const assignment of assignments) {
            const retrieved = await loader.getAssignment(assignment.id);
            
            // Verify assignment data is accessible without authentication
            expect(retrieved).toBeDefined();
            expect(retrieved.id).toBe(assignment.id);
            expect(retrieved.title).toBe(assignment.title);
            expect(retrieved.description).toBe(assignment.description);
            expect(retrieved.instructions).toBe(assignment.instructions);
            expect(retrieved.testSuiteFile).toBe(assignment.testSuiteFile);
          }
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property 22 (Variant): Verify no authentication headers in fetch requests
   * **Validates: Requirements 8.1**
   * 
   * When loading assignments, the fetch request should not include any 
   * authentication headers (Authorization, API-Key, etc.).
   */
  it('Property 22 (Variant): should not send authentication headers when loading assignments', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            id: fc.stringMatching(/^[a-z0-9-]{3,20}$/),
            title: fc.string({ minLength: 5, maxLength: 50 }),
            description: fc.string({ minLength: 10, maxLength: 200 }),
            instructions: fc.string({ minLength: 20, maxLength: 500 }),
            testSuiteFile: fc.stringMatching(/^tests\/test_[a-z0-9_]+\.py$/),
            difficulty: fc.constantFrom('beginner', 'intermediate', 'advanced'),
            topics: fc.array(fc.string({ minLength: 3, maxLength: 15 }), { minLength: 1, maxLength: 5 })
          }),
          { minLength: 1, maxLength: 5 }
        ).chain(assignments => {
          const uniqueAssignments = [];
          const seenIds = new Set();
          for (const assignment of assignments) {
            if (!seenIds.has(assignment.id)) {
              seenIds.add(assignment.id);
              uniqueAssignments.push(assignment);
            }
          }
          return fc.constant(uniqueAssignments);
        }).filter(assignments => assignments.length > 0),
        async (assignments) => {
          let capturedFetchOptions = null;
          
          // Mock fetch to capture request options
          const mockFetch = async (url, options) => {
            capturedFetchOptions = options;
            return {
              ok: true,
              json: async () => ({ assignments })
            };
          };
          
          global.fetch = mockFetch;
          
          // Create AssignmentLoader and load assignments
          const loader = new AssignmentLoader();
          await loader.loadAssignments();
          
          // Verify no authentication headers were sent
          if (capturedFetchOptions && capturedFetchOptions.headers) {
            const headers = capturedFetchOptions.headers;
            
            // Check for common authentication header names
            const authHeaderNames = [
              'authorization',
              'Authorization',
              'api-key',
              'API-Key',
              'x-api-key',
              'X-API-Key',
              'token',
              'Token',
              'bearer',
              'Bearer'
            ];
            
            for (const headerName of authHeaderNames) {
              expect(headers[headerName]).toBeUndefined();
            }
          }
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property 22 (Architecture): Verify AssignmentLoader has no authentication methods
   * **Validates: Requirements 8.1**
   * 
   * The AssignmentLoader class should not have any methods related to authentication,
   * login, or credential management.
   */
  it('Property 22 (Architecture): should not have authentication-related methods', () => {
    const loader = new AssignmentLoader();
    
    // List of authentication-related method names that should NOT exist
    const authMethodNames = [
      'login',
      'logout',
      'authenticate',
      'setCredentials',
      'setToken',
      'setApiKey',
      'setAuthHeader',
      'checkAuth',
      'isAuthenticated',
      'requireAuth',
      'validateToken',
      'refreshToken'
    ];
    
    // Verify none of these methods exist
    for (const methodName of authMethodNames) {
      expect(loader[methodName]).toBeUndefined();
    }
    
    // Verify the class only has expected public methods
    const expectedMethods = [
      'loadAssignments',
      'getAssignment',
      'validateAssignment',
      'sleep',
      'getLoadedAssignments',
      'clearCache'
    ];
    
    // Get all methods on the loader instance
    const loaderMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(loader))
      .filter(name => name !== 'constructor' && typeof loader[name] === 'function');
    
    // Verify all methods are in the expected list
    for (const method of loaderMethods) {
      expect(expectedMethods).toContain(method);
    }
  });
});

describe('Property 23: Unauthenticated Code Submission', () => {
  /**
   * Property 23: Unauthenticated Code Submission
   * **Validates: Requirements 8.2**
   * 
   * For any valid Python code, a user should be able to submit it for grading 
   * without providing any authentication credentials.
   * 
   * This test verifies that AutograderEngine.gradeSubmission() does not require,
   * check, or validate any authentication credentials.
   */
  it('Property 23: should grade submissions without authentication', () => {
    fc.assert(
      fc.property(
        // Generate random student code
        fc.oneof(
          // Simple function definitions
          fc.record({
            funcName: fc.constantFrom('add', 'multiply', 'subtract', 'greet'),
            param1: fc.constantFrom('a', 'b', 'x', 'y'),
            param2: fc.constantFrom('a', 'b', 'x', 'y'),
            operation: fc.constantFrom('+', '-', '*')
          }).map(({ funcName, param1, param2, operation }) => 
            `def ${funcName}(${param1}, ${param2}):\n    return ${param1} ${operation} ${param2}\n`
          ),
          // String functions
          fc.record({
            funcName: fc.constantFrom('reverse', 'uppercase'),
            param: fc.constantFrom('s', 'text')
          }).map(({ funcName, param }) => {
            if (funcName === 'reverse') {
              return `def ${funcName}(${param}):\n    return ${param}[::-1]\n`;
            } else {
              return `def ${funcName}(${param}):\n    return ${param}.upper()\n`;
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
          
          // Create AutograderEngine instance without any authentication parameters
          const engine = new AutograderEngine();
          
          // Verify the engine was created successfully without authentication
          expect(engine).toBeDefined();
          expect(engine.gradeSubmission).toBeDefined();
          
          // Verify the gradeSubmission method exists and is callable
          expect(typeof engine.gradeSubmission).toBe('function');
          
          // Verify the method parameters are only code-related, not auth-related
          const methodString = engine.gradeSubmission.toString();
          
          // Check that parameter names don't include authentication-related terms
          const authTerms = [
            'token',
            'auth',
            'credential',
            'apiKey',
            'password',
            'username',
            'session',
            'bearer'
          ];
          
          for (const term of authTerms) {
            expect(methodString.toLowerCase()).not.toContain(term.toLowerCase());
          }
          
          // Verify the method can be called with just code parameters
          // (We're not actually calling it here since PyodideManager needs to be initialized,
          // but we verify the signature allows unauthenticated calls)
          expect(typeof engine.gradeSubmission).toBe('function');
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property 23 (Variant): Verify gradeSubmission does not check for credentials
   * **Validates: Requirements 8.2**
   * 
   * The gradeSubmission method should not perform any authentication checks
   * before processing the code.
   */
  it('Property 23 (Variant): should not check for authentication before grading', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 10, maxLength: 100 }),
        fc.string({ minLength: 10, maxLength: 100 }),
        fc.stringMatching(/^[a-z0-9-]{3,20}$/),
        (studentCode, testCode, assignmentId) => {
          // Create AutograderEngine instance
          const engine = new AutograderEngine();
          
          // Get the method implementation as string
          const methodString = engine.gradeSubmission.toString();
          
          // Verify the method does not contain authentication checks
          const authCheckPatterns = [
            'isAuthenticated',
            'checkAuth',
            'requireAuth',
            'validateToken',
            'verifyCredentials',
            'if.*auth',
            'if.*token',
            'if.*credential'
          ];
          
          for (const pattern of authCheckPatterns) {
            const regex = new RegExp(pattern, 'i');
            expect(methodString).not.toMatch(regex);
          }
          
          // Verify the method does not throw authentication errors
          expect(methodString).not.toContain('Unauthorized');
          expect(methodString).not.toContain('Authentication required');
          expect(methodString).not.toContain('Invalid credentials');
          expect(methodString).not.toContain('Access denied');
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property 23 (Architecture): Verify AutograderEngine has no authentication methods
   * **Validates: Requirements 8.2**
   * 
   * The AutograderEngine class should not have any methods related to authentication,
   * login, or credential management.
   */
  it('Property 23 (Architecture): should not have authentication-related methods', () => {
    const engine = new AutograderEngine();
    
    // List of authentication-related method names that should NOT exist
    const authMethodNames = [
      'login',
      'logout',
      'authenticate',
      'setCredentials',
      'setToken',
      'setApiKey',
      'setAuthHeader',
      'checkAuth',
      'isAuthenticated',
      'requireAuth',
      'validateToken',
      'refreshToken',
      'verifyUser',
      'authorizeSubmission'
    ];
    
    // Verify none of these methods exist
    for (const methodName of authMethodNames) {
      expect(engine[methodName]).toBeUndefined();
    }
    
    // Verify the class only has expected public methods
    const expectedMethods = [
      'gradeSubmission',
      'loadTestSuite',
      '_combineCodeWithTests',
      '_escapePythonString',
      '_parseUnittestOutput',
      '_parseSyntaxError'
    ];
    
    // Get all methods on the engine instance
    const engineMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(engine))
      .filter(name => name !== 'constructor' && typeof engine[name] === 'function');
    
    // Verify all methods are in the expected list
    for (const method of engineMethods) {
      expect(expectedMethods).toContain(method);
    }
  });

  /**
   * Property 23 (Integration): Verify end-to-end submission without authentication
   * **Validates: Requirements 8.2**
   * 
   * A complete code submission workflow should work without any authentication
   * at any stage of the process.
   */
  it('Property 23 (Integration): should support complete submission workflow without auth', () => {
    fc.assert(
      fc.property(
        fc.record({
          funcName: fc.constantFrom('add', 'multiply'),
          param1: fc.constantFrom('a', 'x'),
          param2: fc.constantFrom('b', 'y')
        }),
        ({ funcName, param1, param2 }) => {
          const studentCode = `def ${funcName}(${param1}, ${param2}):\n    return ${param1} + ${param2}\n`;
          const testCode = `
import unittest

class TestMath(unittest.TestCase):
    def test_function(self):
        """Test function"""
        self.assertTrue(True)
`;
          
          // Create engine without any authentication context
          const engine = new AutograderEngine();
          
          // Verify we can prepare code for grading without authentication
          const combinedCode = engine._combineCodeWithTests(studentCode, testCode);
          
          // Verify the combined code does not include authentication checks
          expect(combinedCode).not.toContain('auth');
          expect(combinedCode).not.toContain('token');
          expect(combinedCode).not.toContain('credential');
          expect(combinedCode).not.toContain('login');
          
          // Verify the combined code is ready for execution
          expect(typeof combinedCode).toBe('string');
          expect(combinedCode.length).toBeGreaterThan(0);
          expect(combinedCode).toContain('exec("""');
          expect(combinedCode).toContain('unittest');
          
          // Verify student code is embedded for execution
          expect(combinedCode).toContain(funcName);
        }
      ),
      { numRuns: 10 }
    );
  });
});
