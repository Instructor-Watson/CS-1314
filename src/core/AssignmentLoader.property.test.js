/**
 * Property-based tests for AssignmentLoader
 * Feature: python-autograder-web-app
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import fc from 'fast-check';
import { AssignmentLoader } from './AssignmentLoader.js';

describe('AssignmentLoader Property Tests', () => {
  let loader;

  beforeEach(() => {
    loader = new AssignmentLoader('/test-assignments.json');
    vi.restoreAllMocks();
  });

  /**
   * Property 3: Assignment List Completeness
   * **Validates: Requirements 2.2**
   * 
   * For any set of assignments loaded from Assignment_Data, the displayed assignment 
   * list should contain exactly the same number of assignments as the loaded data.
   */
  it('Property 3: should return complete assignment list matching loaded data', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate an array of valid assignments with varying lengths (1-20 assignments)
        fc.array(
          fc.record({
            id: fc.string({ minLength: 1, maxLength: 20 }).map(s => s.replace(/\s/g, '-')),
            title: fc.string({ minLength: 1, maxLength: 100 }),
            description: fc.string({ minLength: 1, maxLength: 500 }),
            instructions: fc.string({ minLength: 1, maxLength: 1000 }),
            testSuiteFile: fc.string({ minLength: 1, maxLength: 100 }).map(s => `tests/${s}.py`),
            starterCode: fc.option(fc.string({ maxLength: 500 }), { nil: undefined }),
            difficulty: fc.option(fc.constantFrom('beginner', 'intermediate', 'advanced'), { nil: undefined }),
            topics: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 50 }), { maxLength: 5 }), { nil: undefined })
          }),
          { minLength: 1, maxLength: 20 }
        ),
        async (generatedAssignments) => {
          // Mock fetch to return the generated assignments
          const mockData = { assignments: generatedAssignments };
          
          global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => mockData
          });

          // Load assignments
          const loadedAssignments = await loader.loadAssignments();

          // Property: The number of loaded assignments should exactly match the number in the data
          expect(loadedAssignments).toHaveLength(generatedAssignments.length);
          
          // Additional verification: Each assignment should be present
          expect(loadedAssignments).toEqual(generatedAssignments);
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property 28: Assignment Validation
   * **Validates: Requirements 10.5**
   * 
   * For any assignment in the Assignment_Data, the assignment object should 
   * include a non-empty testSuiteFile field.
   */
  it('Property 28: should validate that all assignments have non-empty testSuiteFile', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate assignments with various testSuiteFile values
        fc.array(
          fc.record({
            id: fc.string({ minLength: 1, maxLength: 20 }).map(s => s.replace(/\s/g, '-')),
            title: fc.string({ minLength: 1, maxLength: 100 }),
            description: fc.string({ minLength: 1, maxLength: 500 }),
            instructions: fc.string({ minLength: 1, maxLength: 1000 }),
            testSuiteFile: fc.string({ minLength: 1, maxLength: 100 }).map(s => `tests/${s}.py`),
            starterCode: fc.option(fc.string({ maxLength: 500 }), { nil: undefined }),
            difficulty: fc.option(fc.constantFrom('beginner', 'intermediate', 'advanced'), { nil: undefined }),
            topics: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 50 }), { maxLength: 5 }), { nil: undefined })
          }),
          { minLength: 1, maxLength: 20 }
        ),
        async (generatedAssignments) => {
          // Mock fetch to return the generated assignments
          const mockData = { assignments: generatedAssignments };
          
          global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => mockData
          });

          // Load assignments
          const loadedAssignments = await loader.loadAssignments();

          // Property: Every assignment must have a non-empty testSuiteFile field
          loadedAssignments.forEach((assignment, index) => {
            expect(assignment.testSuiteFile).toBeDefined();
            expect(assignment.testSuiteFile).not.toBe('');
            expect(assignment.testSuiteFile).not.toBe(null);
            expect(typeof assignment.testSuiteFile).toBe('string');
            expect(assignment.testSuiteFile.length).toBeGreaterThan(0);
          });
        }
      ),
      { numRuns: 10 }
    );
  });
});
