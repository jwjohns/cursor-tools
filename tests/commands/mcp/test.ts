import { mcp } from '../../../src/commands/mcp/index.js';
import { loadEnv } from '../../../src/config.js';

// Load environment variables from ~/.cursor-tools/.env
loadEnv();

// Check for required environment variables
if (!process.env.ANTHROPIC_API_KEY) {
  console.error('Error: ANTHROPIC_API_KEY environment variable is not set');
  console.error('Please set it in ~/.cursor-tools/.env');
  process.exit(1);
}

// Simple helper to capture command output
async function runCommand(query: string): Promise<string> {
  const output: string[] = [];
  const write = process.stdout.write;
  const writeErr = process.stderr.write;

  // Override stdout.write
  process.stdout.write = (chunk: any) => {
    output.push(chunk.toString());
    return write.call(process.stdout, chunk);
  };

  // Override stderr.write
  process.stderr.write = (chunk: any) => {
    output.push(chunk.toString());
    return writeErr.call(process.stderr, chunk);
  };

  try {
    await mcp.parseAsync(['node', 'test.ts', '--debug', query]);
    return output.join('');
  } finally {
    process.stdout.write = write;
    process.stderr.write = writeErr;
  }
}

// Test cases focusing on core functionality
const tests = [
  {
    name: 'List files in current directory',
    query: 'list all files in the current directory',
    expectError: false,
    validate: (output: string) => {
      // Convert to lowercase and normalize whitespace
      const normalizedOutput = output.toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
      
      // Log the normalized output for debugging
      console.log('\n=== Debug: Normalized Output ===');
      console.log(normalizedOutput);
      console.log('=== End Debug Output ===\n');
      
      // Check for key indicators of success
      const hasToolCall = normalizedOutput.includes('list_directory');
      const hasFiles = normalizedOutput.includes('files') || 
                      normalizedOutput.includes('package.json');
      const hasStructure = normalizedOutput.includes('directories') || 
                          normalizedOutput.includes('documentation');

      // Log validation details
      console.log('Validation details:');
      console.log('- Has tool call:', hasToolCall);
      console.log('- Has files:', hasFiles);
      console.log('- Has structure:', hasStructure);

      return hasToolCall && hasFiles && hasStructure;
    }
  },
  {
    name: 'Read non-existent file',
    query: 'read the contents of non_existent_file.txt',
    expectError: false,
    validate: (output: string) => {
      const normalizedOutput = output.toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
      
      // Log the normalized output for debugging
      console.log('\n=== Debug: Normalized Output ===');
      console.log(normalizedOutput);
      console.log('=== End Debug Output ===\n');
      
      const hasError = normalizedOutput.includes('does not exist');
      const hasFileContext = normalizedOutput.includes('non_existent_file.txt');

      console.log('Validation details:');
      console.log('- Has error message:', hasError);
      console.log('- Has file context:', hasFileContext);

      return hasError && hasFileContext;
    }
  },
  {
    name: 'Empty query',
    query: '',
    expectError: true,
    validate: (error: Error) => {
      const errorMessage = error.message.toLowerCase();
      const hasInvalidRequest = errorMessage.includes('invalid_request_error');
      const hasEmptyContent = errorMessage.includes('must have non-empty content');

      console.log('Validation details:');
      console.log('- Has invalid request:', hasInvalidRequest);
      console.log('- Has empty content message:', hasEmptyContent);

      return hasInvalidRequest && hasEmptyContent;
    }
  },
  {
    name: 'List specific directory',
    query: 'list files in src directory',
    expectError: false,
    validate: (output: string) => {
      const normalizedOutput = output.toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
      
      // Log the normalized output for debugging
      console.log('\n=== Debug: Normalized Output ===');
      console.log(normalizedOutput);
      console.log('=== End Debug Output ===\n');
      
      const hasToolCall = normalizedOutput.includes('list_directory');
      const hasSrcDir = normalizedOutput.includes('src');

      console.log('Validation details:');
      console.log('- Has tool call:', hasToolCall);
      console.log('- Has src directory:', hasSrcDir);

      return hasToolCall && hasSrcDir;
    }
  }
];

// Run tests
async function runTest(test: typeof tests[0]) {
  console.log(`\n=== Running test: ${test.name} ===`);
  
  try {
    const output = await runCommand(test.query);
    
    if (test.expectError) {
      console.error(`Test "${test.name}" should have failed but succeeded`);
      process.exit(1);
    }

    if (!test.validate(output)) {
      console.error(`Test "${test.name}" failed validation`);
      process.exit(1);
    }

    console.log(`✓ Test "${test.name}" passed`);
  } catch (error) {
    if (!test.expectError) {
      console.error(`Test "${test.name}" failed unexpectedly:`, error);
      process.exit(1);
    }

    if (!test.validate(error)) {
      console.error(`Test "${test.name}" failed validation in error case`);
      process.exit(1);
    }

    console.log(`✓ Test "${test.name}" passed (failed as expected)`);
  }
}

// Run all tests
async function main() {
  for (const test of tests) {
    await runTest(test);
  }
  console.log('\nAll tests passed! ✨');
}

main(); 