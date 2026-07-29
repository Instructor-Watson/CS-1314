/**
 * Build a stable filename for exporting browser-saved assignment drafts.
 *
 * @param {Date} [date]
 * @returns {string}
 */
export function buildSessionBackupFilename(date = new Date()) {
  const stamp = Number.isNaN(date?.getTime?.())
    ? 'backup'
    : date.toISOString().slice(0, 10);

  return `python_autograder_saves_${stamp}.json`;
}

/**
 * Trigger a browser download for saved assignment drafts.
 *
 * @param {Object} data
 * @param {Object} [options]
 * @param {Document} [options.documentRef]
 * @param {URL} [options.urlRef]
 * @param {Date} [options.date]
 * @returns {string}
 */
export function downloadSessionBackup(data, options = {}) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('Export data must be an object');
  }

  const { documentRef = document, urlRef = URL, date = new Date() } = options;
  const filename = buildSessionBackupFilename(date);
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json;charset=utf-8'
  });
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

/**
 * Parse imported session-backup text and validate its basic shape.
 *
 * @param {string} text
 * @returns {{version?: number, exportedAt?: string, saves: Record<string, string>}}
 */
export function parseSessionBackupText(text) {
  if (typeof text !== 'string' || text.trim() === '') {
    throw new Error('Import file is empty');
  }

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('Import file is not valid JSON');
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Import file must contain an object');
  }

  if (!parsed.saves || typeof parsed.saves !== 'object' || Array.isArray(parsed.saves)) {
    throw new Error('Import file must contain a saves object');
  }

  return parsed;
}
