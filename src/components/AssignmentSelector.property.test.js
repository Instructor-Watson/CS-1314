/**
 * Property-based tests for AssignmentSelector
 * Feature: python-autograder-web-app
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { AssignmentSelector } from './AssignmentSelector.js';

describe('AssignmentSelector Property Tests', () => {
  let selector;
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'test-assignment-selector-property';
    document.body.appendChild(container);

    selector = new AssignmentSelector();
  });

  afterEach(() => {
    if (selector) {
      selector.dispose();
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  it('Property 4: should select assignments through the dropdown and preserve their data', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.stringMatching(/^[a-z0-9-]{3,20}$/),
            title: fc.string({ minLength: 5, maxLength: 50 }),
            description: fc.string({ minLength: 10, maxLength: 200 }),
            instructions: fc.string({ minLength: 20, maxLength: 500 }),
            starterCode: fc.option(fc.string({ minLength: 0, maxLength: 100 }), { nil: '' }),
            testSuiteFile: fc.stringMatching(/^tests\/test_[a-z0-9_]+\.py$/),
            difficulty: fc.constantFrom('beginner', 'intermediate', 'advanced'),
            topics: fc.array(fc.string({ minLength: 3, maxLength: 15 }), { minLength: 1, maxLength: 5 })
          }),
          { minLength: 1, maxLength: 10 }
        ).chain(assignments => {
          const uniqueAssignments = [];
          const seenIds = new Set();
          for (const assignment of assignments) {
            if (!seenIds.has(assignment.id)) {
              seenIds.add(assignment.id);
              uniqueAssignments.push(assignment);
            }
          }
          return fc.constant(uniqueAssignments);
        }).filter(assignments => assignments.length > 0),
        fc.integer({ min: 0, max: 100 }),
        (assignments, indexSeed) => {
          selector.initialize(container, assignments);

          const selectedIndex = indexSeed % assignments.length;
          const selectedAssignment = assignments[selectedIndex];

          selector.selectAssignment(selectedAssignment.id);

          const returnedAssignment = selector.getSelectedAssignment();
          const selectElement = container.querySelector('.assignment-select');
          const optionValues = Array.from(selectElement.options).map(option => option.value);

          expect(returnedAssignment).not.toBeNull();
          expect(returnedAssignment.id).toBe(selectedAssignment.id);
          expect(returnedAssignment.title).toBe(selectedAssignment.title);
          expect(returnedAssignment.description).toBe(selectedAssignment.description);
          expect(returnedAssignment.instructions).toBe(selectedAssignment.instructions);
          expect(selectElement.value).toBe(selectedAssignment.id);
          expect(optionValues).toContain(selectedAssignment.id);
        }
      ),
      { numRuns: 10 }
    );
  });

  it('Property 27: should support clearing the dropdown selection back to the placeholder state', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.stringMatching(/^[a-z0-9-]{3,20}$/),
            title: fc.string({ minLength: 5, maxLength: 50 }),
            description: fc.string({ minLength: 10, maxLength: 200 }),
            instructions: fc.string({ minLength: 20, maxLength: 500 }),
            testSuiteFile: fc.stringMatching(/^tests\/test_[a-z0-9_]+\.py$/)
          }),
          { minLength: 1, maxLength: 10 }
        ).chain(assignments => {
          const uniqueAssignments = [];
          const seenIds = new Set();
          for (const assignment of assignments) {
            if (!seenIds.has(assignment.id)) {
              seenIds.add(assignment.id);
              uniqueAssignments.push(assignment);
            }
          }
          return fc.constant(uniqueAssignments);
        }).filter(assignments => assignments.length > 0),
        fc.integer({ min: 0, max: 100 }),
        (assignments, indexSeed) => {
          selector.initialize(container, assignments);

          const selectedIndex = indexSeed % assignments.length;
          const selectedAssignment = assignments[selectedIndex];

          selector.selectAssignment(selectedAssignment.id);
          selector.clearSelection();

          const selectElement = container.querySelector('.assignment-select');

          expect(selector.getSelectedAssignmentId()).toBeNull();
          expect(selector.getSelectedAssignment()).toBeNull();
          expect(selectElement.value).toBe('');
          expect(selectElement.options[0].textContent).toBe('Select an assignment');
        }
      ),
      { numRuns: 10 }
    );
  });
});
