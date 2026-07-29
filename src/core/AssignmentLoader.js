/**
 * AssignmentLoader - Loads and manages assignment data from static JSON files
 *
 * Validates: Requirements 2.1, 10.1, 10.4, 11.5
 */

export class AssignmentLoader {
  constructor(assignmentsPath = 'assignments.json') {
    this.assignmentsPath = assignmentsPath;
    this.assignments = null;
    this.maxRetries = 3;
    this.baseDelay = 1000;
  }

  async loadAssignments() {
    let lastError = null;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const response = await fetch(this.assignmentsPath);

        if (!response.ok) {
          throw new Error(`Failed to load assignments: HTTP ${response.status}`);
        }

        const data = await response.json();

        if (!data || !Array.isArray(data.assignments)) {
          throw new Error('Invalid assignments data structure: expected { assignments: [...] }');
        }

        const validatedAssignments = data.assignments.map((assignment, index) => {
          this.validateAssignment(assignment, index);
          return assignment;
        });

        this.assignments = validatedAssignments;
        return validatedAssignments;
      } catch (error) {
        lastError = error;

        if (attempt < this.maxRetries - 1) {
          const delay = this.baseDelay * Math.pow(2, attempt);
          console.warn(`Assignment loading attempt ${attempt + 1} failed. Retrying in ${delay}ms...`, error);
          await this.sleep(delay);
        }
      }
    }

    throw new Error(`Failed to load assignments after ${this.maxRetries} attempts: ${lastError.message}`);
  }

  async getAssignment(id) {
    if (!this.assignments) {
      await this.loadAssignments();
    }

    const assignment = this.assignments.find(a => a.id === id);

    if (!assignment) {
      throw new Error(`Assignment with id "${id}" not found`);
    }

    return assignment;
  }

  validateAssignment(assignment, index) {
    const requiredFields = [
      'id',
      'title',
      'description',
      'instructions',
      'testSuiteFile'
    ];

    const missingFields = requiredFields.filter(field => {
      const value = assignment[field];
      return value === undefined || value === null || value === '';
    });

    if (missingFields.length > 0) {
      throw new Error(
        `Assignment at index ${index} is missing required fields: ${missingFields.join(', ')}`
      );
    }

    if (typeof assignment.id !== 'string') {
      throw new Error(`Assignment at index ${index}: id must be a string`);
    }

    if (typeof assignment.title !== 'string') {
      throw new Error(`Assignment at index ${index}: title must be a string`);
    }

    if (typeof assignment.description !== 'string') {
      throw new Error(`Assignment at index ${index}: description must be a string`);
    }

    if (typeof assignment.instructions !== 'string') {
      throw new Error(`Assignment at index ${index}: instructions must be a string`);
    }

    if (typeof assignment.testSuiteFile !== 'string') {
      throw new Error(`Assignment at index ${index}: testSuiteFile must be a string`);
    }

    if (assignment.starterCode !== undefined && typeof assignment.starterCode !== 'string') {
      throw new Error(`Assignment at index ${index}: starterCode must be a string`);
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getLoadedAssignments() {
    return this.assignments;
  }

  clearCache() {
    this.assignments = null;
  }
}
