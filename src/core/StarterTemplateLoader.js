export class StarterTemplateLoader {
  constructor(templatesBasePath = 'templates') {
    this.templatesBasePath = templatesBasePath.replace(/\/$/, '');
    this.cache = new Map();
  }

  buildTemplatePath(templateFile) {
    if (!templateFile || typeof templateFile !== 'string') {
      throw new Error('Template filename must be a non-empty string');
    }

    const normalizedTemplateFile = templateFile.replace(/^\/+/, '');
    return `${this.templatesBasePath}/${normalizedTemplateFile}`;
  }

  async loadTemplate(templateFile) {
    if (this.cache.has(templateFile)) {
      return this.cache.get(templateFile);
    }

    const templatePath = this.buildTemplatePath(templateFile);
    const response = await fetch(templatePath);

    if (!response.ok) {
      throw new Error(`Failed to load starter template "${templateFile}": HTTP ${response.status}`);
    }

    const templateCode = await response.text();
    this.cache.set(templateFile, templateCode);

    return templateCode;
  }

  clearCache() {
    this.cache.clear();
  }
}
