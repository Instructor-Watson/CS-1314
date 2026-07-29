import { describe, it, expect } from 'vitest';
import {
  buildSessionBackupFilename,
  downloadSessionBackup,
  parseSessionBackupText
} from './SessionTransfer.js';

describe('SessionTransfer', () => {
  it('builds a stable export filename', () => {
    const filename = buildSessionBackupFilename(new Date('2026-03-06T12:00:00.000Z'));
    expect(filename).toBe('python_autograder_saves_2026-03-06.json');
  });

  it('downloads session backup as json', async () => {
    const clicks = [];
    let appendedLink = null;
    let capturedBlob = null;
    let revokedUrl = null;

    const documentRef = {
      body: {
        appendChild(node) {
          appendedLink = node;
        }
      },
      createElement(tagName) {
        expect(tagName).toBe('a');
        return {
          style: {},
          click() {
            clicks.push('clicked');
          },
          remove() {}
        };
      }
    };

    const urlRef = {
      createObjectURL(blob) {
        capturedBlob = blob;
        return 'blob:session';
      },
      revokeObjectURL(url) {
        revokedUrl = url;
      }
    };

    const filename = downloadSessionBackup(
      { version: 1, saves: { hello: 'print("hi")' } },
      {
        documentRef,
        urlRef,
        date: new Date('2026-03-06T12:00:00.000Z')
      }
    );

    expect(filename).toBe('python_autograder_saves_2026-03-06.json');
    expect(appendedLink.download).toBe(filename);
    expect(appendedLink.href).toBe('blob:session');
    expect(clicks).toHaveLength(1);
    expect(revokedUrl).toBe('blob:session');
    expect(await capturedBlob.text()).toContain('"hello": "print(\\"hi\\")"');
  });

  it('parses valid import json', () => {
    const parsed = parseSessionBackupText('{"version":1,"saves":{"hello-world":"print(1)"}}');
    expect(parsed.saves['hello-world']).toBe('print(1)');
  });

  it('rejects invalid import files', () => {
    expect(() => parseSessionBackupText('')).toThrow('Import file is empty');
    expect(() => parseSessionBackupText('{')).toThrow('Import file is not valid JSON');
    expect(() => parseSessionBackupText('{"version":1}')).toThrow('Import file must contain a saves object');
  });
});
