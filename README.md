# ChunkProcessorTask

# The second test duplicates the first one, I changed it to "should process chunks correctly when a non-cancelable chunk is added".

# COMMAND TO RUN TESTS - yarn run test

The task is next. Imagine you have a stream of incoming chunks, every chunk pushed in strict sequence, like 1,2,3,4,5 etc.. each chunk has attribute isCancelable. Each chunk should be processed, but you always have to process only the latest chunk in sequence, and cancel the chunks which are cancelable, if chunk is not cancelable you can't skip it. So on example:
full sequence -> [1:1],[2:1],[3:1],[4:0],[5:1],[6:1],[7:0] it is [id-of-chunk:isCancelable]
When you started you have only two chunks: [1:1],[2:1]
In this case you should skip chunk with id: 1, because it is isCancelable: 1, and start processing chunk with id:2. After processing imaging in sequence already added:
[3:1],[4:0],[5:1],[6:1],[7:0] so you have to skip id: 3, and process id: 4 because it is not cancelable. And so on....
This called Sequence Cancelable stream, you should add supporting of concurrent execution of finished sequences, if more then one Not Cancelable chunk. Because in fact isCancelable is indicate if chunks sequence is finished.

Your code will be run through JEST tests with example of chunk arrays:

1. should ensure that chunks are processed and emitted in the sequential order as pushed, respecting cancel ability and concurrency [3,5,7] constraints
   // string - chunkID
   // boolean - is Cancelable
   // timeout - when chunk will appear in queue
   const chunks: [string, boolean, number][] = [
   ['chunk1', CANCELABLE, 10],
   ['chunk2', CANCELABLE, 10],
   ['chunk3', NOT_CANCELABLE, 1],
   ['chunk4', CANCELABLE, 10],
   ['chunk5', CANCELABLE, 10],
   ['chunk6', NOT_CANCELABLE, 1],
   ['chunk7', CANCELABLE, 10],
   ['chunk8', CANCELABLE, 10],
   ['chunk9', NOT_CANCELABLE, 1],
   ['chunk10', CANCELABLE, 10],
   ['chunk11', CANCELABLE, 10],
   ['chunk12', NOT_CANCELABLE, 1],
   ];

2. should ensure that chunks are processed and emitted in the sequential order as pushed, respecting cancelability and concurrency [3,5,7] constraints
   const chunks: [string, boolean, number][] = [
   ['chunk1', CANCELABLE, 10],
   ['chunk2', CANCELABLE, 10],
   ['chunk3', NOT_CANCELABLE, 1],
   ['chunk4', CANCELABLE, 10],
   ['chunk5', CANCELABLE, 10],
   ['chunk6', NOT_CANCELABLE, 1],
   ['chunk7', CANCELABLE, 10],
   ['chunk8', CANCELABLE, 10],
   ['chunk9', NOT_CANCELABLE, 1],
   ['chunk10', CANCELABLE, 10],
   ['chunk11', CANCELABLE, 10],
   ['chunk12', NOT_CANCELABLE, 1],
   ];
3. should correctly process a single cancelable chunk
   const chunk: [string, boolean, number] = ['single-chunk', CANCELABLE, 10];

4. should correctly process a single non-cancelable chunk
   const chunk: [string, boolean, number] = ['single-chunk', NOT_CANCELABLE, 10];

5. should not exceed max concurrency when pushed with excessive simultaneous chunks

6. should continue processing other chunks when one chunk processing fails
