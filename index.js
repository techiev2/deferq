window.addEventListener("online", async (e) => {
  let queue = JSON.parse(localStorage.getItem('networkQueue') || '[]')
  let message = "We are back!"
  if (queue.length) {
    message = `${message}. Attempting your previous requests.`
  }
  showToast(message, 2);
  const successes = new Set((await Promise.allSettled(queue.map(async ({fn, payload}, idx) => {
    const func = window[fn]
    await func(payload)
    return idx
  }))).filter((prom) => prom.status === 'fulfilled').map(({ value }) => value))
  const newQueue = JSON.stringify(queue.filter((_, idx) => !successes.has(idx)))
  localStorage.setItem('networkQueue', newQueue)
})
function addToQueue(key, payload) {
  let caller
  try {
    throw new Error()
  } catch (err) {
    caller = err.stack.split('\n')[1].split(' at ')[1].split(' ')[0]
  }
  const queue = JSON.parse((localStorage.getItem(key) || '[]'))
  queue.push({ fn: caller, payload })
  localStorage.setItem(key, JSON.stringify(queue))
}