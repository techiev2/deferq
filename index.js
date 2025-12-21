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
function addToQueue(key, fn, payload) {
  const queue = JSON.parse((localStorage.getItem(key) || '[]'))
  queue.push({ fn, payload })
  localStorage.setItem(key, JSON.stringify(queue))
}
