"use strict";

const MinHeap = require("../lib/min-heap");

module.exports = (logSources, printer) => {
  return new Promise(async (resolve, reject) => {
    try {
      /* For the async solution, I tried speeding up with batches, but if we are memory bound, it does not help much.
      If for example, we have 100 sources and a batch of 10, then we would need 1000 entries in memory to process the next 10 logs,
      and on each iteration we are adding 1000 entries.
      */
      const heap = new MinHeap();

      const promises = logSources.map(async (source, index) => {
        return source
          .popAsync()
          .then((entry) => ({ sourceIndex: index, entry }));
      });

      const results = await Promise.all(promises);

      results.forEach(({ sourceIndex, entry }) => {
        if (entry) {
          heap.insert({ sourceIndex, entry });
        }
      });

      // Process and print log entries in chronological order
      while (heap.size() > 0) {
        const { sourceIndex, entry } = heap.extractMin();

        printer.print(entry);

        // Get the next log entry from the same source
        const nextEntry = await logSources[sourceIndex].popAsync();
        if (nextEntry) {
          heap.insert({ sourceIndex, entry: nextEntry });
        }
      }
      printer.done();
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};
