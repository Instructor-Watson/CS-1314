import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestSuiteLoader } from './TestSuiteLoader.js';

describe('TestSuiteLoader', () => {
  let loader;

  beforeEach(() => {
    loader = new TestSuiteLoader();
    vi.restoreAllMocks();
  });

  describe('loadTestSuite', () => {
    it('should load and return test suite code', async () => {
      const mockTestCode = `import unittest

class TestExample(unittest.TestCase):
    def test_example(self):
        self.assertEqual(1, 1)

if __name__ == '__main__':
    unittest.main()`;

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: async () => mockTestCode
      });

      const testCode = await loader.loadTestSuite('tests/test_example.py');

      expect(testCode).toBe(mockTestCode);
      expect(fetch).toHaveBeenCalledWith('tests/test_example.py');
    });

    it('should cache loaded test suites', async () => {
      const mockTestCode = 'import unittest\nclass TestExample(unittest.TestCase):\n    pass';

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: async () => mockTestCode
      });

      // Load twice
      await loader.loadTestSuite('tests/test_example.py');
      const secondLoad = await loader.loadTestSuite('tests/test_example.py');

      expect(secondLoad).toBe(mockTestCode);
      expect(fetch).toHaveBeenCalledTimes(1); // Should only fetch once
      expect(loader.isCached('tests/test_example.py')).toBe(true);
    });

    it('should throw error for 404 not found', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404
      });

      await expect(loader.loadTestSuite('tests/missing.py'))
        .rejects.toThrow('Test suite file not found: tests/missing.py');
    });

    it('should throw error for other HTTP errors', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500
      });

      await expect(loader.loadTestSuite('tests/test_example.py'))
        .rejects.toThrow('Failed to load test suite: HTTP 500');
    });

    it('should throw error for empty test file', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: async () => ''
      });

      await expect(loader.loadTestSuite('tests/empty.py'))
        .rejects.toThrow('Test suite file is empty: tests/empty.py');
    });

    it('should throw error for whitespace-only test file', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: async () => '   \n\t  \n  '
      });

      await expect(loader.loadTestSuite('tests/whitespace.py'))
        .rejects.toThrow('Test suite file is empty: tests/whitespace.py');
    });

    it('should handle network errors gracefully', async () => {
      global.fetch = vi.fn().mockRejectedValue(
        new TypeError('Failed to fetch')
      );

      await expect(loader.loadTestSuite('tests/test_example.py'))
        .rejects.toThrow('Network error loading test suite: tests/test_example.py');
    });

    it('should handle generic errors', async () => {
      global.fetch = vi.fn().mockRejectedValue(
        new Error('Something went wrong')
      );

      await expect(loader.loadTestSuite('tests/test_example.py'))
        .rejects.toThrow('Failed to load test suite from tests/test_example.py: Something went wrong');
    });

    it('should load different test suites independently', async () => {
      const mockTestCode1 = 'import unittest\nclass Test1(unittest.TestCase):\n    pass';
      const mockTestCode2 = 'import unittest\nclass Test2(unittest.TestCase):\n    pass';

      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          text: async () => mockTestCode1
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => mockTestCode2
        });

      const test1 = await loader.loadTestSuite('tests/test_1.py');
      const test2 = await loader.loadTestSuite('tests/test_2.py');

      expect(test1).toBe(mockTestCode1);
      expect(test2).toBe(mockTestCode2);
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('clearCache', () => {
    it('should clear specific cached test suite', async () => {
      const mockTestCode = 'import unittest\nclass TestExample(unittest.TestCase):\n    pass';

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: async () => mockTestCode
      });

      await loader.loadTestSuite('tests/test_example.py');
      expect(loader.isCached('tests/test_example.py')).toBe(true);

      loader.clearCache('tests/test_example.py');
      expect(loader.isCached('tests/test_example.py')).toBe(false);
    });

    it('should clear all cached test suites', async () => {
      const mockTestCode = 'import unittest\nclass TestExample(unittest.TestCase):\n    pass';

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: async () => mockTestCode
      });

      await loader.loadTestSuite('tests/test_1.py');
      await loader.loadTestSuite('tests/test_2.py');

      expect(loader.isCached('tests/test_1.py')).toBe(true);
      expect(loader.isCached('tests/test_2.py')).toBe(true);

      loader.clearCache();

      expect(loader.isCached('tests/test_1.py')).toBe(false);
      expect(loader.isCached('tests/test_2.py')).toBe(false);
    });

    it('should allow reloading after cache clear', async () => {
      const mockTestCode1 = 'import unittest\nclass Test1(unittest.TestCase):\n    pass';
      const mockTestCode2 = 'import unittest\nclass Test2(unittest.TestCase):\n    pass';

      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          text: async () => mockTestCode1
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => mockTestCode2
        });

      const firstLoad = await loader.loadTestSuite('tests/test_example.py');
      expect(firstLoad).toBe(mockTestCode1);

      loader.clearCache('tests/test_example.py');

      const secondLoad = await loader.loadTestSuite('tests/test_example.py');
      expect(secondLoad).toBe(mockTestCode2);
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('isCached', () => {
    it('should return false for uncached test suite', () => {
      expect(loader.isCached('tests/test_example.py')).toBe(false);
    });

    it('should return true for cached test suite', async () => {
      const mockTestCode = 'import unittest\nclass TestExample(unittest.TestCase):\n    pass';

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: async () => mockTestCode
      });

      await loader.loadTestSuite('tests/test_example.py');
      expect(loader.isCached('tests/test_example.py')).toBe(true);
    });

    it('should return false after cache is cleared', async () => {
      const mockTestCode = 'import unittest\nclass TestExample(unittest.TestCase):\n    pass';

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: async () => mockTestCode
      });

      await loader.loadTestSuite('tests/test_example.py');
      loader.clearCache('tests/test_example.py');
      expect(loader.isCached('tests/test_example.py')).toBe(false);
    });
  });
});
