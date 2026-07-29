/**
 * Integration tests for complete workflows
 *
 * These tests verify that all components work together correctly in realistic scenarios.
 *
 * Requirements: 2.1, 2.2, 2.3, 3.1, 4.1, 6.1
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PyodideManager } from './core/PyodideManager.js';
import { AutograderEngine } from './core/AutograderEngine.js';
import { FeedbackGenerator } from './core/FeedbackGenerator.js';
import { AssignmentLoader } from './core/AssignmentLoader.js';
import { SessionManager } from './core/SessionManager.js';
import { AssignmentSelector } from './components/AssignmentSelector.js';
import { AssignmentViewer } from './components/AssignmentViewer.js';
import { SubmitButton } from './components/SubmitButton.js';
import { ResultsPanel } from './components/ResultsPanel.js';
import { FeedbackDisplay } from './components/FeedbackDisplay.js';

describe('Integration Tests - Complete Workflows', () => {
  let pyodideManager;
  let autograderEngine;
  let feedbackGenerator;
  let assignmentLoader;
  let sessionManager;
  let assignmentSelector;
  let assignmentViewer;
  let submitButton;
  let resultsPanel;
  let feedbackDisplay;

  let assignmentListContainer;
  let assignmentDetailsContainer;
  let submitButtonContainer;
  let resultsPanelContainer;
  let feedbackDisplayContainer;

  const sampleAssignments = [
    {
      id: 'hello-world',
      title: 'Hello World',
      description: 'Write a function that returns Hello, World!',
      instructions: 'hello_world_assignment_instructions.pdf',
      starterCode: 'hello_world_assignment_template.py',
      testSuiteFile: '/data/tests/test_hello_world.py'
    }
  ];

  const helloWorldTestSuite = `
import unittest

class TestHelloWorld(unittest.TestCase):
    def test_greet_returns_hello_world(self):
        """Test that greet() returns 'Hello, World!'"""
        result = greet()
        self.assertEqual(result, "Hello, World!")
    
    def test_greet_returns_string(self):
        """Test that greet() returns a string"""
        result = greet()
        self.assertIsInstance(result, str)
`;

  beforeEach(async () => {
    assignmentListContainer = document.createElement('div');
    assignmentListContainer.id = 'assignment-list';
    document.body.appendChild(assignmentListContainer);

    assignmentDetailsContainer = document.createElement('div');
    assignmentDetailsContainer.id = 'assignment-details';
    document.body.appendChild(assignmentDetailsContainer);

    submitButtonContainer = document.createElement('div');
    submitButtonContainer.id = 'submit-button-container';
    document.body.appendChild(submitButtonContainer);

    resultsPanelContainer = document.createElement('div');
    resultsPanelContainer.id = 'results-panel';
    document.body.appendChild(resultsPanelContainer);

    feedbackDisplayContainer = document.createElement('div');
    feedbackDisplayContainer.id = 'feedback-display';
    document.body.appendChild(feedbackDisplayContainer);

    pyodideManager = new PyodideManager();
    await pyodideManager.initialize();

    autograderEngine = new AutograderEngine(pyodideManager);
    feedbackGenerator = new FeedbackGenerator();
    sessionManager = new SessionManager();

    assignmentLoader = new AssignmentLoader();
    vi.spyOn(assignmentLoader, 'loadAssignments').mockResolvedValue(sampleAssignments);

    assignmentSelector = new AssignmentSelector();
    assignmentSelector.initialize(assignmentListContainer, sampleAssignments);

    assignmentViewer = new AssignmentViewer();
    assignmentViewer.initialize(assignmentDetailsContainer);

    submitButton = new SubmitButton();
    submitButton.initialize(submitButtonContainer, { label: 'Run Tests' });
    submitButton.enable();

    resultsPanel = new ResultsPanel();
    resultsPanel.initialize(resultsPanelContainer);

    feedbackDisplay = new FeedbackDisplay();
    feedbackDisplay.initialize(feedbackDisplayContainer);
  }, 30000);

  afterEach(() => {
    if (assignmentSelector) assignmentSelector.dispose();
    if (assignmentViewer) assignmentViewer.dispose();
    if (submitButton) submitButton.dispose();
    if (resultsPanel) resultsPanel.dispose();
    if (feedbackDisplay) feedbackDisplay.dispose();

    [
      assignmentListContainer,
      assignmentDetailsContainer,
      submitButtonContainer,
      resultsPanelContainer,
      feedbackDisplayContainer
    ].forEach(container => {
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }
    });

    sessionManager.clearAll();
  });

  describe('Complete Assignment Selection to Result Display Flow', () => {
    it('should complete full workflow: select assignment, submit code, view results', async () => {
      assignmentSelector.selectAssignment('hello-world');
      const selectedAssignment = assignmentSelector.getSelectedAssignment();
      expect(selectedAssignment).toBeTruthy();
      expect(selectedAssignment.id).toBe('hello-world');

      assignmentViewer.setAssignment(selectedAssignment);
      expect(assignmentViewer.getAssignment()).toEqual(selectedAssignment);
      expect(assignmentDetailsContainer.querySelector('.assignment-instructions-button')).toBeTruthy();

      const correctCode = `
def greet():
    return "Hello, World!"
`;

      sessionManager.saveCode(selectedAssignment.id, correctCode);
      expect(sessionManager.loadCode(selectedAssignment.id)).toBe(correctCode);

      submitButton.setLoading(true);
      const gradeResult = await autograderEngine.gradeSubmission(
        correctCode,
        helloWorldTestSuite,
        selectedAssignment.id
      );
      submitButton.setLoading(false);

      expect(gradeResult.totalTests).toBe(2);
      expect(gradeResult.passedTests).toBe(2);
      expect(gradeResult.failedTests).toBe(0);

      resultsPanel.displayResults(gradeResult);
      expect(resultsPanel.hasResults()).toBe(true);

      const summaryElement = resultsPanelContainer.querySelector('.results-summary');
      expect(summaryElement).toBeTruthy();
      expect(summaryElement.classList.contains('all-passed')).toBe(true);

      const successMessage = resultsPanelContainer.querySelector('.success-message');
      expect(successMessage).toBeTruthy();
      expect(successMessage.textContent).toContain('All tests passed');
    }, 15000);

    it('should handle workflow with failing tests and display feedback', async () => {
      assignmentSelector.selectAssignment('hello-world');
      const selectedAssignment = assignmentSelector.getSelectedAssignment();

      assignmentViewer.setAssignment(selectedAssignment);

      const incorrectCode = `
def greet():
    return "Goodbye"
`;
      sessionManager.saveCode(selectedAssignment.id, incorrectCode);

      submitButton.setLoading(true);
      const gradeResult = await autograderEngine.gradeSubmission(
        incorrectCode,
        helloWorldTestSuite,
        selectedAssignment.id
      );
      submitButton.setLoading(false);

      expect(gradeResult.totalTests).toBe(2);
      expect(gradeResult.passedTests).toBe(1);
      expect(gradeResult.failedTests).toBe(1);

      resultsPanel.displayResults(gradeResult);

      const failedTest = gradeResult.testCases.find(tc => !tc.passed);
      expect(failedTest).toBeTruthy();

      const feedback = feedbackGenerator.generateFeedback(failedTest);
      feedbackDisplay.displayFeedback(feedback);

      expect(feedbackDisplay.hasFeedback()).toBe(true);
      expect(feedbackDisplayContainer.querySelector('.feedback-display')).toBeTruthy();
    }, 15000);
  });

  describe('Error Handling Paths', () => {
    it('should handle syntax errors gracefully', async () => {
      assignmentSelector.selectAssignment('hello-world');
      const assignment = assignmentSelector.getSelectedAssignment();
      assignmentViewer.setAssignment(assignment);

      const syntaxErrorCode = `
def greet()
    return "Hello"  # Missing colon
`;

      submitButton.setLoading(true);
      const gradeResult = await autograderEngine.gradeSubmission(
        syntaxErrorCode,
        helloWorldTestSuite,
        assignment.id
      );
      submitButton.setLoading(false);

      expect(gradeResult.totalTests).toBe(0);
      expect(gradeResult.error).toBeTruthy();
      expect(gradeResult.syntaxError).toBeTruthy();

      const feedback = feedbackGenerator.generateSyntaxErrorFeedback(gradeResult.syntaxError);
      feedbackDisplay.displayFeedback(feedback);

      expect(feedbackDisplay.hasFeedback()).toBe(true);
      const feedbackElement = feedbackDisplayContainer.querySelector('.feedback-display');
      expect(feedbackElement).toBeTruthy();
      expect(feedbackElement.textContent).toContain('Syntax');
    }, 15000);

    it('should handle empty code submission', async () => {
      assignmentSelector.selectAssignment('hello-world');
      const assignment = assignmentSelector.getSelectedAssignment();
      assignmentViewer.setAssignment(assignment);

      const emptyCode = '';

      await expect(
        autograderEngine.gradeSubmission(emptyCode, helloWorldTestSuite, assignment.id)
      ).rejects.toThrow('Student code cannot be empty');
    });
  });

  describe('State Management Across Components', () => {
    it('should maintain consistent state when switching between assignments', async () => {
      expect(assignmentSelector.getSelectedAssignmentId()).toBeNull();
      expect(assignmentViewer.getAssignment()).toBeNull();
      expect(resultsPanel.hasResults()).toBe(false);

      assignmentSelector.selectAssignment('hello-world');
      const assignment1 = assignmentSelector.getSelectedAssignment();
      assignmentViewer.setAssignment(assignment1);

      expect(assignmentSelector.getSelectedAssignmentId()).toBe('hello-world');
      expect(assignmentViewer.getAssignment().id).toBe('hello-world');

      const code1 = 'def greet():\n    return "Hello"';
      sessionManager.saveCode(assignment1.id, code1);

      submitButton.setLoading(true);
      const result1 = await autograderEngine.gradeSubmission(
        code1,
        helloWorldTestSuite,
        assignment1.id
      );
      submitButton.setLoading(false);
      resultsPanel.displayResults(result1);

      expect(resultsPanel.hasResults()).toBe(true);

      resultsPanel.clearResults();

      expect(resultsPanel.hasResults()).toBe(false);

      const savedCode1 = sessionManager.loadCode('hello-world');
      expect(savedCode1).toBe(code1);
    }, 15000);

    it('should handle submit button state changes correctly', async () => {
      expect(submitButton.isButtonEnabled()).toBe(true);
      expect(submitButton.isButtonLoading()).toBe(false);

      assignmentSelector.selectAssignment('hello-world');
      const assignment = assignmentSelector.getSelectedAssignment();
      const code = 'def greet():\n    return "Hello, World!"';

      submitButton.setLoading(true);
      submitButton.setStatusMessage('Running tests...');

      expect(submitButton.isButtonLoading()).toBe(true);
      expect(submitButton.button.disabled).toBe(true);

      await autograderEngine.gradeSubmission(
        code,
        helloWorldTestSuite,
        assignment.id
      );

      submitButton.setLoading(false);
      submitButton.clearStatusMessage();

      expect(submitButton.isButtonLoading()).toBe(false);
      expect(submitButton.button.disabled).toBe(false);
    }, 15000);
  });
});
