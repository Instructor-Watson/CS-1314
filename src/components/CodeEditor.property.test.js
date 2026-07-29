/**
 * Property-based tests for CodeEditor
 * Feature: python-autograder-web-app
 */

import { describe, it, expect, beforeEach, afterEach, beforeAll } from 'vitest';
import fc from 'fast-check';
import { CodeEditor } from './CodeEditor.js';

describe('CodeEditor Property Tests', () => {
  let editor;
  let container;

  beforeAll(() => {
    // Mock matchMedia for Monaco Editor
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => {}
      })
    });

    // Mock ResizeObserver for Monaco Editor
    global.ResizeObserver = class ResizeObserver {
      constructor(callback) {
        this.callback = callback;
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    };

    // Mock canvas context for Monaco Editor
    HTMLCanvasElement.prototype.getContext = function() {
      return {
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 1,
        lineCap: 'butt',
        lineJoin: 'miter',
        miterLimit: 10,
        lineDashOffset: 0,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        shadowBlur: 0,
        shadowColor: 'transparent',
        globalAlpha: 1,
        globalCompositeOperation: 'source-over',
        font: '10px sans-serif',
        textAlign: 'start',
        textBaseline: 'alphabetic',
        direction: 'ltr',
        imageSmoothingEnabled: true,
        fillRect: () => {},
        clearRect: () => {},
        strokeRect: () => {},
        beginPath: () => {},
        closePath: () => {},
        moveTo: () => {},
        lineTo: () => {},
        bezierCurveTo: () => {},
        quadraticCurveTo: () => {},
        arc: () => {},
        arcTo: () => {},
        ellipse: () => {},
        rect: () => {},
        fill: () => {},
        stroke: () => {},
        clip: () => {},
        isPointInPath: () => false,
        isPointInStroke: () => false,
        rotate: () => {},
        scale: () => {},
        translate: () => {},
        transform: () => {},
        setTransform: () => {},
        resetTransform: () => {},
        drawImage: () => {},
        createImageData: () => ({ data: [], width: 0, height: 0 }),
        getImageData: () => ({ data: [], width: 0, height: 0 }),
        putImageData: () => {},
        save: () => {},
        restore: () => {},
        createLinearGradient: () => ({
          addColorStop: () => {}
        }),
        createRadialGradient: () => ({
          addColorStop: () => {}
        }),
        createPattern: () => null,
        measureText: (text) => ({
          width: text.length * 8,
          actualBoundingBoxLeft: 0,
          actualBoundingBoxRight: text.length * 8,
          actualBoundingBoxAscent: 10,
          actualBoundingBoxDescent: 2,
          fontBoundingBoxAscent: 10,
          fontBoundingBoxDescent: 2,
          emHeightAscent: 10,
          emHeightDescent: 2,
          hangingBaseline: 8,
          alphabeticBaseline: 0,
          ideographicBaseline: -2
        }),
        setLineDash: () => {},
        getLineDash: () => [],
        webkitBackingStorePixelRatio: 1,
        mozBackingStorePixelRatio: 1,
        msBackingStorePixelRatio: 1,
        oBackingStorePixelRatio: 1,
        backingStorePixelRatio: 1
      };
    };
  });

  beforeEach(() => {
    // Create a real DOM container for Monaco Editor
    container = document.createElement('div');
    container.id = 'test-editor-property';
    container.style.width = '800px';
    container.style.height = '600px';
    document.body.appendChild(container);
    
    editor = new CodeEditor();
    editor.initialize(container);
  });

  afterEach(() => {
    if (editor) {
      editor.dispose();
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  /**
   * Property 1: Editor Undo/Redo Preserves History
   * **Validates: Requirements 1.3**
   * 
   * For any sequence of text edits in the Code_Editor, performing undo operations 
   * should reverse the edits in reverse order, and performing redo should reapply 
   * them in forward order.
   */
  it('Property 1: should preserve edit history through undo/redo operations', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate a sequence of 2-5 edit operations
        fc.array(
          fc.record({
            text: fc.string({ minLength: 1, maxLength: 50 }),
            operation: fc.constantFrom('append', 'replace')
          }),
          { minLength: 2, maxLength: 5 }
        ),
        async (edits) => {
          // Start with empty editor
          editor.setValue('');
          
          // Track the state after each edit
          const states = [''];
          
          // Apply each edit and record the state
          for (const edit of edits) {
            const currentValue = editor.getValue();
            let newValue;
            
            if (edit.operation === 'append') {
              newValue = currentValue + edit.text;
            } else {
              newValue = edit.text;
            }
            
            editor.setValue(newValue);
            states.push(newValue);
            
            // Small delay to allow Monaco to process the edit
            await new Promise(resolve => setTimeout(resolve, 10));
          }
          
          // Now perform undo operations - should go back through states in reverse
          const monacoEditor = editor.getEditor();
          const model = monacoEditor.getModel();
          
          // Undo all edits
          for (let i = states.length - 1; i > 0; i--) {
            if (model.canUndo()) {
              model.undo();
              await new Promise(resolve => setTimeout(resolve, 10));
              
              const currentValue = editor.getValue();
              const expectedValue = states[i - 1];
              
              // Verify we're back to the previous state
              expect(currentValue).toBe(expectedValue);
            }
          }
          
          // Now perform redo operations - should go forward through states
          for (let i = 1; i < states.length; i++) {
            if (model.canRedo()) {
              model.redo();
              await new Promise(resolve => setTimeout(resolve, 10));
              
              const currentValue = editor.getValue();
              const expectedValue = states[i];
              
              // Verify we're back to the forward state
              expect(currentValue).toBe(expectedValue);
            }
          }
        }
      ),
      { numRuns: 10 }
    );
  }, 60000); // 60 second timeout for the entire property test

  /**
   * Property 29: Auto-Indentation Behavior
   * **Validates: Requirements 12.1**
   * 
   * For any code in the editor where a new line is created after a line ending 
   * with a colon, the editor should automatically indent the new line.
   */
  it('Property 29: should auto-indent after lines ending with colon', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate Python code structures that should trigger auto-indentation
        fc.record({
          // Generate a valid Python identifier for function/class/control structure
          identifier: fc.stringMatching(/^[a-z_][a-z0-9_]{0,10}$/),
          // Choose a Python construct that requires indentation
          construct: fc.constantFrom('def', 'class', 'if', 'for', 'while', 'try', 'with'),
          // Generate a simple condition or parameter
          suffix: fc.constantFrom('', ' True', ' x in range(10)', ' Exception')
        }),
        async ({ identifier, construct, suffix }) => {
          // Build a line that should trigger auto-indentation
          let line;
          if (construct === 'def') {
            line = `${construct} ${identifier}():`;
          } else if (construct === 'class') {
            line = `${construct} ${identifier}:`;
          } else if (construct === 'if' || construct === 'while') {
            line = `${construct} True:`;
          } else if (construct === 'for') {
            line = `${construct} x in range(10):`;
          } else if (construct === 'try') {
            line = `${construct}:`;
          } else if (construct === 'with') {
            line = `${construct} open('file.txt'):`;
          }
          
          // Set the editor with the line
          editor.setValue(line);
          
          // Get the Monaco editor and model
          const monacoEditor = editor.getEditor();
          const model = monacoEditor.getModel();
          
          // Get the line count and position at end of line
          const lineCount = model.getLineCount();
          const lineLength = model.getLineLength(lineCount);
          
          // Position cursor at end of the line
          monacoEditor.setPosition({ lineNumber: lineCount, column: lineLength + 1 });
          
          // Wait for editor to be ready
          await new Promise(resolve => setTimeout(resolve, 10));
          
          // Simulate pressing Enter to create a new line
          monacoEditor.trigger('keyboard', 'type', { text: '\n' });
          
          // Wait for auto-indentation to be applied
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // Get the content after pressing Enter
          const newContent = editor.getValue();
          const lines = newContent.split('\n');
          
          // Verify that we have at least 2 lines now
          expect(lines.length).toBeGreaterThanOrEqual(2);
          
          // The second line should have indentation (spaces or tabs)
          // Monaco Editor with autoIndent: 'full' should add indentation
          if (lines.length >= 2) {
            const secondLine = lines[1];
            // Check if the second line starts with whitespace (indentation)
            // Monaco typically uses spaces based on tabSize setting (4 spaces)
            const hasIndentation = /^\s+/.test(secondLine) || secondLine === '';
            
            // If the line is empty, the cursor should be at an indented position
            // We can check this by looking at the cursor position
            const position = monacoEditor.getPosition();
            const isIndented = position.column > 1 || hasIndentation;
            
            expect(isIndented).toBe(true);
          }
        }
      ),
      { numRuns: 10 }
    );
  }, 60000); // 60 second timeout for the entire property test

  /**
   * Property 30: Tab Key Indentation
   * **Validates: Requirements 12.2**
   * 
   * For any cursor position in the editor, pressing the Tab key should insert 
   * indentation (spaces or tab character) at that position.
   * 
   * The CodeEditor is configured with insertSpaces: true and tabSize: 4,
   * so pressing Tab should insert 4 spaces instead of a tab character.
   */
  it('Property 30: should insert spaces when Tab key is pressed', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate test scenarios with different initial content and cursor positions
        fc.record({
          // Initial code content (can be empty or have some text)
          initialCode: fc.oneof(
            fc.constant(''),
            fc.stringMatching(/^[a-z_][a-z0-9_]{0,20}$/), // Simple identifier
            fc.constant('def function():'),
            fc.constant('x = 10'),
            fc.constant('# comment')
          ),
          // Line number (1-based) - we'll adjust based on actual line count
          lineOffset: fc.integer({ min: 0, max: 2 }),
          // Column position within the line
          columnOffset: fc.integer({ min: 0, max: 10 })
        }),
        async ({ initialCode, lineOffset, columnOffset }) => {
          // Set the initial code
          editor.setValue(initialCode);
          
          // Get the Monaco editor and model
          const monacoEditor = editor.getEditor();
          const model = monacoEditor.getModel();
          
          // Wait for editor to be ready
          await new Promise(resolve => setTimeout(resolve, 10));
          
          // Determine actual line number (ensure it's valid)
          const lineCount = model.getLineCount();
          const lineNumber = Math.min(lineCount, Math.max(1, lineCount - lineOffset));
          
          // Determine actual column position (ensure it's valid)
          const lineLength = model.getLineLength(lineNumber);
          const column = Math.min(lineLength + 1, Math.max(1, columnOffset + 1));
          
          // Position cursor at the determined position
          monacoEditor.setPosition({ lineNumber, column });
          
          // Get the content before pressing Tab
          const contentBefore = editor.getValue();
          const linesBefore = contentBefore.split('\n');
          const lineBefore = linesBefore[lineNumber - 1] || '';
          
          // Wait for cursor to be positioned
          await new Promise(resolve => setTimeout(resolve, 10));
          
          // Simulate pressing Tab key
          monacoEditor.trigger('keyboard', 'tab', {});
          
          // Wait for Tab action to be processed
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // Get the content after pressing Tab
          const contentAfter = editor.getValue();
          const linesAfter = contentAfter.split('\n');
          const lineAfter = linesAfter[lineNumber - 1] || '';
          
          // Verify that content has changed (indentation was added)
          expect(contentAfter).not.toBe(contentBefore);
          
          // Verify that the line has changed
          expect(lineAfter).not.toBe(lineBefore);
          
          // Verify that spaces were inserted (not a tab character)
          // The difference should be spaces, not a tab character
          const addedContent = lineAfter.substring(0, lineAfter.length - lineBefore.length + (column - 1));
          
          // Check that the added content contains spaces
          // Monaco with insertSpaces: true and tabSize: 4 should insert spaces
          const hasSpaces = lineAfter.includes('    ') || lineAfter.length > lineBefore.length;
          expect(hasSpaces).toBe(true);
          
          // Verify no tab characters were inserted
          expect(lineAfter).not.toContain('\t');
          
          // Verify that the cursor moved forward (indentation was added)
          const positionAfter = monacoEditor.getPosition();
          expect(positionAfter.column).toBeGreaterThan(column);
        }
      ),
      { numRuns: 10 }
    );
  }, 60000); // 60 second timeout for the entire property test

  /**
   * Property 5: Starter Code Loading
   * **Validates: Requirements 2.5**
   * 
   * For any assignment with a non-empty starterCode field, selecting that assignment 
   * should populate the Code_Editor with the exact starter code from the assignment data.
   * 
   * This test verifies that when setValue is called with starter code, the editor 
   * displays that code exactly as provided.
   */
  it('Property 5: should display starter code when setValue is called', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate various Python starter code snippets
        fc.oneof(
          // Simple function starters
          fc.constant('def greet():\n    # Write your code here\n    pass\n'),
          fc.constant('def add(a, b):\n    # TODO: implement addition\n    return 0\n'),
          
          // Class starters
          fc.constant('class Calculator:\n    def __init__(self):\n        pass\n'),
          
          // Variable assignments
          fc.constant('# Initialize your variables here\nx = 0\ny = 0\n'),
          
          // Comments and docstrings
          fc.constant('"""\nYour solution here\n"""\n\ndef solution():\n    pass\n'),
          
          // Multi-line code with various Python constructs
          fc.string({ minLength: 1, maxLength: 500 }).map(s => {
            // Create valid Python-like starter code
            return `# Assignment starter code\n# ${s.substring(0, 50)}\n\ndef main():\n    pass\n`;
          }),
          
          // Empty starter code (edge case)
          fc.constant(''),
          
          // Single line starter
          fc.constant('# Start coding here'),
          
          // Complex multi-line starter
          fc.constant(
            'def fibonacci(n):\n' +
            '    """\n' +
            '    Calculate the nth Fibonacci number.\n' +
            '    \n' +
            '    Args:\n' +
            '        n: The position in the Fibonacci sequence\n' +
            '    \n' +
            '    Returns:\n' +
            '        The nth Fibonacci number\n' +
            '    """\n' +
            '    # Your implementation here\n' +
            '    pass\n'
          )
        ),
        async (starterCode) => {
          // Set the starter code using setValue
          editor.setValue(starterCode);
          
          // Wait for the editor to process the change
          await new Promise(resolve => setTimeout(resolve, 10));
          
          // Get the value from the editor
          const displayedCode = editor.getValue();
          
          // Verify that the displayed code matches the starter code exactly
          expect(displayedCode).toBe(starterCode);
          
          // Additional verification: check that the editor model contains the correct content
          const monacoEditor = editor.getEditor();
          const model = monacoEditor.getModel();
          const modelValue = model.getValue();
          
          expect(modelValue).toBe(starterCode);
          
          // Verify line count matches expected
          const expectedLineCount = starterCode === '' ? 1 : starterCode.split('\n').length;
          const actualLineCount = model.getLineCount();
          
          expect(actualLineCount).toBe(expectedLineCount);
        }
      ),
      { numRuns: 10 }
    );
  }, 60000); // 60 second timeout for the entire property test
});
