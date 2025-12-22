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

if (window) { window.deferq = { addToQueue, register } }
setupEvents()
export { addToQueue, register };