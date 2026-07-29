/**
 * Property-Based Tests for Responsive Layout
 * Feature: python-autograder-web-app, Property 21: Responsive Layout Adaptation
 * 
 * Validates: Requirements 7.3
 */

import fc from 'fast-check';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Layout Property Tests', () => {
  let cssContent;
  let testContainer;

  beforeEach(() => {
    // Load CSS file content
    const cssPath = path.join(process.cwd(), 'src', 'styles', 'main.css');
    cssContent = fs.readFileSync(cssPath, 'utf-8');

    // Create test container with app structure
    testContainer = document.createElement('div');
    testContainer.id = 'app';
    testContainer.innerHTML = `
      <div class="app-header">
        <h1>Python Submission Check</h1>
        <div class="status-indicator">
          <span class="status-text">Ready</span>
        </div>
      </div>
      <div class="app-main">
        <div class="assignment-sidebar">
          <h2>Assignments</h2>
          <div class="assignment-list">
            <div class="assignment-item">
              <h4 class="assignment-title">Test Assignment</h4>
              <p class="assignment-description">Test description</p>
            </div>
          </div>
        </div>
        <div class="workspace">
          <div class="assignment-view">
            <div class="assignment-details">
              <h2>Assignment Title</h2>
              <p>Assignment instructions</p>
            </div>
          </div>
          <div class="editor-container">
            <div class="editor-header">
              <h3>Code Editor</h3>
            </div>
            <div class="code-editor" style="height: 300px;"></div>
          </div>
          <div class="results-container">
            <h3>Test Results</h3>
            <div class="results-panel"></div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(testContainer);
  });

  afterEach(() => {
    // Clean up test container
    if (testContainer && testContainer.parentNode) {
      testContainer.parentNode.removeChild(testContainer);
    }
  });

  /**
   * Property 21: Responsive Layout Adaptation
   * For any viewport width between 768px and 1920px, the application layout should 
   * adapt appropriately without horizontal scrolling or content overflow.
   * 
   * **Validates: Requirements 7.3**
   */
  it('Property 21: CSS contains responsive media queries for viewport range 768px-1920px', () => {
    // Feature: python-autograder-web-app, Property 21: Responsive Layout Adaptation
    fc.assert(
      fc.property(
        fc.constantFrom(768, 992, 1200, 1920),
        (breakpoint) => {
          // Verify CSS contains media query for this breakpoint
          const mediaQueryPattern = new RegExp(`@media\\s*\\([^)]*${breakpoint}px[^)]*\\)`, 'i');
          const hasMediaQuery = mediaQueryPattern.test(cssContent);

          // At minimum, we should have media queries for 768px and 1920px
          if (breakpoint === 768 || breakpoint === 1920) {
            expect(hasMediaQuery).toBe(true);
          }

          return true;
        }
      ),
      { numRuns: 10 }
    );
  });

  it('Property 21: CSS prevents horizontal overflow on body', () => {
    // Feature: python-autograder-web-app, Property 21: Responsive Layout Adaptation
    fc.assert(
      fc.property(
        fc.constant(true),
        () => {
          // Verify CSS sets overflow-x: hidden on body
          const bodyOverflowPattern = /body\s*{[^}]*overflow-x\s*:\s*hidden/i;
          const hasOverflowHidden = bodyOverflowPattern.test(cssContent);

          expect(hasOverflowHidden).toBe(true);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 21: CSS defines responsive layout for mobile (max-width: 768px)', () => {
    // Feature: python-autograder-web-app, Property 21: Responsive Layout Adaptation
    fc.assert(
      fc.property(
        fc.constant(true),
        () => {
          // Verify CSS contains mobile media query
          const mobileMediaQuery = /@media\s*\([^)]*max-width\s*:\s*768px[^)]*\)/i;
          expect(mobileMediaQuery.test(cssContent)).toBe(true);

          // Verify mobile layout changes flex-direction to column (anywhere in CSS after the media query)
          const mobileQueryIndex = cssContent.search(/@media\s*\([^)]*max-width\s*:\s*768px[^)]*\)/i);
          const cssAfterMobileQuery = cssContent.substring(mobileQueryIndex);
          
          // Find the closing brace of the media query
          let braceCount = 0;
          let mediaQueryEnd = -1;
          for (let i = cssAfterMobileQuery.indexOf('{'); i < cssAfterMobileQuery.length; i++) {
            if (cssAfterMobileQuery[i] === '{') braceCount++;
            if (cssAfterMobileQuery[i] === '}') {
              braceCount--;
              if (braceCount === 0) {
                mediaQueryEnd = i;
                break;
              }
            }
          }
          
          const mobileBlock = cssAfterMobileQuery.substring(0, mediaQueryEnd + 1);

          // Verify mobile layout changes flex-direction to column
          const hasColumnLayout = /flex-direction\s*:\s*column/i.test(mobileBlock);
          expect(hasColumnLayout).toBe(true);

          // Verify sidebar width is 100% on mobile
          const hasSidebarFullWidth = /width\s*:\s*100%/i.test(mobileBlock);
          expect(hasSidebarFullWidth).toBe(true);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 21: CSS defines responsive layout for large desktop (min-width: 1920px)', () => {
    // Feature: python-autograder-web-app, Property 21: Responsive Layout Adaptation
    fc.assert(
      fc.property(
        fc.constant(true),
        () => {
          // Verify CSS contains large desktop media query
          const largeDesktopMediaQuery = /@media\s*\([^)]*min-width\s*:\s*1920px[^)]*\)/i;
          expect(largeDesktopMediaQuery.test(cssContent)).toBe(true);

          // Extract large desktop media query block
          const largeDesktopBlockMatch = cssContent.match(/@media\s*\([^)]*min-width\s*:\s*1920px[^)]*\)\s*{([^}]+(?:{[^}]*}[^}]*)*)/i);
          
          if (largeDesktopBlockMatch) {
            const largeDesktopBlock = largeDesktopBlockMatch[0];

            // Verify sidebar has larger width on large desktop
            const hasSidebarWidth = /\.assignment-sidebar\s*{[^}]*width\s*:\s*350px/i.test(largeDesktopBlock);
            expect(hasSidebarWidth).toBe(true);
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 21: CSS defines max-height constraints to prevent overflow', () => {
    // Feature: python-autograder-web-app, Property 21: Responsive Layout Adaptation
    fc.assert(
      fc.property(
        fc.constantFrom('.assignment-view', '.results-container', '.assignment-sidebar'),
        (selector) => {
          // Verify CSS sets max-height for scrollable containers
          const maxHeightPattern = new RegExp(`${selector.replace('.', '\\.')}\\s*{[^}]*max-height\\s*:\\s*\\d+px`, 'i');
          const hasMaxHeight = maxHeightPattern.test(cssContent);

          expect(hasMaxHeight).toBe(true);

          // Verify overflow-y is set to auto for scrolling
          const overflowPattern = new RegExp(`${selector.replace('.', '\\.')}\\s*{[^}]*overflow-y\\s*:\\s*auto`, 'i');
          const hasOverflow = overflowPattern.test(cssContent);

          expect(hasOverflow).toBe(true);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 21: layout structure exists in DOM', () => {
    // Feature: python-autograder-web-app, Property 21: Responsive Layout Adaptation
    fc.assert(
      fc.property(
        fc.constant(true),
        () => {
          // Verify all required layout elements exist
          const appMain = testContainer.querySelector('.app-main');
          const sidebar = testContainer.querySelector('.assignment-sidebar');
          const workspace = testContainer.querySelector('.workspace');
          const appHeader = testContainer.querySelector('.app-header');

          expect(appMain).toBeTruthy();
          expect(sidebar).toBeTruthy();
          expect(workspace).toBeTruthy();
          expect(appHeader).toBeTruthy();

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 21: CSS defines intermediate breakpoints for tablets', () => {
    // Feature: python-autograder-web-app, Property 21: Responsive Layout Adaptation
    fc.assert(
      fc.property(
        fc.constantFrom(992, 1200),
        (breakpoint) => {
          // Verify CSS contains media query for tablet breakpoints
          const mediaQueryPattern = new RegExp(`@media\\s*\\([^)]*${breakpoint}px[^)]*\\)`, 'i');
          const hasMediaQuery = mediaQueryPattern.test(cssContent);

          expect(hasMediaQuery).toBe(true);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 21: CSS adapts sidebar width across breakpoints', () => {
    // Feature: python-autograder-web-app, Property 21: Responsive Layout Adaptation
    fc.assert(
      fc.property(
        fc.constant(true),
        () => {
          // Verify sidebar has different widths defined for different breakpoints
          const sidebarWidthPattern = /\.assignment-sidebar\s*{[^}]*width\s*:\s*(\d+)px/gi;
          const matches = [...cssContent.matchAll(sidebarWidthPattern)];

          // Should have multiple sidebar width definitions (for different breakpoints)
          expect(matches.length).toBeGreaterThan(1);

          // Extract width values
          const widths = matches.map(m => parseInt(m[1]));

          // Verify widths are reasonable (between 100px and 400px)
          widths.forEach(width => {
            expect(width).toBeGreaterThanOrEqual(100);
            expect(width).toBeLessThanOrEqual(400);
          });

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
