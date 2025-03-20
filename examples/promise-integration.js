const ChunkProcessor = require("../src/chunkProcessor");

async function main() {
  const processor = new ChunkProcessor(3);

  const simulateApiStream = async () => {
    const chunks = [
      ["data1", true, 200],
      ["data2", true, 300],
      ["data3", false, 250],
      ["data5", true, 400],
      ["data6", false, 350],
      ["data7", true, 100],
    ];

    for (const chunk of chunks) {
      const networkDelay = Math.floor(Math.random() * 400) + 100;
      await new Promise((resolve) => setTimeout(resolve, networkDelay));

      console.log(
        `Received chunk ${chunk[0]} from API (${
          chunk[1] ? "cancelable" : "non-cancelable"
        })`
      );
      processor.addChunkToQueue(chunk);
    }

    console.log("API stream complete");
  };

  const apiStreamPromise = simulateApiStream();

  const waitForChunk = (chunkId) => {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (processor.processedChunks.includes(chunkId)) {
          clearInterval(checkInterval);
          resolve(`Chunk ${chunkId} has been processed`);
        }
      }, 100);
    });
  };

  const specificChunkPromise = waitForChunk("data3");

  const results = await Promise.all([
    apiStreamPromise.then(() => "API stream finished"),
    specificChunkPromise,
    processor.waitForProcessing().then(() => {
      return {
        processedChunks: processor.processedChunks,
        maxConcurrency: processor.maxObservedConcurrency,
      };
    }),
  ]);

  console.log("\nAll operations complete!");
  console.log("Results:", results);
  console.log("Processed chunks:", processor.processedChunks);
}

main().catch(console.error);
