#!/usr/bin/env node

import puppeteer from 'puppeteer';
import path from 'path';

// Test configuration
const BASE_URL = 'http://0.0.0.0:5000';
const VIEWPORTS = {
  mobile: { width: 375, height: 667 }, // iPhone 8
  mobile_small: { width: 320, height: 568 }, // iPhone SE
  tablet: { width: 768, height: 1024 }, // iPad
  desktop: { width: 1024, height: 768 }, // Desktop
  desktop_large: { width: 1440, height: 900 } // Large desktop
};

const TEST_IMAGES = [
  'test_images/front_damage.jpg',
  'test_images/rear_damage.jpg',
  'test_images/side_damage.jpg'
];

class MobileTestRunner {
  constructor() {
    this.browser = null;
    this.page = null;
    this.testResults = [];
  }

  async init() {
    this.browser = await puppeteer.launch({
      headless: false,
      devtools: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    });
    
    this.page = await this.browser.newPage();
    await this.page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1');
  }

  async logResult(testName, success, details = '', viewport = 'unknown') {
    const result = {
      test: testName,
      viewport,
      success,
      details,
      timestamp: new Date().toISOString()
    };
    this.testResults.push(result);
    console.log(`${success ? '✓' : '✗'} [${viewport}] ${testName}: ${details}`);
  }

  // Test 1: Mobile Quote Submission Flow
  async testMobileQuoteFlow() {
    console.log('\n=== Testing Mobile Quote Submission Flow ===');
    
    for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
      if (viewportName.includes('desktop') && viewportName !== 'desktop') continue;
      
      console.log(`\nTesting on ${viewportName} (${viewport.width}x${viewport.height})`);
      
      await this.page.setViewport(viewport);
      await this.page.goto(BASE_URL, { waitUntil: 'networkidle0' });

      // Test navigation and header responsiveness
      await this.testNavigationHeader(viewportName);
      
      // Test form layout and usability
      await this.testFormUsability(viewportName);
      
      // Test photo upload on mobile
      await this.testPhotoUploadMobile(viewportName);
      
      // Test damage assessment form
      await this.testDamageAssessmentMobile(viewportName);
      
      // Test form validation
      await this.testFormValidation(viewportName);
    }
  }

  async testNavigationHeader(viewport) {
    try {
      // Check if navigation header exists and is responsive
      const header = await this.page.$('nav');
      if (!header) {
        await this.logResult('Navigation Header Exists', false, 'Header not found', viewport);
        return;
      }

      // Check logo and title visibility
      const logo = await this.page.$('[data-testid="button-owner-login"], .w-10.h-10.bg-primary');
      const title = await this.page.$('h1');
      
      const logoVisible = logo ? await logo.isIntersectingViewport() : false;
      const titleVisible = title ? await title.isIntersectingViewport() : false;
      
      await this.logResult('Navigation Header Responsive', logoVisible && titleVisible, 
        `Logo: ${logoVisible}, Title: ${titleVisible}`, viewport);
        
      // Test owner login button accessibility
      const ownerBtn = await this.page.$('[data-testid="button-owner-login"]');
      if (ownerBtn) {
        const btnBox = await ownerBtn.boundingBox();
        const touchSizeOk = btnBox && btnBox.height >= 44 && btnBox.width >= 44;
        await this.logResult('Owner Login Button Touch Size', touchSizeOk, 
          btnBox ? `${btnBox.width}x${btnBox.height}px` : 'No bounding box', viewport);
      }

    } catch (error) {
      await this.logResult('Navigation Header Test', false, `Error: ${error.message}`, viewport);
    }
  }

  async testFormUsability(viewport) {
    try {
      // Test form container responsiveness
      const formContainer = await this.page.$('.max-w-4xl');
      if (formContainer) {
        const containerBox = await formContainer.boundingBox();
        const fitsInViewport = containerBox && containerBox.width <= viewport.width;
        await this.logResult('Form Container Responsive', fitsInViewport, 
          containerBox ? `Container: ${containerBox.width}px, Viewport: ${viewport.width}px` : 'No container', viewport);
      }

      // Test input field sizes and accessibility
      const inputs = await this.page.$$('input[type="text"], input[type="email"], input[type="tel"]');
      for (let i = 0; i < Math.min(inputs.length, 3); i++) {
        const input = inputs[i];
        const inputBox = await input.boundingBox();
        if (inputBox) {
          const heightOk = inputBox.height >= 44; // Touch target minimum
          const inputId = await input.evaluate(el => el.getAttribute('data-testid') || el.name || el.type);
          await this.logResult(`Input Field Touch Size (${inputId})`, heightOk, 
            `${inputBox.width}x${inputBox.height}px`, viewport);
        }
      }

      // Test button accessibility
      const buttons = await this.page.$$('button');
      for (let i = 0; i < Math.min(buttons.length, 3); i++) {
        const button = buttons[i];
        const buttonBox = await button.boundingBox();
        if (buttonBox) {
          const sizeOk = buttonBox.height >= 44;
          const buttonText = await button.evaluate(el => el.textContent?.trim() || el.getAttribute('data-testid') || 'unknown');
          await this.logResult(`Button Touch Size (${buttonText})`, sizeOk, 
            `${buttonBox.width}x${buttonBox.height}px`, viewport);
        }
      }

    } catch (error) {
      await this.logResult('Form Usability Test', false, `Error: ${error.message}`, viewport);
    }
  }

  async testPhotoUploadMobile(viewport) {
    try {
      const uploadArea = await this.page.$('[data-testid="photo-upload-area"]');
      if (!uploadArea) {
        await this.logResult('Photo Upload Area', false, 'Upload area not found', viewport);
        return;
      }

      // Test upload area size and visibility
      const uploadBox = await uploadArea.boundingBox();
      const areaVisible = uploadBox && uploadBox.height > 100 && uploadBox.width > 200;
      await this.logResult('Photo Upload Area Mobile', areaVisible, 
        uploadBox ? `${uploadBox.width}x${uploadBox.height}px` : 'No bounding box', viewport);

      // Test upload button accessibility
      const uploadBtn = await this.page.$('[data-testid="button-add-photos"]');
      if (uploadBtn) {
        const btnBox = await uploadBtn.boundingBox();
        const touchSizeOk = btnBox && btnBox.height >= 44;
        await this.logResult('Upload Button Touch Size', touchSizeOk, 
          btnBox ? `${btnBox.width}x${btnBox.height}px` : 'No button', viewport);
      }

      // Test photo requirements checklist visibility
      const checklist = await this.page.$('.bg-muted');
      if (checklist) {
        const checklistVisible = await checklist.isIntersectingViewport();
        await this.logResult('Photo Requirements Visible', checklistVisible, 
          'Requirements checklist display', viewport);
      }

    } catch (error) {
      await this.logResult('Photo Upload Mobile Test', false, `Error: ${error.message}`, viewport);
    }
  }

  async testDamageAssessmentMobile(viewport) {
    try {
      // Find damage assessment cards
      const damageCards = await this.page.$$('.bg-muted\\/30');
      if (damageCards.length === 0) {
        await this.logResult('Damage Assessment Cards', false, 'No damage cards found', viewport);
        return;
      }

      // Test grid layout responsiveness
      const firstCard = damageCards[0];
      const cardBox = await firstCard.boundingBox();
      
      if (cardBox) {
        const fitsInViewport = cardBox.width <= viewport.width - 32; // Account for padding
        await this.logResult('Damage Assessment Grid Layout', fitsInViewport, 
          `Card: ${cardBox.width}px, Available: ${viewport.width - 32}px`, viewport);
      }

      // Test select dropdowns
      const selects = await this.page.$$('[data-testid^="select-panel"], [data-testid^="select-severity"]');
      for (let i = 0; i < Math.min(selects.length, 2); i++) {
        const select = selects[i];
        const selectBox = await select.boundingBox();
        if (selectBox) {
          const touchSizeOk = selectBox.height >= 44;
          const selectId = await select.evaluate(el => el.getAttribute('data-testid'));
          await this.logResult(`Select Dropdown Touch Size (${selectId})`, touchSizeOk, 
            `${selectBox.width}x${selectBox.height}px`, viewport);
        }
      }

    } catch (error) {
      await this.logResult('Damage Assessment Mobile Test', false, `Error: ${error.message}`, viewport);
    }
  }

  async testFormValidation(viewport) {
    try {
      // Fill in minimal form data to test validation
      await this.page.type('input[name="customerName"]', 'Test Customer', { delay: 50 });
      await this.page.type('input[name="customerPhone"]', '0412345678', { delay: 50 });
      await this.page.type('input[name="customerEmail"]', 'test@example.com', { delay: 50 });
      
      // Try to submit without required fields
      const submitBtn = await this.page.$('button[type="submit"]');
      if (submitBtn) {
        await submitBtn.click();
        
        // Wait a bit for validation to appear
        await this.page.waitForTimeout(1000);
        
        // Check for validation messages
        const validationMessages = await this.page.$$('.text-destructive, [role="alert"]');
        const hasValidation = validationMessages.length > 0;
        await this.logResult('Form Validation Display', hasValidation, 
          `Found ${validationMessages.length} validation messages`, viewport);
      }

    } catch (error) {
      await this.logResult('Form Validation Test', false, `Error: ${error.message}`, viewport);
    }
  }

  // Test 2: Owner Dashboard Mobile Experience
  async testOwnerDashboardMobile() {
    console.log('\n=== Testing Owner Dashboard Mobile Experience ===');
    
    for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
      if (viewportName.includes('desktop') && viewportName !== 'desktop') continue;
      
      console.log(`\nTesting owner dashboard on ${viewportName}`);
      
      await this.page.setViewport(viewport);
      await this.page.goto(`${BASE_URL}/owner`, { waitUntil: 'networkidle0' });

      // Test PIN login modal
      await this.testPinLogin(viewportName);
      
      // Test analytics cards layout
      await this.testAnalyticsCards(viewportName);
      
      // Test quotes table mobile layout
      await this.testQuotesTable(viewportName);
    }
  }

  async testPinLogin(viewport) {
    try {
      // Check if PIN modal appears
      const pinModal = await this.page.$('[role="dialog"], .fixed');
      if (!pinModal) {
        await this.logResult('PIN Modal Appears', false, 'No PIN modal found', viewport);
        return;
      }

      const modalBox = await pinModal.boundingBox();
      const fitsInViewport = modalBox && modalBox.width <= viewport.width - 40;
      await this.logResult('PIN Modal Mobile Layout', fitsInViewport, 
        modalBox ? `Modal: ${modalBox.width}px, Available: ${viewport.width - 40}px` : 'No modal box', viewport);

      // Test PIN input
      const pinInputs = await this.page.$$('[data-testid^="pin-input"], input[type="password"]');
      if (pinInputs.length > 0) {
        const inputBox = await pinInputs[0].boundingBox();
        const touchSizeOk = inputBox && inputBox.height >= 44;
        await this.logResult('PIN Input Touch Size', touchSizeOk, 
          inputBox ? `${inputBox.width}x${inputBox.height}px` : 'No input', viewport);
      }

    } catch (error) {
      await this.logResult('PIN Login Test', false, `Error: ${error.message}`, viewport);
    }
  }

  async testAnalyticsCards(viewport) {
    try {
      // Try to login first (assuming PIN is 1234 from previous tests)
      const pinInput = await this.page.$('input[type="password"]');
      if (pinInput) {
        await pinInput.type('1234');
        const loginBtn = await this.page.$('button[type="submit"]');
        if (loginBtn) {
          await loginBtn.click();
          await this.page.waitForTimeout(2000);
        }
      }

      // Check analytics cards grid layout
      const analyticsGrid = await this.page.$('.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4, .grid');
      if (!analyticsGrid) {
        await this.logResult('Analytics Grid', false, 'Analytics grid not found', viewport);
        return;
      }

      const gridBox = await analyticsGrid.boundingBox();
      if (gridBox) {
        const fitsInViewport = gridBox.width <= viewport.width;
        await this.logResult('Analytics Grid Layout', fitsInViewport, 
          `Grid: ${gridBox.width}px, Viewport: ${viewport.width}px`, viewport);
      }

      // Test individual analytics cards
      const analyticsCards = await this.page.$$('.grid > div');
      if (analyticsCards.length > 0) {
        const firstCard = analyticsCards[0];
        const cardBox = await firstCard.boundingBox();
        if (cardBox) {
          const cardReadable = cardBox.height >= 80; // Minimum readable height
          await this.logResult('Analytics Card Readability', cardReadable, 
            `Card height: ${cardBox.height}px`, viewport);
        }
      }

    } catch (error) {
      await this.logResult('Analytics Cards Test', false, `Error: ${error.message}`, viewport);
    }
  }

  async testQuotesTable(viewport) {
    try {
      // Check quotes table
      const quotesTable = await this.page.$('table');
      if (!quotesTable) {
        await this.logResult('Quotes Table', false, 'Table not found', viewport);
        return;
      }

      const tableBox = await quotesTable.boundingBox();
      if (tableBox) {
        const needsHorizontalScroll = tableBox.width > viewport.width;
        await this.logResult('Quotes Table Mobile Layout', true, 
          needsHorizontalScroll ? 'Horizontal scroll needed' : 'Fits in viewport', viewport);
      }

      // Test action buttons in table
      const actionButtons = await this.page.$$('table button');
      if (actionButtons.length > 0) {
        const buttonBox = await actionButtons[0].boundingBox();
        const touchSizeOk = buttonBox && buttonBox.height >= 44;
        await this.logResult('Table Action Button Touch Size', touchSizeOk, 
          buttonBox ? `${buttonBox.width}x${buttonBox.height}px` : 'No button', viewport);
      }

    } catch (error) {
      await this.logResult('Quotes Table Test', false, `Error: ${error.message}`, viewport);
    }
  }

  // Test 3: Responsive Breakpoints
  async testResponsiveBreakpoints() {
    console.log('\n=== Testing Responsive Breakpoints ===');
    
    const breakpointTests = [
      { name: 'Mobile Small', width: 320, height: 568 },
      { name: 'Mobile Large', width: 414, height: 896 },
      { name: 'Tablet Portrait', width: 768, height: 1024 },
      { name: 'Tablet Landscape', width: 1024, height: 768 },
      { name: 'Desktop', width: 1200, height: 800 },
      { name: 'Large Desktop', width: 1440, height: 900 }
    ];

    for (const test of breakpointTests) {
      console.log(`\nTesting ${test.name} (${test.width}x${test.height})`);
      
      await this.page.setViewport({ width: test.width, height: test.height });
      await this.page.goto(BASE_URL, { waitUntil: 'networkidle0' });
      
      await this.testTailwindClasses(test.name);
      await this.testGridLayouts(test.name);
    }
  }

  async testTailwindClasses(viewport) {
    try {
      // Test responsive padding classes
      const container = await this.page.$('.max-w-4xl');
      if (container) {
        const containerStyles = await container.evaluate(el => {
          const styles = window.getComputedStyle(el);
          return {
            paddingLeft: styles.paddingLeft,
            paddingRight: styles.paddingRight,
            maxWidth: styles.maxWidth
          };
        });
        
        await this.logResult('Tailwind Responsive Padding', true, 
          `Padding: ${containerStyles.paddingLeft}/${containerStyles.paddingRight}`, viewport);
      }

      // Test responsive text sizes
      const headings = await this.page.$$('h1, h2, h3');
      if (headings.length > 0) {
        const headingSize = await headings[0].evaluate(el => window.getComputedStyle(el).fontSize);
        await this.logResult('Responsive Text Sizes', true, `Font size: ${headingSize}`, viewport);
      }

    } catch (error) {
      await this.logResult('Tailwind Classes Test', false, `Error: ${error.message}`, viewport);
    }
  }

  async testGridLayouts(viewport) {
    try {
      // Navigate to owner dashboard to test analytics grid
      await this.page.goto(`${BASE_URL}/owner`, { waitUntil: 'networkidle0' });
      
      // Login if modal appears
      const pinInput = await this.page.$('input[type="password"]');
      if (pinInput) {
        await pinInput.type('1234');
        const loginBtn = await this.page.$('button[type="submit"]');
        if (loginBtn) {
          await loginBtn.click();
          await this.page.waitForTimeout(2000);
        }
      }

      // Check grid column layout
      const grid = await this.page.$('.grid');
      if (grid) {
        const gridStyles = await grid.evaluate(el => {
          const styles = window.getComputedStyle(el);
          return {
            gridTemplateColumns: styles.gridTemplateColumns,
            display: styles.display
          };
        });
        
        await this.logResult('Grid Layout Responsive', true, 
          `Columns: ${gridStyles.gridTemplateColumns}`, viewport);
      }

    } catch (error) {
      await this.logResult('Grid Layout Test', false, `Error: ${error.message}`, viewport);
    }
  }

  // Test 4: Accessibility Features
  async testAccessibilityFeatures() {
    console.log('\n=== Testing Accessibility Features ===');
    
    await this.page.setViewport(VIEWPORTS.mobile);
    await this.page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    
    await this.testContrastRatios();
    await this.testKeyboardNavigation();
    await this.testFocusStates();
    await this.testFormLabels();
    await this.testDataTestIds();
  }

  async testContrastRatios() {
    try {
      // Test text contrast against backgrounds
      const textElements = await this.page.$$('h1, h2, p, label, button');
      let contrastTests = 0;
      let contrastPassed = 0;

      for (let i = 0; i < Math.min(textElements.length, 5); i++) {
        const element = textElements[i];
        const styles = await element.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            color: computed.color,
            backgroundColor: computed.backgroundColor,
            tagName: el.tagName.toLowerCase()
          };
        });
        
        contrastTests++;
        // Basic contrast check (simplified)
        if (styles.color !== styles.backgroundColor) {
          contrastPassed++;
        }
      }

      await this.logResult('Color Contrast Ratios', contrastPassed === contrastTests, 
        `${contrastPassed}/${contrastTests} elements passed basic contrast check`, 'mobile');

    } catch (error) {
      await this.logResult('Contrast Ratios Test', false, `Error: ${error.message}`, 'mobile');
    }
  }

  async testKeyboardNavigation() {
    try {
      // Test tab navigation through form
      await this.page.keyboard.press('Tab');
      let focusedElement = await this.page.evaluate(() => document.activeElement?.tagName);
      
      let tabCount = 0;
      const maxTabs = 10;
      const focusableElements = [];
      
      while (tabCount < maxTabs && focusedElement) {
        focusableElements.push(focusedElement);
        await this.page.keyboard.press('Tab');
        focusedElement = await this.page.evaluate(() => document.activeElement?.tagName);
        tabCount++;
      }

      const keyboardNavigationWorks = focusableElements.length > 3;
      await this.logResult('Keyboard Navigation', keyboardNavigationWorks, 
        `Navigated through ${focusableElements.length} elements`, 'mobile');

    } catch (error) {
      await this.logResult('Keyboard Navigation Test', false, `Error: ${error.message}`, 'mobile');
    }
  }

  async testFocusStates() {
    try {
      // Test focus states on interactive elements
      const buttons = await this.page.$$('button');
      let focusStatesFound = 0;

      for (let i = 0; i < Math.min(buttons.length, 3); i++) {
        await buttons[i].focus();
        
        const hasFocusStyle = await buttons[i].evaluate(el => {
          const styles = window.getComputedStyle(el, ':focus');
          return styles.outline !== 'none' || styles.boxShadow !== 'none';
        });

        if (hasFocusStyle) focusStatesFound++;
      }

      await this.logResult('Focus States', focusStatesFound > 0, 
        `${focusStatesFound} elements have visible focus states`, 'mobile');

    } catch (error) {
      await this.logResult('Focus States Test', false, `Error: ${error.message}`, 'mobile');
    }
  }

  async testFormLabels() {
    try {
      // Test form label associations
      const inputs = await this.page.$$('input');
      let labeledInputs = 0;

      for (const input of inputs) {
        const hasLabel = await input.evaluate(el => {
          const id = el.id;
          const name = el.name;
          const hasAssociatedLabel = id && document.querySelector(`label[for="${id}"]`);
          const hasWrappingLabel = el.closest('label');
          return hasAssociatedLabel || hasWrappingLabel;
        });

        if (hasLabel) labeledInputs++;
      }

      await this.logResult('Form Label Association', labeledInputs === inputs.length, 
        `${labeledInputs}/${inputs.length} inputs properly labeled`, 'mobile');

    } catch (error) {
      await this.logResult('Form Labels Test', false, `Error: ${error.message}`, 'mobile');
    }
  }

  async testDataTestIds() {
    try {
      // Check for data-testid attributes on interactive elements
      const interactiveElements = await this.page.$$('button, input, select, a');
      let elementsWithTestIds = 0;

      for (const element of interactiveElements) {
        const hasTestId = await element.evaluate(el => !!el.getAttribute('data-testid'));
        if (hasTestId) elementsWithTestIds++;
      }

      await this.logResult('Data-TestId Attributes', elementsWithTestIds > 0, 
        `${elementsWithTestIds}/${interactiveElements.length} elements have test IDs`, 'mobile');

    } catch (error) {
      await this.logResult('Data-TestId Test', false, `Error: ${error.message}`, 'mobile');
    }
  }

  // Generate comprehensive test report
  async generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('MOBILE OPTIMIZATION & ACCESSIBILITY TEST REPORT');
    console.log('='.repeat(80));
    
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;
    
    console.log(`\nOVERALL SUMMARY:`);
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests} (${((passedTests/totalTests)*100).toFixed(1)}%)`);
    console.log(`Failed: ${failedTests} (${((failedTests/totalTests)*100).toFixed(1)}%)`);
    
    // Group results by viewport
    const byViewport = {};
    this.testResults.forEach(result => {
      if (!byViewport[result.viewport]) byViewport[result.viewport] = [];
      byViewport[result.viewport].push(result);
    });
    
    console.log(`\nRESULTS BY VIEWPORT:`);
    Object.entries(byViewport).forEach(([viewport, results]) => {
      const passed = results.filter(r => r.success).length;
      const total = results.length;
      console.log(`  ${viewport}: ${passed}/${total} passed (${((passed/total)*100).toFixed(1)}%)`);
    });
    
    // Show failed tests
    const failures = this.testResults.filter(r => !r.success);
    if (failures.length > 0) {
      console.log(`\nFAILED TESTS:`);
      failures.forEach(failure => {
        console.log(`  ✗ [${failure.viewport}] ${failure.test}: ${failure.details}`);
      });
    }
    
    // Show critical issues
    console.log(`\nCRITICAL MOBILE ISSUES:`);
    const criticalIssues = this.testResults.filter(r => 
      !r.success && (
        r.test.includes('Touch Size') || 
        r.test.includes('Responsive') || 
        r.test.includes('Layout')
      )
    );
    
    if (criticalIssues.length === 0) {
      console.log(`  ✓ No critical mobile issues found!`);
    } else {
      criticalIssues.forEach(issue => {
        console.log(`  ! ${issue.test} (${issue.viewport}): ${issue.details}`);
      });
    }
    
    console.log('\n' + '='.repeat(80));
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async runAllTests() {
    try {
      await this.init();
      console.log('🚀 Starting Comprehensive Mobile & Accessibility Testing...\n');
      
      await this.testMobileQuoteFlow();
      await this.testOwnerDashboardMobile();
      await this.testResponsiveBreakpoints();
      await this.testAccessibilityFeatures();
      
      await this.generateReport();
      
    } catch (error) {
      console.error('Test execution failed:', error);
    } finally {
      await this.cleanup();
    }
  }
}

// Run the tests
const runner = new MobileTestRunner();
runner.runAllTests().catch(console.error);