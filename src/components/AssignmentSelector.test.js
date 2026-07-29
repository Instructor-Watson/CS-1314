/**
 * Unit tests for AssignmentSelector component
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AssignmentSelector } from './AssignmentSelector.js';

describe('AssignmentSelector', () => {
  let selector;
  let container;
  let sampleAssignments;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    selector = new AssignmentSelector();

    sampleAssignments = [
      {
        id: 'hello-world',
        title: 'Hello World',
        description: 'Write a function that returns Hello, World!',
        difficulty: 'beginner',
        topics: ['functions', 'strings'],
        testSuiteFile: 'tests/test_hello_world.py'
      },
      {
        id: 'calculator',
        title: 'Simple Calculator',
        description: 'Create basic arithmetic functions',
        difficulty: 'intermediate',
        topics: ['functions', 'math'],
        testSuiteFile: 'tests/test_calculator.py'
      },
      {
        id: 'list-ops',
        title: 'List Operations',
        description: 'Work with Python lists',
        difficulty: 'beginner',
        topics: ['lists', 'loops'],
        testSuiteFile: 'tests/test_list_ops.py'
      }
    ];
  });

  afterEach(() => {
    selector.dispose();
    document.body.removeChild(container);
  });

  describe('initialization', () => {
    it('should initialize with a container', () => {
      selector.initialize(container);
      expect(selector.container).toBe(container);
    });

    it('should throw error if container is not provided', () => {
      expect(() => selector.initialize(null)).toThrow('Container element is required');
    });

    it('should initialize with assignments', () => {
      selector.initialize(container, sampleAssignments);
      expect(selector.assignments).toEqual(sampleAssignments);
    });

    it('should render a dropdown on initialization', () => {
      selector.initialize(container, sampleAssignments);
      const select = container.querySelector('.assignment-select');
      expect(select).not.toBeNull();
      expect(select.options).toHaveLength(4);
    });
  });

  describe('rendering', () => {
    beforeEach(() => {
      selector.initialize(container, sampleAssignments);
    });

    it('should render a placeholder option first', () => {
      const select = container.querySelector('.assignment-select');
      expect(select.options[0].value).toBe('');
      expect(select.options[0].textContent).toBe('Select an assignment');
    });

    it('should render assignment titles as options', () => {
      const select = container.querySelector('.assignment-select');
      const optionTexts = Array.from(select.options).map(option => option.textContent);

      expect(optionTexts).toEqual([
        'Select an assignment',
        'Hello World',
        'Simple Calculator',
        'List Operations'
      ]);
    });

    it('should disable the dropdown when no assignments are available', () => {
      selector.setAssignments([]);
      const select = container.querySelector('.assignment-select');

      expect(select.disabled).toBe(true);
      expect(select.options).toHaveLength(1);
      expect(select.options[0].textContent).toBe('No assignments available');
    });
  });

  describe('assignment selection', () => {
    beforeEach(() => {
      selector.initialize(container, sampleAssignments);
    });

    it('should select an assignment by ID', () => {
      selector.selectAssignment('hello-world');
      expect(selector.getSelectedAssignmentId()).toBe('hello-world');
    });

    it('should sync the select element when selecting by ID', () => {
      selector.selectAssignment('calculator');
      const select = container.querySelector('.assignment-select');

      expect(select.value).toBe('calculator');
    });

    it('should trigger selection callback when assignment is selected', () => {
      const callback = vi.fn();
      selector.onAssignmentSelect(callback);

      selector.selectAssignment('hello-world');

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(sampleAssignments[0]);
    });

    it('should handle change events on the dropdown', () => {
      const callback = vi.fn();
      selector.onAssignmentSelect(callback);

      const select = container.querySelector('.assignment-select');
      select.value = 'calculator';
      select.dispatchEvent(new Event('change'));

      expect(selector.getSelectedAssignmentId()).toBe('calculator');
      expect(callback).toHaveBeenCalledWith(sampleAssignments[1]);
    });

    it('should clear the selection when the placeholder option is chosen', () => {
      const callback = vi.fn();
      selector.onAssignmentSelect(callback);

      selector.selectAssignment('hello-world');

      const select = container.querySelector('.assignment-select');
      select.value = '';
      select.dispatchEvent(new Event('change'));

      expect(selector.getSelectedAssignmentId()).toBeNull();
      expect(callback).toHaveBeenLastCalledWith(null);
    });

    it('should return selected assignment object', () => {
      selector.selectAssignment('calculator');
      const selected = selector.getSelectedAssignment();
      expect(selected).toEqual(sampleAssignments[1]);
    });

    it('should return null when no assignment is selected', () => {
      expect(selector.getSelectedAssignment()).toBeNull();
    });

    it('should handle selecting non-existent assignment', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      selector.selectAssignment('non-existent');

      expect(consoleSpy).toHaveBeenCalledWith('Assignment with id "non-existent" not found');
      expect(selector.getSelectedAssignmentId()).toBeNull();

      consoleSpy.mockRestore();
    });

    it('should clear selection programmatically', () => {
      selector.selectAssignment('hello-world');
      selector.clearSelection();

      const select = container.querySelector('.assignment-select');
      expect(selector.getSelectedAssignmentId()).toBeNull();
      expect(select.value).toBe('');
    });
  });

  describe('setAssignments', () => {
    beforeEach(() => {
      selector.initialize(container);
    });

    it('should update assignments and re-render', () => {
      selector.setAssignments(sampleAssignments);
      const select = container.querySelector('.assignment-select');
      expect(select.options).toHaveLength(4);
    });

    it('should throw error if assignments is not an array', () => {
      expect(() => selector.setAssignments('not an array')).toThrow('Assignments must be an array');
      expect(() => selector.setAssignments(null)).toThrow('Assignments must be an array');
      expect(() => selector.setAssignments({})).toThrow('Assignments must be an array');
    });

    it('should clear previous assignments', () => {
      selector.setAssignments(sampleAssignments);
      selector.setAssignments([sampleAssignments[0]]);

      const select = container.querySelector('.assignment-select');
      expect(select.options).toHaveLength(2);
      expect(select.options[1].textContent).toBe('Hello World');
    });

    it('should clear an invalid previous selection when assignments change', () => {
      selector.setAssignments(sampleAssignments);
      selector.selectAssignment('calculator');

      selector.setAssignments([sampleAssignments[0]]);

      expect(selector.getSelectedAssignmentId()).toBeNull();
      expect(container.querySelector('.assignment-select').value).toBe('');
    });

    it('should preserve selection state when selected assignment still exists', () => {
      selector.setAssignments(sampleAssignments);
      selector.selectAssignment('calculator');

      selector.setAssignments(sampleAssignments);

      expect(selector.getSelectedAssignmentId()).toBe('calculator');
      expect(container.querySelector('.assignment-select').value).toBe('calculator');
    });
  });

  describe('callback registration', () => {
    it('should register selection callback', () => {
      const callback = vi.fn();
      selector.onAssignmentSelect(callback);
      expect(selector.selectionCallback).toBe(callback);
    });

    it('should throw error if callback is not a function', () => {
      expect(() => selector.onAssignmentSelect('not a function')).toThrow('Callback must be a function');
      expect(() => selector.onAssignmentSelect(null)).toThrow('Callback must be a function');
    });
  });

  describe('dispose', () => {
    it('should clean up resources', () => {
      selector.initialize(container, sampleAssignments);
      selector.selectAssignment('hello-world');

      selector.dispose();

      expect(selector.container).toBeNull();
      expect(selector.assignments).toEqual([]);
      expect(selector.selectedAssignmentId).toBeNull();
      expect(selector.selectionCallback).toBeNull();
      expect(selector.selectElement).toBeNull();
      expect(container.innerHTML).toBe('');
    });
  });
});
