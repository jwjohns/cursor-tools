#!/bin/bash
# make bash play nicely
set -eo pipefail

# Function to get current time in milliseconds
get_time_ms() {
    perl -MTime::HiRes -e 'printf("%.0f\n",Time::HiRes::time()*1000)'
}

# Start times
anthropic_start=$(get_time_ms)
# run the anthropic test
pnpm dev browser act "Click the start button and Type 'anthropic: claude-3-5-sonnet-latest' in the name field | Click on Button 1, Click on Button 2,  Click on Button 3 | Type DONE in the Message input and Click on the Stop Button" --url http://localhost:3000/test-browser-persistence --model claude-3-5-sonnet-latest --connect-to 9223 &
anthropic_pid=$!

groq_start=$(get_time_ms)
# run the groq test
pnpm dev browser act "Click the start button and Type 'groq: qwen-2.5-32b' in the name field | Click on Button 1, Click on Button 2,  Click on Button 3 | Type DONE in the Message input and Click on the Stop Button" --url http://localhost:3000/test-browser-persistence --model qwen-2.5-32b --connect-to 9224 &
groq_pid=$!

# Wait for each process and record its end time
wait $anthropic_pid
anthropic_end=$(get_time_ms)
wait $groq_pid
groq_end=$(get_time_ms)

# Calculate durations
anthropic_duration=$((anthropic_end - anthropic_start))
groq_duration=$((groq_end - groq_start))

# Print results
echo "Test execution times:"
echo "Anthropic (claude-3-5-sonnet-latest): $(echo "scale=2; $anthropic_duration/1000" | bc) seconds"
echo "Groq (qwen-2.5-32b): $(echo "scale=2; $groq_duration/1000" | bc) seconds"
echo "Difference: $(echo "scale=2; ($groq_duration - $anthropic_duration)/1000" | bc) seconds"
