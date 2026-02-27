// GRAW Timer Worker — runs on a separate thread, immune to main thread throttling
// Uses absolute timestamps, not counters — drift-proof across screen lock / tab switch

let interval = null;

self.onmessage = (e) => {
  const { type } = e.data;

  switch (type) {
    case 'START':
      if (interval) clearInterval(interval);
      interval = setInterval(() => {
        self.postMessage({ type: 'TICK', ts: Date.now() });
      }, 500); // 500ms redundancy — never miss a second
      break;

    case 'STOP':
      if (interval) clearInterval(interval);
      interval = null;
      break;
  }
};
