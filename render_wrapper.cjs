const os = require('os');
const originalCpus = os.cpus;
os.cpus = function() {
  const cpus = originalCpus.call(os);
  if (cpus.length === 0) {
    return [{ model: 'arm64', speed: 1000, times: { user: 0, nice: 0, sys: 0, idle: 0, irq: 0 } }];
  }
  return cpus;
};

// Now require the remotion CLI
require('./node_modules/@remotion/cli/dist/index.js');
