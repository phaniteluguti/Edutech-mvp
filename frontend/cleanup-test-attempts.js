/**
 * Script to clean up test attempts for a specific user
 * Usage: node cleanup-test-attempts.js <email>
 * Example: node cleanup-test-attempts.js student@example.com
 */

const email = process.argv[2];

if (!email) {
  console.error('❌ Error: Please provide an email address');
  console.log('Usage: node cleanup-test-attempts.js <email>');
  console.log('Example: node cleanup-test-attempts.js student@example.com');
  process.exit(1);
}

const API_URL = 'http://localhost:4000/api/v1/tests/cleanup-attempts';

async function cleanupAttempts() {
  try {
    console.log(`🧹 Cleaning up test attempts for: ${email}...`);
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Success!');
      console.log(`   Deleted ${data.data.count} test attempt(s)`);
      console.log('   You can now take tests again');
    } else {
      console.error('❌ Error:', data.message);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

cleanupAttempts();
