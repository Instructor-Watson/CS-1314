/**
 * Unit tests for SubmitButton component
 * Requirements: 3.6, 14.3
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SubmitButton } from './SubmitButton.js';

describe('SubmitButton', () => {
  let button;
  let container;

  beforeEach(() => {
    // Create a mock container element
    container = document.createElement('div');
    container.id = 'test-submit-button';
    document.body.appendChild(container);
    
    button = new SubmitButton();
  });

  afterEach(() => {
    if (button) {
      button.dispose();
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe('initialization', () => {
    it('should initialize with a container element', () => {
      button.initialize(container);
      expect(button.container).toBe(container);
      expect(button.button).toBeDefined();
    });

    it('should throw error if container is not provided', () => {
      expect(() => button.initialize(null)).toThrow('Container element is required');
    });

    it('should render button with default label', () => {
      button.initialize(container);
      expect(button.button.textContent).toBe('Submit Code');
    });

    it('should render button with custom label', () => {
      button.initialize(container, { label: 'Run Tests' });
      expect(button.button.textContent).toBe('Run Tests');
    });

    it('should start with button disabled by default', () => {
      button.initialize(container);
      expect(button.button.disabled).toBe(true);
      expect(button.isEnabled).toBe(false);
    });
  });

  describe('enable and disable', () => {
    beforeEach(() => {
      button.initialize(container);
    });

    it('should enable the button', () => {
      button.enable();
      expect(button.isEnabled).toBe(true);
      expect(button.button.disabled).toBe(false);
    });

    it('should disable the button', () => {
      button.enable();
      button.disable();
      expect(button.isEnabled).toBe(false);
      expect(button.button.disabled).toBe(true);
    });

    it('should handle enable when button is already enabled', () => {
      button.enable();
      button.enable();
      expect(button.isEnabled).toBe(true);
      expect(button.button.disabled).toBe(false);
    });

    it('should handle disable when button is already disabled', () => {
      button.disable();
      button.disable();
      expect(button.isEnabled).toBe(false);
      expect(button.button.disabled).toBe(true);
    });
  });

  describe('loading state', () => {
    beforeEach(() => {
      button.initialize(container);
      button.enable();
    });

    it('should set loading state to true', () => {
      button.setLoading(true);
      expect(button.isLoading).toBe(true);
      expect(button.button.classList.contains('loading')).toBe(true);
      expect(button.button.disabled).toBe(true);
    });

    it('should set loading state to false', () => {
      button.setLoading(true);
      button.setLoading(false);
      expect(button.isLoading).toBe(false);
      expect(button.button.classList.contains('loading')).toBe(false);
      expect(button.button.disabled).toBe(false);
    });

    it('should disable button when loading even if enabled', () => {
      button.enable();
      button.setLoading(true);
      expect(button.button.disabled).toBe(true);
    });

    it('should restore enabled state after loading completes', () => {
      button.enable();
      button.setLoading(true);
      button.setLoading(false);
      expect(button.button.disabled).toBe(false);
    });

    it('should keep button disabled after loading if not enabled', () => {
      button.disable();
      button.setLoading(true);
      button.setLoading(false);
      expect(button.button.disabled).toBe(true);
    });
  });

  describe('status message', () => {
    beforeEach(() => {
      button.initialize(container);
    });

    it('should set status message', () => {
      button.setStatusMessage('Executing code...');
      expect(button.statusMessage).toBe('Executing code...');
      
      const statusElement = container.querySelector('.submit-status');
      expect(statusElement).toBeDefined();
      expect(statusElement.textContent).toBe('Executing code...');
    });

    it('should clear status message', () => {
      button.setStatusMessage('Executing code...');
      button.clearStatusMessage();
      expect(button.statusMessage).toBe('');
      
      const statusElement = container.querySelector('.submit-status');
      expect(statusElement).toBeNull();
    });

    it('should update status message', () => {
      button.setStatusMessage('Executing code...');
      button.setStatusMessage('Tests completed');
      expect(button.statusMessage).toBe('Tests completed');
      
      const statusElement = container.querySelector('.submit-status');
      expect(statusElement.textContent).toBe('Tests completed');
    });

    it('should handle empty string status message', () => {
      button.setStatusMessage('');
      expect(button.statusMessage).toBe('');
      
      const statusElement = container.querySelector('.submit-status');
      expect(statusElement).toBeNull();
    });

    it('should handle null status message', () => {
      button.setStatusMessage(null);
      expect(button.statusMessage).toBe('');
    });
  });

  describe('submit callback', () => {
    beforeEach(() => {
      button.initialize(container);
      button.enable();
    });

    it('should register a submit callback', () => {
      const callback = vi.fn();
      button.onSubmit(callback);
      expect(button.submitCallback).toBe(callback);
    });

    it('should call submit callback when button is clicked', () => {
      const callback = vi.fn();
      button.onSubmit(callback);
      
      button.button.click();
      
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should not call callback when button is disabled', () => {
      const callback = vi.fn();
      button.onSubmit(callback);
      button.disable();
      
      button.button.click();
      
      expect(callback).not.toHaveBeenCalled();
    });

    it('should not call callback when button is loading', () => {
      const callback = vi.fn();
      button.onSubmit(callback);
      button.setLoading(true);
      
      button.button.click();
      
      expect(callback).not.toHaveBeenCalled();
    });

    it('should throw error if callback is not a function', () => {
      expect(() => button.onSubmit('not a function')).toThrow('Callback must be a function');
      expect(() => button.onSubmit(null)).toThrow('Callback must be a function');
      expect(() => button.onSubmit(123)).toThrow('Callback must be a function');
    });

    it('should handle multiple clicks', () => {
      const callback = vi.fn();
      button.onSubmit(callback);
      
      button.button.click();
      button.button.click();
      button.button.click();
      
      expect(callback).toHaveBeenCalledTimes(3);
    });
  });

  describe('state getters', () => {
    beforeEach(() => {
      button.initialize(container);
    });

    it('should return enabled state', () => {
      expect(button.isButtonEnabled()).toBe(false);
      button.enable();
      expect(button.isButtonEnabled()).toBe(true);
    });

    it('should return loading state', () => {
      expect(button.isButtonLoading()).toBe(false);
      button.setLoading(true);
      expect(button.isButtonLoading()).toBe(true);
    });
  });

  describe('Pyodide integration scenarios', () => {
    beforeEach(() => {
      button.initialize(container);
    });

    it('should be disabled when Pyodide is not ready', () => {
      // Simulating Pyodide not ready
      button.disable();
      expect(button.button.disabled).toBe(true);
    });

    it('should be enabled when Pyodide is ready', () => {
      // Simulating Pyodide ready
      button.enable();
      expect(button.button.disabled).toBe(false);
    });

    it('should show loading state during code execution', () => {
      button.enable();
      button.setLoading(true);
      button.setStatusMessage('Executing code...');
      
      expect(button.button.disabled).toBe(true);
      expect(button.button.classList.contains('loading')).toBe(true);
      expect(button.statusMessage).toBe('Executing code...');
    });

    it('should restore state after execution completes', () => {
      button.enable();
      button.setLoading(true);
      button.setStatusMessage('Executing code...');
      
      // Execution completes
      button.setLoading(false);
      button.setStatusMessage('Execution complete');
      
      expect(button.button.disabled).toBe(false);
      expect(button.button.classList.contains('loading')).toBe(false);
      expect(button.statusMessage).toBe('Execution complete');
    });
  });

  describe('dispose', () => {
    beforeEach(() => {
      button.initialize(container);
    });

    it('should dispose the button and clean up resources', () => {
      button.dispose();
      expect(button.button).toBeNull();
      expect(button.container).toBeNull();
      expect(button.isEnabled).toBe(false);
      expect(button.isLoading).toBe(false);
      expect(button.statusMessage).toBe('');
      expect(button.submitCallback).toBeNull();
    });

    it('should clear container content on dispose', () => {
      button.dispose();
      expect(container.innerHTML).toBe('');
    });

    it('should handle dispose when button is not initialized', () => {
      const uninitializedButton = new SubmitButton();
      expect(() => uninitializedButton.dispose()).not.toThrow();
    });
  });

  describe('requirement validation', () => {
    beforeEach(() => {
      button.initialize(container);
    });

    it('should trigger code submission on click (Requirement 3.6)', () => {
      const callback = vi.fn();
      button.onSubmit(callback);
      button.enable();
      
      button.button.click();
      
      expect(callback).toHaveBeenCalled();
    });

    it('should show loading state during execution (Requirement 3.6)', () => {
      button.setLoading(true);
      expect(button.button.classList.contains('loading')).toBe(true);
    });

    it('should disable button when Pyodide is not ready (Requirement 14.3)', () => {
      button.disable();
      expect(button.button.disabled).toBe(true);
    });

    it('should disable button when executing (Requirement 14.3)', () => {
      button.enable();
      button.setLoading(true);
      expect(button.button.disabled).toBe(true);
    });

    it('should display execution status messages (Requirement 3.6)', () => {
      button.setStatusMessage('Running tests...');
      const statusElement = container.querySelector('.submit-status');
      expect(statusElement.textContent).toBe('Running tests...');
    });

    it('should provide callback mechanism for submission events (Requirement 3.6)', () => {
      const callback = vi.fn();
      button.onSubmit(callback);
      expect(button.submitCallback).toBe(callback);
    });
  });
});
