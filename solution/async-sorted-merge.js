"use strict";

const MinHeap = require("../lib/min-heap");

module.exports = (logSources, printer) => {
  return new Promise(async (resolve, reject) => {
    try {
      const heap = new MinHeap();

      await Promise.all(
        logSources.map(async (source, index) => {
          const entry = await source.popAsync();
          if (entry) {
            heap.insert({ sourceIndex: index, entry });
          }
        })
      );

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
