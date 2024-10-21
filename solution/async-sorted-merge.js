"use strict";

const MinHeap = require("../lib/min-heap");

const BUFFER_SIZE = 15;

// Helper function to fill the buffer for a given source
async function fillBuffer(source, buffer) {
  while (buffer.length < BUFFER_SIZE && !source.drained) {
    const entryPromises = [];
    for (let i = buffer.length; i < BUFFER_SIZE; i++) {
      entryPromises.push(source.popAsync());
    }
    const entries = await Promise.all(entryPromises);
    buffer.push(...entries.filter((entry) => entry != false));
  }
}

module.exports = (logSources, printer) => {
  return new Promise(async (resolve, reject) => {
    try {
      const heap = new MinHeap();
      const buffers = logSources.map(() => []);

      // Initialize the heap with the first entry from each source
      for (let i = 0; i < logSources.length; i++) {
        await fillBuffer(logSources[i], buffers[i]);
        if (buffers[i].length > 0) {
          heap.insert({ sourceIndex: i, entry: buffers[i][0] });
        }
      }

      while (heap.size() > 0) {
        const { sourceIndex, entry } = heap.extractMin();
        printer.print(entry);

        // Delete the printed entry from the buffer and refill if it's empty
        buffers[sourceIndex].shift();
        if (buffers[sourceIndex].length === 0) {
          await fillBuffer(logSources[sourceIndex], buffers[sourceIndex]);
        }
        if (buffers[sourceIndex].length > 0) {
          heap.insert({ sourceIndex, entry: buffers[sourceIndex][0] });
        }
      }

      printer.done();
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};
