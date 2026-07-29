/**
 * TestSuiteLoader - Loads Python test suite files from static file paths
 * 
 * Validates: Requirements 4.1, 10.2
 */

export class TestSuiteLoader {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Load a test suite file from the specified path
   * 
   * @param {string} filePath - Path to the Python test file
   * @returns {Promise<string>} The test suite code as a string
   * @throws {Error} If the file cannot be loaded
   */
  async loadTestSuite(filePath) {
    // Check cache first
    if (this.cache.has(filePath)) {
      return this.cache.get(filePath);
    }

    try {
      const response = await fetch(filePath);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Test suite file not found: ${filePath}`);
        }
        throw new Error(`Failed to load test suite: HTTP ${response.status} - ${filePath}`);
      }

      const testCode = await response.text();

      // Validate that we got some content
      if (!testCode || testCode.trim().length === 0) {
        throw new Error(`Test suite file is empty: ${filePath}`);
      }

      // Cache the loaded test suite
      this.cache.set(filePath, testCode);

      return testCode;

    } catch (error) {
      // If it's already our custom error, rethrow it
      if (error.message.includes('Test suite file')) {
        throw error;
      }

      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(`Network error loading test suite: ${filePath}. Please check your connection.`);
      }

      // Generic error
      throw new Error(`Failed to load test suite from ${filePath}: ${error.message}`);
    }
  }

  /**
   * Clear the cache for a specific file or all files
   * 
   * @param {string} [filePath] - Optional specific file path to clear. If omitted, clears all cache.
   */
  clearCache(filePath) {
    if (filePath) {
      this.cache.delete(filePath);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Check if a test suite is cached
   * 
   * @param {string} filePath - Path to check
   * @returns {boolean} True if the test suite is cached
   */
  isCached(filePath) {
    return this.cache.has(filePath);
  }
}
