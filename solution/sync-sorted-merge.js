"use strict";

const MinHeap = require("../lib/min-heap");

module.exports = (logSources, printer) => {
  const heap = new MinHeap();

  for (let i = 0; i < logSources.length; i++) {
    const entry = logSources[i].pop();
    if (entry) {
      heap.insert({ sourceIndex: i, entry });
    }
  }

  while (heap.size() > 0) {
    const { sourceIndex, entry } = heap.extractMin();

    printer.print(entry);

    const nextEntry = logSources[sourceIndex].pop();
    if (nextEntry) {
      heap.insert({ sourceIndex, entry: nextEntry });
    }
  }

  printer.done();
};
