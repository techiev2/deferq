window && window.addEventListener("online", async (e) => {
  Object.entries(localStorage).filter(([k]) => {
    return k.endsWith('Queue')
  }).map(async ([k, v]) => {
    let queue = JSON.parse(v)
    let message = "We are back!"
    if (queue.length) {
      message = `${message}. Attempting your previous requests.`
    }
    const successes = new Set((await Promise.allSettled(queue.map(async ({ fn, payload }, idx) => {
      const func = window[fn]
      if (!func || typeof func !== 'function') {
        console.error(`${fn} is not available as a function at the window level.`)
        return idx
      }
      await func(payload)
      return idx
    }))).filter((prom) => prom.status === 'fulfilled').map(({ value }) => value))
    const newQueue = JSON.stringify(queue.filter((_, idx) => !successes.has(idx)))
    localStorage.setItem(k, newQueue)
  })
})
function addToQueue(key, payload) {
  let caller
  try {
    throw new Error()
  } catch (err) {
    const errLines = err.stack.split('\n')
    let thisReached = false
    errLines.map((line) => {
      if (line.indexOf('at addToQueue') !== -1) {
        thisReached = true
        return
      }
      if (thisReached) {
        if (!caller) {
          caller = line.split(' at ')[1].split(' ')[0]
        } else {
          return
        }
      }
    })
  }
  if (caller !== 'addToQueue') {
    const queue = JSON.parse((localStorage.getItem(key) || '[]'))
    queue.push({ fn: caller, payload })
    localStorage.setItem(key, JSON.stringify(queue))
  }
}

export default addToQueue
if (window) {
	window.addToQueue = addToQueue
}
