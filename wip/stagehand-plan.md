# Stagehand Integration Implementation Plan for cursor-tools

This document outlines the implementation plan for integrating Stagehand into `cursor-tools` to enhance browser automation capabilities. The plan is structured in phases to ensure a robust and well-integrated feature set.

## Current Implementation Status

### Core Infrastructure ✅ COMPLETED
- Base directory structure and files created
- Dependencies configured correctly
- Configuration system implemented
- Basic error handling in place
- Shared utilities for browser management

### Command Implementation Status

#### `act` Command ✅ MOSTLY COMPLETED
- Basic functionality working with Stagehand API
- Core action execution implemented
- Basic error handling in place
- Pending:
  - Full option parsing integration
  - Enhanced error handling
  - Comprehensive output formatting

#### `extract` Command 🔄 PARTIALLY COMPLETED
- Basic structure implemented
- Currently using simulated extraction
- Pending:
  - Integration with Stagehand extract API
  - Schema handling implementation
  - Full option parsing
  - Output formatting

#### `observe` Command 🔄 PARTIALLY COMPLETED
- Basic structure implemented
- Currently using simulated observation
- Pending:
  - Integration with Stagehand observe API
  - Full option parsing
  - Output formatting

## Remaining Tasks (Prioritized)

### Phase 1: Core API Integration
1. Replace simulated functionality with actual Stagehand API calls:
   - Implement extract API integration
   - Implement observe API integration
   - Add proper error handling for API calls
   - Add retry mechanisms for flaky operations

### Phase 2: Option Handling and Output
1. Implement full option parsing across all commands:
   - Add support for all shared browser options
   - Implement command-specific options
   - Add validation for option combinations
2. Enhance output formatting:
   - Implement structured JSON output
   - Add support for different output formats
   - Improve error message formatting
   - Add debug output support

### Phase 3: Video Recording Support 🔄 IN PROGRESS
1. Core Implementation ✅ COMPLETED
   - Added `video` option to `SharedBrowserCommandOptions`
   - Implemented video recording in browser context
   - Added utility functions for setup and cleanup
   - Basic error handling
   - Simple interface: `--video=<directory>`
   - Sensible defaults (1280x720, WebM format)
   - Timestamped subdirectories for organization

2. Improvements Needed 🔄 IN PROGRESS
   - Better error handling and user feedback:
     - Add start recording message
     - Verify file exists after recording
     - Better error messages for failures
   - Documentation:
     - Update README.md with video option
     - Update .cursorrules
     - Document timestamped subdirectory behavior
   - Testing:
     - Add test cases for video recording
     - Test error conditions
     - Test with different browser commands

3. Integration with Other Commands
   - Add video support to `act` command
   - Add video support to `extract` command
   - Add video support to `observe` command
   - Ensure consistent behavior across all commands

### Phase 4: Schema and Validation
1. Implement full schema handling for extract command:
   - Add support for file-based schemas
   - Implement inline schema parsing
   - Add schema validation
   - Add schema error handling

### Phase 5: Documentation and Polish
1. Add comprehensive documentation:
   - Update README.md with command details
   - Add examples for each command
   - Document all options and configurations
   - Add troubleshooting guide
2. Implement help messages:
   - Add detailed --help for each command
   - Include examples in help text
   - Document option combinations

### Phase 6: Testing and Refinement
1. Add comprehensive tests:
   - Unit tests for each command
   - Integration tests with test server
   - Error handling tests
   - Performance tests
2. Performance optimization:
   - Add caching where appropriate
   - Optimize browser initialization
   - Improve resource cleanup
   - Add performance monitoring

## Configuration ✅ COMPLETED

Stagehand configuration is integrated into cursor-tools configuration system:

```json
{
  "browser": {
    "stagehand": {
      "env": "LOCAL",
      "headless": true,
      "verbose": 1,
      "debugDom": false,
      "enableCaching": false,
      "video": {
        "enabled": false,
        "size": {
          "width": 1280,
          "height": 720
        },
        "format": "webm"
      }
    }
  }
}
```

**Video Recording Options:**
- `enabled`: Whether video recording is enabled by default (boolean)
- `size`: Default video resolution (width, height)
- `format`: Video format (currently only 'webm' is supported)

Can be overridden with command-line options:
- `--video=<directory>`: Enable video recording and specify output directory
- Videos are saved in timestamped subdirectories for organization
- Each recording gets a unique filename based on the command and timestamp

## Dependencies ✅ COMPLETED

- Stagehand: Direct dependency
- Playwright: Peer dependency
- Zod: Direct dependency for schema validation

## Error Handling 🔄 IN PROGRESS

Current error classes implemented:
- StagehandError (base class)
- ActionError
- ExtractionSchemaError
- ObservationError
- NavigationError
- PlaywrightError

Pending improvements:
- More granular error types
- Better error messages
- Retry mechanisms
- Debug output enhancement

## Next Immediate Steps

1. Improve video recording implementation:
   - Add start recording message in OpenCommand
   - Add file existence check in stopVideoRecording
   - Improve error messages and user feedback
   - Update documentation (README.md and .cursorrules)

2. Integrate video recording with other commands:
   - Add to act command
   - Add to extract command
   - Add to observe command
   - Test with each command type

3. Integrate Stagehand extract API
4. Integrate Stagehand observe API
5. Implement full option parsing
6. Enhance error handling and debug output
7. Add comprehensive documentation
