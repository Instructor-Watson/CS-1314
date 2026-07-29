import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StarterTemplateLoader } from './StarterTemplateLoader.js';

describe('StarterTemplateLoader', () => {
  let loader;

  beforeEach(() => {
    loader = new StarterTemplateLoader('/templates');
    vi.restoreAllMocks();
  });

  it('builds a template path from a filename', () => {
    expect(loader.buildTemplatePath('hello_world.py')).toBe('/templates/hello_world.py');
  });

  it('normalizes a leading slash in the template filename', () => {
    expect(loader.buildTemplatePath('/hello_world.py')).toBe('/templates/hello_world.py');
  });

  it('throws for an invalid template filename', () => {
    expect(() => loader.buildTemplatePath('')).toThrow('Template filename must be a non-empty string');
    expect(() => loader.buildTemplatePath(null)).toThrow('Template filename must be a non-empty string');
  });

  it('loads starter template content from the templates directory', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => 'print("Hello World!")\n'
    });

    const template = await loader.loadTemplate('hello_world.py');

    expect(fetch).toHaveBeenCalledWith('/templates/hello_world.py');
    expect(template).toBe('print("Hello World!")\n');
  });

  it('caches template content after the first load', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => 'print("Hello World!")\n'
    });

    const firstLoad = await loader.loadTemplate('hello_world.py');
    const secondLoad = await loader.loadTemplate('hello_world.py');

    expect(firstLoad).toBe(secondLoad);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('throws a helpful error when the template file cannot be loaded', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404
    });

    await expect(loader.loadTemplate('missing.py')).rejects.toThrow(
      'Failed to load starter template "missing.py": HTTP 404'
    );
  });
});
