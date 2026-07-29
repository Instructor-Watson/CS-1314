/**
 * Property-based tests for TestSuiteLoader
 * Feature: python-autograder-web-app
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import fc from 'fast-check';
import { TestSuiteLoader } from './TestSuiteLoader.js';

describe('TestSuiteLoader Property Tests', () => {
  let loader;

  beforeEach(() => {
    loader = new TestSuiteLoader();
    vi.restoreAllMocks();
  });

  /**
   * Property 26: Test Suite File Loading
   * **Validates: Requirements 10.2**
   * 
   * For any assignment with a testSuiteFile reference, the application should 
   * successfully fetch and load the Python test file from the specified path.
   */
  it('Property 26: should successfully load test suite from any valid file path', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate valid test file paths and corresponding test code
        fc.record({
          fileName: fc.string({ minLength: 1, maxLength: 20 })
            .filter(s => s.replace(/[^a-zA-Z0-9]/g, '').length > 0)
            .map(s => s.replace(/[^a-zA-Z0-9]/g, '_')),
          testCode: fc.constantFrom(
            'import unittest\n\nclass TestExample(unittest.TestCase):\n    def test_example(self):\n        self.assertTrue(True)\n\nif __name__ == \'__main__\':\n    unittest.main()',
            'import unittest\n\nclass TestBasic(unittest.TestCase):\n    def test_basic(self):\n        self.assertEqual(1, 1)\n\nif __name__ == \'__main__\':\n    unittest.main()',
            'import unittest\n\nclass TestSimple(unittest.TestCase):\n    def test_simple(self):\n        pass\n\nif __name__ == \'__main__\':\n    unittest.main()'
          )
        }),
        async ({ fileName, testCode }) => {
          // Create a fresh loader for each test to avoid cache conflicts
          const freshLoader = new TestSuiteLoader();
          const filePath = `tests/test_${fileName}.py`;
          
          // Mock fetch to return the generated test code
          global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            text: async () => testCode
          });

          // Load the test suite
          const loadedCode = await freshLoader.loadTestSuite(filePath);

          // Property: The loaded code should match the test code from the file
          expect(loadedCode).toBe(testCode);
          
          // Verify fetch was called with the correct path
          expect(fetch).toHaveBeenCalledWith(filePath);
          
          // Property: The loaded code should be non-empty
          expect(loadedCode.length).toBeGreaterThan(0);
          
          // Property: The loaded code should be cached for subsequent loads
          expect(freshLoader.isCached(filePath)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 26 Extension: Test Suite Loading with Multiple Files
   * **Validates: Requirements 10.2**
   * 
   * For any set of assignments with different testSuiteFile references, 
   * each test suite should be loaded independently and correctly.
   */
  it('Property 26 Extension: should load multiple test suites independently', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate multiple test file paths with their corresponding code
        fc.array(
          fc.record({
            fileName: fc.string({ minLength: 1, maxLength: 20 })
              .filter(s => s.replace(/[^a-zA-Z0-9]/g, '').length > 0)
              .map(s => s.replace(/[^a-zA-Z0-9]/g, '_')),
            testCode: fc.constantFrom(
              'import unittest\n\nclass TestSuite1(unittest.TestCase):\n    def test_one(self):\n        pass\n',
              'import unittest\n\nclass TestSuite2(unittest.TestCase):\n    def test_two(self):\n        pass\n',
              'import unittest\n\nclass TestSuite3(unittest.TestCase):\n    def test_three(self):\n        pass\n'
            )
          }),
          { minLength: 1, maxLength: 5 }
        ).map(suites => {
          // Ensure unique file names by adding index
          return suites.map((suite, index) => ({
            filePath: `tests/test_${suite.fileName}_${index}.py`,
            testCode: suite.testCode
          }));
        }),
        async (testSuites) => {
          // Create a fresh loader for each test
          const freshLoader = new TestSuiteLoader();
          
          // Mock fetch to return different code for each path
          global.fetch = vi.fn().mockImplementation(async (path) => {
            const suite = testSuites.find(s => s.filePath === path);
            if (suite) {
              return {
                ok: true,
                text: async () => suite.testCode
              };
            }
            return {
              ok: false,
              status: 404
            };
          });

          // Load all test suites
          const loadedSuites = await Promise.all(
            testSuites.map(suite => freshLoader.loadTestSuite(suite.filePath))
          );

          // Property: Each loaded suite should match its corresponding test code
          loadedSuites.forEach((loadedCode, index) => {
            expect(loadedCode).toBe(testSuites[index].testCode);
          });

          // Property: All test suites should be cached
          testSuites.forEach(suite => {
            expect(freshLoader.isCached(suite.filePath)).toBe(true);
          });

          // Property: The number of loaded suites should match the input
          expect(loadedSuites).toHaveLength(testSuites.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 26 Extension: Test Suite Caching Behavior
   * **Validates: Requirements 10.2**
   * 
   * For any test suite file that has been loaded, subsequent loads should 
   * return the cached version without making additional fetch requests.
   */
  it('Property 26 Extension: should cache loaded test suites and reuse them', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          fileName: fc.string({ minLength: 1, maxLength: 20 })
            .filter(s => s.replace(/[^a-zA-Z0-9]/g, '').length > 0)
            .map(s => s.replace(/[^a-zA-Z0-9]/g, '_')),
          testCode: fc.constantFrom(
            'import unittest\n\nclass TestCache(unittest.TestCase):\n    pass\n',
            'import unittest\n\nclass TestCacheTwo(unittest.TestCase):\n    pass\n'
          ),
          loadCount: fc.integer({ min: 2, max: 5 })
        }),
        async ({ fileName, testCode, loadCount }) => {
          // Create a fresh loader
          const freshLoader = new TestSuiteLoader();
          const filePath = `tests/test_${fileName}.py`;
          
          // Mock fetch
          global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            text: async () => testCode
          });

          // Load the same test suite multiple times
          const results = [];
          for (let i = 0; i < loadCount; i++) {
            results.push(await freshLoader.loadTestSuite(filePath));
          }

          // Property: All loads should return the same code
          results.forEach(result => {
            expect(result).toBe(testCode);
          });

          // Property: Fetch should only be called once (first load)
          expect(fetch).toHaveBeenCalledTimes(1);
          
          // Property: The test suite should be cached
          expect(freshLoader.isCached(filePath)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
