import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AssignmentLoader } from './AssignmentLoader.js';

describe('AssignmentLoader', () => {
  let loader;

  beforeEach(() => {
    loader = new AssignmentLoader('/test-assignments.json');
    vi.restoreAllMocks();
  });

  describe('loadAssignments', () => {
    it('should load and return valid assignments', async () => {
      const mockData = {
        assignments: [
          {
            id: 'test-1',
            title: 'Test Assignment',
            description: 'Test description',
            instructions: 'test_assignment.pdf',
            testSuiteFile: 'tests/test_1.py',
            starterCode: 'test_template.py'
          }
        ]
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData
      });

      const assignments = await loader.loadAssignments();

      expect(assignments).toHaveLength(1);
      expect(assignments[0].id).toBe('test-1');
      expect(assignments[0].title).toBe('Test Assignment');
    });

    it('should cache loaded assignments', async () => {
      const mockData = {
        assignments: [
          {
            id: 'test-1',
            title: 'Test Assignment',
            description: 'Test description',
            instructions: 'test_assignment.pdf',
            testSuiteFile: 'tests/test_1.py'
          }
        ]
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData
      });

      await loader.loadAssignments();
      const cached = loader.getLoadedAssignments();

      expect(cached).toHaveLength(1);
      expect(cached[0].id).toBe('test-1');
    });

    it('should throw error for invalid data structure', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ invalid: 'structure' })
      });

      await expect(loader.loadAssignments()).rejects.toThrow('Invalid assignments data structure');
    });

    it('should throw error for HTTP failure', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404
      });

      await expect(loader.loadAssignments()).rejects.toThrow('Failed to load assignments after 3 attempts');
    });

    it('should retry on network failure with exponential backoff', async () => {
      let attemptCount = 0;

      global.fetch = vi.fn().mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 3) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({
            assignments: [
              {
                id: 'test-1',
                title: 'Test',
                description: 'Test',
                instructions: 'test.pdf',
                testSuiteFile: 'test.py'
              }
            ]
          })
        });
      });

      const assignments = await loader.loadAssignments();

      expect(attemptCount).toBe(3);
      expect(assignments).toHaveLength(1);
    });

    it('should fail after max retries', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      await expect(loader.loadAssignments()).rejects.toThrow('Failed to load assignments after 3 attempts');
      expect(fetch).toHaveBeenCalledTimes(3);
    });
  });

  describe('getAssignment', () => {
    it('should return assignment by id', async () => {
      const mockData = {
        assignments: [
          {
            id: 'test-1',
            title: 'Test 1',
            description: 'Description 1',
            instructions: 'instructions_1.pdf',
            testSuiteFile: 'test_1.py'
          },
          {
            id: 'test-2',
            title: 'Test 2',
            description: 'Description 2',
            instructions: 'instructions_2.pdf',
            testSuiteFile: 'test_2.py'
          }
        ]
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData
      });

      const assignment = await loader.getAssignment('test-2');

      expect(assignment.id).toBe('test-2');
      expect(assignment.title).toBe('Test 2');
    });

    it('should throw error for non-existent assignment', async () => {
      const mockData = {
        assignments: [
          {
            id: 'test-1',
            title: 'Test 1',
            description: 'Description 1',
            instructions: 'instructions_1.pdf',
            testSuiteFile: 'test_1.py'
          }
        ]
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData
      });

      await expect(loader.getAssignment('non-existent')).rejects.toThrow('Assignment with id "non-existent" not found');
    });

    it('should load assignments if not already loaded', async () => {
      const mockData = {
        assignments: [
          {
            id: 'test-1',
            title: 'Test 1',
            description: 'Description 1',
            instructions: 'instructions_1.pdf',
            testSuiteFile: 'test_1.py'
          }
        ]
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData
      });

      const assignment = await loader.getAssignment('test-1');

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(assignment.id).toBe('test-1');
    });
  });

  describe('validateAssignment', () => {
    it('should validate assignment with all required fields', () => {
      const validAssignment = {
        id: 'test-1',
        title: 'Test',
        description: 'Description',
        instructions: 'instructions.pdf',
        testSuiteFile: 'test.py'
      };

      expect(() => loader.validateAssignment(validAssignment, 0)).not.toThrow();
    });

    it('should throw error for missing id', () => {
      const invalidAssignment = {
        title: 'Test',
        description: 'Description',
        instructions: 'instructions.pdf',
        testSuiteFile: 'test.py'
      };

      expect(() => loader.validateAssignment(invalidAssignment, 0)).toThrow('missing required fields: id');
    });

    it('should throw error for missing title', () => {
      const invalidAssignment = {
        id: 'test-1',
        description: 'Description',
        instructions: 'instructions.pdf',
        testSuiteFile: 'test.py'
      };

      expect(() => loader.validateAssignment(invalidAssignment, 0)).toThrow('missing required fields: title');
    });

    it('should throw error for missing description', () => {
      const invalidAssignment = {
        id: 'test-1',
        title: 'Test',
        instructions: 'instructions.pdf',
        testSuiteFile: 'test.py'
      };

      expect(() => loader.validateAssignment(invalidAssignment, 0)).toThrow('missing required fields: description');
    });

    it('should throw error for missing instructions', () => {
      const invalidAssignment = {
        id: 'test-1',
        title: 'Test',
        description: 'Description',
        testSuiteFile: 'test.py'
      };

      expect(() => loader.validateAssignment(invalidAssignment, 0)).toThrow('missing required fields: instructions');
    });

    it('should throw error for missing testSuiteFile', () => {
      const invalidAssignment = {
        id: 'test-1',
        title: 'Test',
        description: 'Description',
        instructions: 'instructions.pdf'
      };

      expect(() => loader.validateAssignment(invalidAssignment, 0)).toThrow('missing required fields: testSuiteFile');
    });

    it('should throw error for empty string fields', () => {
      const invalidAssignment = {
        id: '',
        title: 'Test',
        description: 'Description',
        instructions: 'instructions.pdf',
        testSuiteFile: 'test.py'
      };

      expect(() => loader.validateAssignment(invalidAssignment, 0)).toThrow('missing required fields: id');
    });

    it('should throw error for invalid field types', () => {
      const invalidAssignment = {
        id: 123,
        title: 'Test',
        description: 'Description',
        instructions: 'instructions.pdf',
        testSuiteFile: 'test.py'
      };

      expect(() => loader.validateAssignment(invalidAssignment, 0)).toThrow('id must be a string');
    });

    it('should validate optional starterCode field', () => {
      const validAssignment = {
        id: 'test-1',
        title: 'Test',
        description: 'Description',
        instructions: 'instructions.pdf',
        testSuiteFile: 'test.py',
        starterCode: 'template.py'
      };

      expect(() => loader.validateAssignment(validAssignment, 0)).not.toThrow();
    });

    it('should throw error for invalid starterCode type', () => {
      const invalidAssignment = {
        id: 'test-1',
        title: 'Test',
        description: 'Description',
        instructions: 'instructions.pdf',
        testSuiteFile: 'test.py',
        starterCode: 123
      };

      expect(() => loader.validateAssignment(invalidAssignment, 0)).toThrow('starterCode must be a string');
    });
  });

  describe('clearCache', () => {
    it('should clear cached assignments', async () => {
      const mockData = {
        assignments: [
          {
            id: 'test-1',
            title: 'Test',
            description: 'Description',
            instructions: 'instructions.pdf',
            testSuiteFile: 'test.py'
          }
        ]
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData
      });

      await loader.loadAssignments();
      expect(loader.getLoadedAssignments()).not.toBeNull();

      loader.clearCache();
      expect(loader.getLoadedAssignments()).toBeNull();
    });
  });
});
