/**
 * ChunkProcessor - Handles streams of sequential data chunks with cancelation capabilities
 * Processes chunks based on their cancelable attribute and manages concurrency
 */
class ChunkProcessor {
  /**
   * Creates a new ChunkProcessor
   * @param {number} maxConcurrency - Maximum number of chunks that can be processed simultaneously
   */
  constructor(maxConcurrency = 3) {
    this.cancelableQueue = [];
    this.processingPromises = [];
    this.processedChunks = [];
    this.maxConcurrency = maxConcurrency;
    this.maxObservedConcurrency = 0;
  }

  /**
   * Creates a delay Promise
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise<void>} A promise that resolves after the specified delay
   */
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Processes a single chunk
   * @param {Array} chunk - The chunk to process [id, isCancelable, processingTime]
   * @returns {Promise<Array>} The processed chunk
   */
  async processChunk(chunk) {
    await this.delay(chunk[2]);
    console.log(`Processed chunk ${chunk[0]}`);
    return chunk;
  }

  /**
   * Handles a successfully processed chunk
   * @param {Array} chunk - The processed chunk
   * @param {Promise} processingPromise - The promise that processed the chunk
   */
  handleProcessedChunk(chunk, processingPromise) {
    this.processedChunks.push(chunk[0]);
    this.processingPromises = this.processingPromises.filter(
      (promise) => promise !== processingPromise
    );
    this.processNextChunk();
  }

  /**
   * Handles errors that occur during chunk processing
   * @param {Array} chunk - The chunk that caused the error
   * @param {Error} error - The error that occurred
   * @param {Promise} processingPromise - The promise that processed the chunk
   */
  handleProcessingError(chunk, error, processingPromise) {
    console.log(`Error in chunk ${chunk[0]}: ${error.message}`);
    this.processingPromises = this.processingPromises.filter(
      (promise) => promise !== processingPromise
    );
    this.processNextChunk();
  }

  /**
   * Processes the next chunk in the queue if concurrency limit allows
   */
  processNextChunk() {
    if (this.processingPromises.length >= this.maxConcurrency) {
      return;
    }

    const nextChunk = this.cancelableQueue.shift();

    if (nextChunk) {
      this.executeChunk(nextChunk);
    }
  }

  /**
   * Adds a chunk to the processing queue
   * @param {Array} chunk - The chunk to add [id, isCancelable, processingTime]
   */
  addChunkToQueue(chunk) {
    if (chunk[1]) {
      this.cancelableQueue.push(chunk);
    } else {
      this.processNextNonCancelableChunk(chunk);
    }
  }

  /**
   * Processes a non-cancelable chunk, discarding all pending cancelable chunks
   * @param {Array} chunk - The non-cancelable chunk to process
   */
  processNextNonCancelableChunk(chunk) {
    this.cancelableQueue = [];
    this.executeChunk(chunk);
  }

  /**
   * Executes a chunk, handling its promise lifecycle
   * @param {Array} chunk - The chunk to execute
   */
  executeChunk(chunk) {
    const processingPromise = this.processChunk(chunk)
      .then((processedChunk) =>
        this.handleProcessedChunk(processedChunk, processingPromise)
      )
      .catch((error) =>
        this.handleProcessingError(chunk, error, processingPromise)
      );

    this.processingPromises.push(processingPromise);
    this.maxObservedConcurrency = Math.max(
      this.maxObservedConcurrency,
      this.processingPromises.length
    );
  }

  /**
   * Waits for all processing to complete
   * @returns {Promise<void>} A promise that resolves when all processing is complete
   */
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
