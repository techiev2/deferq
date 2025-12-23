let queueData = {}
let registers = {}
function register(fn) {
  const { name } = fn
  if (!registers[name]) {
    registers[name] = fn
  }
}
async function addToQueue(queueName, fnName, payload = {}) {
  const fn = registers[fnName]
  if (!fn) {
    return console.error(`Function ${fnName} is not registered. Not allowing unsafe usage.`)
  }
  if (typeof fn !== 'function') {
    return console.error(`${fnName} is not a function. Not allowing unsafe usage.`)
  }
  const _registeredQueueCalls = queueData[queueName] || []
  const duplicates = _registeredQueueCalls.filter((item) => {
    return item.fn === fn && JSON.stringify(payload) === JSON.stringify(item.payload)
  })
  if (duplicates.length) {
    return console.warn(`Found duplicated requests in the queue. Not adding again.`)
  }
  _registeredQueueCalls.push({
    fn, payload
  })
  queueData[queueName] = _registeredQueueCalls
}

function setupEvents() {
  window.addEventListener('online', async () => {
    await Promise.all(Object.entries(queueData).map(async ([queueName, calls]) => {
      const remaining = []
      for (const call of calls) {
        try {
          await call.fn(call.payload)
        } catch {
          remaining.push(call)
        }
      }
      queueData[queueName] = remaining
    }))    
  })
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { addToQueue, register };
} else if (typeof define === 'function' && define.amd) {
  define([], function() {
    return { addToQueue, register };
  });
} else {
  window.deferq = { addToQueue, register };
}
setupEvents()
