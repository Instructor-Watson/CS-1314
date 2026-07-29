import { describe, it, expect, afterEach, vi } from 'vitest';
import { buildSubmissionFilename, downloadSubmission } from './SubmissionDownload.js';

describe('SubmissionDownload', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  describe('buildSubmissionFilename', () => {
    it('converts assignment titles into snake_case filenames', () => {
      expect(buildSubmissionFilename('Hello World')).toBe('hello_world_assignment.py');
      expect(buildSubmissionFilename('Count Vowels in a String')).toBe('count_vowels_in_a_string_assignment.py');
    });

    it('removes punctuation and collapses duplicate separators', () => {
      expect(buildSubmissionFilename('Assignment #1: Hello, World!')).toBe('assignment_1_hello_world_assignment.py');
    });
  });

  describe('downloadSubmission', () => {
    it('downloads the current code using the assignment-based filename', () => {
      const createObjectURL = vi.fn(() => 'blob:test-download');
      const revokeObjectURL = vi.fn();
      const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
      const appendSpy = vi.spyOn(document.body, 'appendChild');
      const removeSpy = vi.spyOn(HTMLAnchorElement.prototype, 'remove');

      const filename = downloadSubmission('Hello World', 'print("Hello World!")', {
        documentRef: document,
        urlRef: {
          createObjectURL,
          revokeObjectURL
        }
      });

      const link = appendSpy.mock.calls[0][0];
      expect(filename).toBe('hello_world_assignment.py');
      expect(link.download).toBe('hello_world_assignment.py');
      expect(link.href).toBe('blob:test-download');
      expect(clickSpy).toHaveBeenCalledTimes(1);
      expect(removeSpy).toHaveBeenCalledTimes(1);
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:test-download');
    });

    it('throws when assignment title is missing', () => {
      expect(() => downloadSubmission('', 'print("Hello")')).toThrow('Assignment title is required');
    });
  });
});
