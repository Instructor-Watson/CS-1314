/**
 * Build a stable Python filename from an assignment title.
 *
 * Example: "Hello World" -> "hello_world_assignment.py"
 *
 * @param {string} assignmentTitle
 * @returns {string}
 */
export function buildSubmissionFilename(assignmentTitle) {
  const normalizedTitle = String(assignmentTitle || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  const safeTitle = normalizedTitle || 'assignment';
  return `${safeTitle}_assignment.py`;
}

/**
 * Download student code as a Python file in the browser.
 *
 * @param {string} assignmentTitle
 * @param {string} code
 * @param {Object} [options]
 * @param {Document} [options.documentRef]
 * @param {URL} [options.urlRef]
 * @returns {string}
 */
export function downloadSubmission(assignmentTitle, code, options = {}) {
  if (!assignmentTitle || assignmentTitle.trim() === '') {
    throw new Error('Assignment title is required');
  }

  if (typeof code !== 'string') {
    throw new Error('Code must be a string');
  }

  const { documentRef = document, urlRef = URL } = options;
  const filename = buildSubmissionFilename(assignmentTitle);
  const blob = new Blob([code], { type: 'text/x-python;charset=utf-8' });
  const objectUrl = urlRef.createObjectURL(blob);
  const link = documentRef.createElement('a');

  link.href = objectUrl;
  link.download = filename;
  link.style.display = 'none';

  documentRef.body.appendChild(link);
  link.click();
  link.remove();
  urlRef.revokeObjectURL(objectUrl);

  return filename;
}
