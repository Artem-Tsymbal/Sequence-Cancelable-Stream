const ChunkProcessor = require("../src/chunkProcessor");

class ImageProcessingQueue extends ChunkProcessor {
  constructor(maxConcurrency = 3) {
    super(maxConcurrency);
    this.processingStats = {
      totalProcessingTime: 0,
      processedImages: 0,
    };
  }

  async processChunk(chunk) {
    const [id, isCancelable, processingTime] = chunk;

    console.log(`Starting image processing for ${id}...`);

    await this.delay(processingTime);

    this.processingStats.totalProcessingTime += processingTime;
    this.processingStats.processedImages++;

    console.log(`Completed image processing for ${id}`);

    return chunk;
  }

  getAverageProcessingTime() {
    if (this.processingStats.processedImages === 0) {
      return 0;
    }
    return (
      this.processingStats.totalProcessingTime /
      this.processingStats.processedImages
    );
  }
}

async function main() {
  const imageProcessor = new ImageProcessingQueue(2);

  const images = [
    ["image1.jpg", true, 300],
    ["image2.jpg", true, 400],
    ["image3.jpg", false, 200],
    ["image4.jpg", true, 350],
    ["image5.jpg", true, 250],
  ];

  console.log("Adding images to processing queue...");
  images.forEach((image) => {
    imageProcessor.addChunkToQueue(image);
    console.log(
      `Added ${image[0]} to queue (${
        image[1] ? "cancelable" : "non-cancelable"
      })`
    );
  });

  console.log("\nProcessing images...");
  await imageProcessor.waitForProcessing();

  console.log("\nImage processing complete!");
  console.log("Processed images:", imageProcessor.processedChunks);
  console.log(
    "Average processing time:",
    imageProcessor.getAverageProcessingTime(),
    "ms"
  );
  console.log(
    "Maximum concurrent processes:",
    imageProcessor.maxObservedConcurrency
  );
}

main().catch(console.error);
