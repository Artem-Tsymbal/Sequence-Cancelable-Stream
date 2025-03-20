const ChunkProcessor = require("../src/chunkProcessor");

async function main() {
  const processor = new ChunkProcessor(2);
  console.log("Chunk processor initialized with max concurrency of 2");

  console.log("Adding chunks to the queue...");

  processor.addChunkToQueue(["chunk1", true, 300]);
  processor.addChunkToQueue(["chunk2", true, 200]);
  console.log("Added cancelable chunks 1 and 2");

  processor.addChunkToQueue(["chunk3", false, 500]);
  console.log(
    "Added non-cancelable chunk 3 (will cancel pending chunks 1 and 2)"
  );

  processor.addChunkToQueue(["chunk4", true, 200]);
  processor.addChunkToQueue(["chunk5", true, 300]);
  console.log("Added cancelable chunks 4 and 5");

  processor.addChunkToQueue(["chunk6", false, 400]);
  console.log(
    "Added non-cancelable chunk 6 (will cancel pending chunks 4 and 5)"
  );

  processor.addChunkToQueue(["chunk7", true, 100]);
  console.log("Added final cancelable chunk 7");

  console.log("Waiting for all processing to complete...");
  await processor.waitForProcessing();

  console.log("\nProcessing complete!");
  console.log("Processed chunks:", processor.processedChunks);
  console.log(
    "Maximum observed concurrency:",
    processor.maxObservedConcurrency
  );
}

main().catch(console.error);
