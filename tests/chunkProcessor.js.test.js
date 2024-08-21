const ChunkProcessor = require("../src/chunkProcessor.js");

describe("Chunk Processor", () => {
  let chunkProcessor;

  beforeEach(() => {
    chunkProcessor = new ChunkProcessor();
    jest.clearAllMocks();
  });

  test("should ensure that chunks are processed in the correct order, respecting cancelability and concurrency [3,5,7] constraints", async () => {
    const chunks = [
      ["chunk1", true, 10],
      ["chunk2", true, 10],
      ["chunk3", false, 1],
      ["chunk4", true, 10],
      ["chunk5", true, 10],
      ["chunk6", false, 1],
      ["chunk7", true, 10],
      ["chunk8", true, 10],
      ["chunk9", false, 1],
      ["chunk10", true, 10],
      ["chunk11", true, 10],
      ["chunk12", false, 1],
    ];

    chunks.forEach((chunk) => chunkProcessor.addChunkToQueue(chunk));
    await chunkProcessor.waitForProcessing();

    expect(chunkProcessor.processedChunks).toEqual([
      "chunk3",
      "chunk6",
      "chunk9",
      "chunk12",
    ]);
  });

  test("should process chunks correctly when a non-cancelable chunk is added", async () => {
    const chunks = [
      ["chunk1", true, 10],
      ["chunk2", true, 10],
      ["chunk3", false, 10],
      ["chunk4", true, 10],
    ];

    chunks.forEach((chunk) => chunkProcessor.addChunkToQueue(chunk));
    await chunkProcessor.waitForProcessing();

    expect(chunkProcessor.processedChunks).toEqual(["chunk3", "chunk4"]);
  });

  test("should correctly process a single cancelable chunk", async () => {
    const chunk = ["single-chunk", true, 10];

    chunkProcessor.addChunkToQueue(chunk);
    await chunkProcessor.waitForProcessing();

    expect(chunkProcessor.processedChunks).toEqual(["single-chunk"]);
  });

  test("should correctly process a single non-cancelable chunk", async () => {
    const chunk = ["single-chunk", false, 10];

    chunkProcessor.addChunkToQueue(chunk);
    await chunkProcessor.waitForProcessing();

    expect(chunkProcessor.processedChunks).toEqual(["single-chunk"]);
  });

  test("should not exceed max concurrency when pushed with excessive simultaneous chunks", async () => {
    const chunkProcessor = new ChunkProcessor(3);
    const chunks = [
      ["chunk1", false, 10],
      ["chunk2", false, 10],
      ["chunk3", false, 10],
      ["chunk4", false, 10],
    ];

    chunks.forEach((chunk) => chunkProcessor.addChunkToQueue(chunk));
    await chunkProcessor.waitForProcessing();

    expect(chunkProcessor.maxObservedConcurrency).toBeLessThanOrEqual(3);
  });

  test("should continue processing other chunks when one chunk processing fails", async () => {
    const failingChunk = ["failing-chunk", false, 10];
    const succeedingChunk = ["succeeding-chunk", false, 10];
    const mockProcessChunk = jest.fn(async (chunk) => {
      if (chunk[0] === "failing-chunk") {
        throw new Error("fail");
      }
      chunkProcessor.processedChunks.push(chunk[0]);
      await new Promise((resolve) => setTimeout(resolve, chunk[2]));
    });

    jest
      .spyOn(ChunkProcessor.prototype, "processChunk")
      .mockImplementation(mockProcessChunk);

    chunkProcessor.addChunkToQueue(failingChunk);
    chunkProcessor.addChunkToQueue(succeedingChunk);
    await chunkProcessor.waitForProcessing();

    expect(chunkProcessor.processedChunks).toEqual(["succeeding-chunk"]);
  });
});
