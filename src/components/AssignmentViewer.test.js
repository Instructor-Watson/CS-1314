/**
 * Unit tests for AssignmentViewer component
 * Requirements: 2.3, 2.4
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AssignmentViewer } from './AssignmentViewer.js';

describe('AssignmentViewer', () => {
  let viewer;
  let container;

  beforeEach(() => {
    viewer = new AssignmentViewer();
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    viewer.dispose();
    document.body.removeChild(container);
  });

  describe('initialization', () => {
    it('should initialize with a container', () => {
      viewer.initialize(container);
      expect(viewer.container).toBe(container);
    });

    it('should throw error if container is not provided', () => {
      expect(() => viewer.initialize(null)).toThrow('Container element is required');
    });

    it('should initialize with an assignment', () => {
      const assignment = {
        id: 'test-1',
        title: 'Test Assignment',
        description: 'Test description',
        instructions: 'test_assignment.pdf'
      };

      viewer.initialize(container, assignment);
      expect(viewer.getAssignment()).toBe(assignment);
    });

    it('should display placeholder when no assignment is provided', () => {
      viewer.initialize(container);
      const placeholder = container.querySelector('.assignment-viewer-placeholder');
      expect(placeholder).toBeTruthy();
      expect(placeholder.textContent).toContain('Select an assignment');
    });
  });

  describe('setAssignment', () => {
    beforeEach(() => {
      viewer.initialize(container);
    });

    it('should display assignment title', () => {
      const assignment = {
        id: 'test-1',
        title: 'Hello World',
        description: 'A simple assignment',
        instructions: 'hello_world.pdf'
      };

      viewer.setAssignment(assignment);

      const title = container.querySelector('.assignment-viewer-title');
      expect(title).toBeTruthy();
      expect(title.textContent).toBe('Hello World');
    });

    it('should display assignment description', () => {
      const assignment = {
        id: 'test-1',
        title: 'Test',
        description: 'This is a test description',
        instructions: 'test.pdf'
      };

      viewer.setAssignment(assignment);

      const description = container.querySelector('.assignment-viewer-description');
      expect(description).toBeTruthy();
      expect(description.textContent).toBe('This is a test description');
    });

    it('should render an instructions button that opens in a new tab', () => {
      const assignment = {
        id: 'test-1',
        title: 'Test',
        description: 'Description',
        instructions: 'follow_steps.pdf'
      };

      viewer.setAssignment(assignment);

      const instructionsButton = container.querySelector('.assignment-instructions-button');
      expect(instructionsButton).toBeTruthy();
      expect(instructionsButton.getAttribute('href')).toBe('instructions/follow_steps.pdf');
      expect(instructionsButton.getAttribute('target')).toBe('_blank');
      expect(instructionsButton.textContent).toContain('Open Instructions PDF');
      expect(instructionsButton.textContent).toContain('Opens in a new tab');
    });

    it('should not render an instructions heading block', () => {
      const assignment = {
        id: 'test-1',
        title: 'Test',
        description: 'Description',
        instructions: 'test.pdf'
      };

      viewer.setAssignment(assignment);

      expect(container.querySelector('.assignment-viewer-instructions-heading')).toBeFalsy();
      expect(container.textContent).not.toContain('Instructions\n');
    });

    it('should handle assignment without description', () => {
      const assignment = {
        id: 'test-1',
        title: 'Test',
        instructions: 'instructions_only.pdf'
      };

      viewer.setAssignment(assignment);

      const description = container.querySelector('.assignment-viewer-description');
      expect(description).toBeFalsy();
      expect(container.querySelector('.assignment-viewer-title')).toBeTruthy();
    });

    it('should handle assignment without instructions file', () => {
      const assignment = {
        id: 'test-1',
        title: 'Test',
        description: 'Description only'
      };

      viewer.setAssignment(assignment);

      expect(container.querySelector('.assignment-instructions-button')).toBeFalsy();
      expect(container.querySelector('.assignment-viewer-title')).toBeTruthy();
    });

    it('should display Untitled Assignment when title is missing', () => {
      const assignment = {
        id: 'test-1',
        description: 'No title',
        instructions: 'instructions.pdf'
      };

      viewer.setAssignment(assignment);

      const title = container.querySelector('.assignment-viewer-title');
      expect(title.textContent).toBe('Untitled Assignment');
    });

    it('should clear display when assignment is set to null', () => {
      const assignment = {
        id: 'test-1',
        title: 'Test',
        description: 'Description',
        instructions: 'instructions.pdf'
      };

      viewer.setAssignment(assignment);
      expect(container.querySelector('.assignment-viewer-content')).toBeTruthy();

      viewer.setAssignment(null);
      expect(container.querySelector('.assignment-viewer-placeholder')).toBeTruthy();
      expect(container.querySelector('.assignment-viewer-content')).toBeFalsy();
    });
  });

  describe('instructions URL handling', () => {
    it('should build the public instructions URL from a filename', () => {
      expect(viewer.buildInstructionsUrl('hello_world.pdf')).toBe('instructions/hello_world.pdf');
    });

    it('should normalize a leading slash in the instructions filename', () => {
      expect(viewer.buildInstructionsUrl('/hello_world.pdf')).toBe('instructions/hello_world.pdf');
    });

    it('should throw for an invalid instructions filename', () => {
      expect(() => viewer.buildInstructionsUrl('')).toThrow('Instructions filename must be a non-empty string');
      expect(() => viewer.buildInstructionsUrl(null)).toThrow('Instructions filename must be a non-empty string');
    });
  });

  describe('getAssignment', () => {
    beforeEach(() => {
      viewer.initialize(container);
    });

    it('should return the current assignment', () => {
      const assignment = {
        id: 'test-1',
        title: 'Test',
        description: 'Description'
      };

      viewer.setAssignment(assignment);
      expect(viewer.getAssignment()).toBe(assignment);
    });

    it('should return null when no assignment is set', () => {
      expect(viewer.getAssignment()).toBeNull();
    });
  });

  describe('clear', () => {
    beforeEach(() => {
      viewer.initialize(container);
    });

    it('should clear the displayed assignment', () => {
      const assignment = {
        id: 'test-1',
        title: 'Test',
        description: 'Description'
      };

      viewer.setAssignment(assignment);
      expect(viewer.getAssignment()).toBe(assignment);

      viewer.clear();
      expect(viewer.getAssignment()).toBeNull();
      expect(container.querySelector('.assignment-viewer-placeholder')).toBeTruthy();
    });
  });

  describe('dispose', () => {
    it('should clean up resources', () => {
      viewer.initialize(container);
      viewer.setAssignment({ id: 'test-1', title: 'Test' });

      viewer.dispose();

      expect(viewer.container).toBeNull();
      expect(viewer.assignment).toBeNull();
      expect(container.innerHTML).toBe('');
    });
  });

  describe('edge cases', () => {
    beforeEach(() => {
      viewer.initialize(container);
    });

    it('should handle empty strings in assignment fields', () => {
      const assignment = {
        id: 'test-1',
        title: '',
        description: '',
        instructions: ''
      };

      viewer.setAssignment(assignment);

      const title = container.querySelector('.assignment-viewer-title');
      expect(title.textContent).toBe('Untitled Assignment');
      expect(container.querySelector('.assignment-instructions-button')).toBeFalsy();
    });
  });
});
