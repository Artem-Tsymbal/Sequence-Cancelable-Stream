# ChunkProcessor

A JavaScript library for processing sequential data chunks with cancelation capabilities.

## What it does

- Processes chunks in sequence
- Handles cancellable and non-cancellable chunks
- Maintains a limited concurrency
- Always prioritizes non-cancellable chunks

## Usage

```javascript
const ChunkProcessor = require("./src/chunkProcessor");

// Create processor
const processor = new ChunkProcessor(3); // max 3 concurrent processes

// Add chunks [id, isCancelable, processingTimeMs]
processor.addChunkToQueue(["chunk1", true, 100]); // cancelable
processor.addChunkToQueue(["chunk2", false, 200]); // non-cancelable (priority)

// Wait for processing
await processor.waitForProcessing();

// Get results
console.log(processor.processedChunks);
```

## Rules

1. When a non-cancelable chunk arrives, all pending cancelable chunks are discarded
2. Cancelable chunks are processed in queue order unless canceled
3. The processor respects maximum concurrency

## Testing

```
npm test
```

## License

MIT
