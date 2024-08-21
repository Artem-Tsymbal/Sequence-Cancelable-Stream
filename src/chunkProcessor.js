class ChunkProcessor {
  constructor(maxConcurrency = 3) {
    this.cancelableQueue = [];
    this.processingPromises = [];
    this.processedChunks = [];
    this.maxConcurrency = maxConcurrency;
    this.maxObservedConcurrency = 0;
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async processChunk(chunk) {
    await this.delay(chunk[2]);
    console.log(`Processed chunk ${chunk[0]}`);
    return chunk;
  }

  handleProcessedChunk(chunk, processingPromise) {
    this.processedChunks.push(chunk[0]);
    this.processingPromises = this.processingPromises.filter(
      (promise) => promise !== processingPromise
    );
    this.processNextChunk();
  }

  handleProcessingError(chunk, error, processingPromise) {
    console.log(`Error in chunk ${chunk[0]}: ${error.message}`);
    this.processingPromises = this.processingPromises.filter(
      (promise) => promise !== processingPromise
    );
    this.processNextChunk();
  }

  processNextChunk() {
    if (this.processingPromises.length >= this.maxConcurrency) {
      return;
    }

    const nextChunk = this.cancelableQueue.shift();

    if (nextChunk) {
      this.executeChunk(nextChunk);
    }
  }

  addChunkToQueue(chunk) {
    if (chunk[1]) {
      this.cancelableQueue.push(chunk);
    } else {
      this.processNextNonCancelableChunk(chunk);
    }
  }

  processNextNonCancelableChunk(chunk) {
    this.cancelableQueue = [];
    this.executeChunk(chunk);
  }

  executeChunk(chunk) {
    const processingPromise = this.processChunk(chunk)
      .then((processedChunk) =>
        this.handleProcessedChunk(processedChunk, processingPromise)
      )
      .catch((error) =>
        this.handleProcessingError(chunk, error, processingPromise)
      );

    this.processingPromises.push(processingPromise);
  }

  async waitForProcessing() {
    while (this.processingPromises.length > 0) {
      await Promise.all(this.processingPromises);
    }

    if (this.cancelableQueue.length > 0) {
      const lastChunk = this.cancelableQueue.pop();
      await this.processChunk(lastChunk);
      this.processedChunks.push(lastChunk[0]);
    }
  }
}

module.exports = ChunkProcessor;
