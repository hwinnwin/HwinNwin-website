#!/usr/bin/env node

const BASE_URL = 'http://localhost:5000';

// ANSI color codes for better output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(description, url, expectedStatus, expectedHeaders = {}) {
  try {
    const response = await fetch(url);
    const headers = {};
    
    // Extract headers we care about
    for (const [key, value] of response.headers.entries()) {
      if (key.toLowerCase() === 'cache-control' || key.toLowerCase() === 'etag') {
        headers[key] = value;
      }
    }
    
    const passed = response.status === expectedStatus;
    
    // Check expected headers
    let headersMatch = true;
    const headerResults = [];
    for (const [key, value] of Object.entries(expectedHeaders)) {
      const actualValue = headers[key.toLowerCase()];
      if (value === 'present') {
        if (!actualValue) {
          headersMatch = false;
          headerResults.push(`${key}: MISSING`);
        } else {
          headerResults.push(`${key}: "${actualValue}"`);
        }
      } else if (actualValue !== value) {
        headersMatch = false;
        headerResults.push(`${key}: expected "${value}", got "${actualValue}"`);
      }
    }
    
    if (passed && headersMatch) {
      log(`✓ ${description}`, 'green');
      log(`  Status: ${response.status}`, 'blue');
      if (headerResults.length > 0) {
        log(`  Headers: ${headerResults.join(', ')}`, 'blue');
      }
      return true;
    } else {
      log(`✗ ${description}`, 'red');
      log(`  Status: ${response.status} (expected ${expectedStatus})`, 'yellow');
      if (headerResults.length > 0) {
        log(`  Headers: ${headerResults.join(', ')}`, 'yellow');
      }
      return false;
    }
  } catch (error) {
    log(`✗ ${description}`, 'red');
    log(`  Error: ${error.message}`, 'red');
    return false;
  }
}

async function runTests() {
  log('\n=== Content API Test Suite ===\n', 'blue');
  
  const results = [];
  
  // Test 1: Valid case study slug returns 200 with headers
  log('Test Group 1: Valid slugs (should return 200)', 'yellow');
  results.push(await testEndpoint(
    'Valid case study slug (ops-time-cut)',
    `${BASE_URL}/api/content/case-studies/ops-time-cut`,
    200,
    { 'cache-control': 'public, max-age=300', 'etag': 'present' }
  ));
  
  results.push(await testEndpoint(
    'Valid blog post slug (small-systems-win)',
    `${BASE_URL}/api/content/blog/small-systems-win`,
    200,
    { 'cache-control': 'public, max-age=300', 'etag': 'present' }
  ));
  
  // Test 2: List endpoints with headers
  log('\nTest Group 2: List endpoints (should return 200 with headers)', 'yellow');
  results.push(await testEndpoint(
    'Case studies list',
    `${BASE_URL}/api/content/case-studies`,
    200,
    { 'cache-control': 'public, max-age=300', 'etag': 'present' }
  ));
  
  results.push(await testEndpoint(
    'Blog posts list',
    `${BASE_URL}/api/content/blog`,
    200,
    { 'cache-control': 'public, max-age=300', 'etag': 'present' }
  ));
  
  // Test 3: Invalid slugs return 400 (uppercase, special chars)
  log('\nTest Group 3: Invalid slugs (should return 400)', 'yellow');
  results.push(await testEndpoint(
    'Case study with uppercase (INVALID)',
    `${BASE_URL}/api/content/case-studies/INVALID`,
    400
  ));
  
  results.push(await testEndpoint(
    'Case study with special chars (hello@world)',
    `${BASE_URL}/api/content/case-studies/hello@world`,
    400
  ));
  
  results.push(await testEndpoint(
    'Blog post with uppercase (TEST)',
    `${BASE_URL}/api/content/blog/TEST`,
    400
  ));
  
  results.push(await testEndpoint(
    'Blog post with underscore (test_post)',
    `${BASE_URL}/api/content/blog/test_post`,
    400
  ));
  
  // Test 4: Missing content returns 404
  log('\nTest Group 4: Missing content (should return 404)', 'yellow');
  results.push(await testEndpoint(
    'Non-existent case study (does-not-exist)',
    `${BASE_URL}/api/content/case-studies/does-not-exist`,
    404
  ));
  
  results.push(await testEndpoint(
    'Non-existent blog post (missing-post)',
    `${BASE_URL}/api/content/blog/missing-post`,
    404
  ));
  
  // Test 5: Marketing pages load correctly
  log('\nTest Group 5: Marketing pages (should return 200)', 'yellow');
  results.push(await testEndpoint(
    'Marketing home page (/hwin)',
    `${BASE_URL}/hwin`,
    200
  ));
  
  results.push(await testEndpoint(
    'Marketing services page',
    `${BASE_URL}/hwin/services`,
    200
  ));
  
  results.push(await testEndpoint(
    'Marketing work page',
    `${BASE_URL}/hwin/work`,
    200
  ));
  
  results.push(await testEndpoint(
    'Marketing insights page',
    `${BASE_URL}/hwin/insights`,
    200
  ));
  
  results.push(await testEndpoint(
    'Marketing contact page',
    `${BASE_URL}/hwin/contact`,
    200
  ));
  
  // Summary
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  log(`\n=== Test Summary ===`, 'blue');
  log(`Passed: ${passed}/${total}`, passed === total ? 'green' : 'yellow');
  
  if (passed === total) {
    log('\n✓ All tests passed! Both issues are fixed:', 'green');
    log('  1. Invalid slugs now return 400 (not 500)', 'green');
    log('  2. ETag headers are present on all content API routes', 'green');
  } else {
    log(`\n✗ ${total - passed} test(s) failed`, 'red');
    process.exit(1);
  }
}

runTests().catch(error => {
  log(`\nFatal error: ${error.message}`, 'red');
  process.exit(1);
});
