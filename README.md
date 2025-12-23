# deferq

A tiny, zero-dependency JavaScript library for queuing async actions when offline and automatically retrying them when connectivity returns.

- **Lightweight**: ~30 lines of code
- **Zero dependencies**
- **Concurrent retries**: All queued actions run in parallel when back online
- **Flexible**: Queue any async function by name

Ideal for simple offline support without the complexity of service workers.

## Installation

### Via npm

Install with: `npm install deferq`

### Via CDN

```html
<script src="https://app.unpkg.com/deferq@1.1.3/files/index.js"></script>
```


## Usage
### 1. Initialize the library (once)
```JavaScript
<script type="module">
  import { addToQueue, register } from 'https://cdn.jsdelivr.net/npm/deferq@1.1.3/index.js'; // Automatically registers the "online" listener
</script>
```

### 2. Queue actions when offline
```JavaScript
async function createPost({ post }) {
  if (!navigator.onLine) {
    addToQueue('networkQueue', 'createPost' { post });
    showToast("Offline — we'll retry when you're back online.", 5);
    return;
  }

  const res = await fetch('/api/post', {
    method: 'POST',
    body: JSON.stringify({ post }),
    headers: { 'Content-Type': 'application/json' }
  });
  // handle response...
}

// Call your function as usual
createPost({ post: "Hello world!" });
```

### 3. Automatic retry
When the browser fires the "online" event, deferq:

- Loads the queue from internal storage.
- Executes all queued functions serially to avoid a thundering herd.
- Removes successful actions.
- Keeps persistent failures for the next online event.

No additional setup required.

## API
```JavaScript
addToQueue(key: string, fnName: string, payload: any)
````
Queues an action.

- key: key for the queue (e.g., 'networkQueue', 'fetchQueue', 'transferQueue')
- fnName: Name of the function as it was registered to deferq.
- payload: Data to pass to the function when replayed

Example: addToQueue('networkQueue', 'createPost', { post: 'data' })


## How It Works

- When offline, use addToQueue instead of calling the function directly.
- Actions are cached in internal storage under the given key.
- On "online", deferq replays all actions serially.
- Successful actions are removed; failed ones remain for future retries.

## Notes

- In v1.1.3, actions are no longer stored in localStorage to avoid pollution and XSS attacks.
- Functions to queue must be pure functions and not use global state, for safety and proper application.
- No built-in queue size limit (add your own in production if needed).
- Works in all modern browsers.

### Function Naming Requirement

For automatic retry to work, the calling function must have a name that appears in the stack trace.

Works:
- Named function declarations: `function createPost() {}`
- Named function expressions: `const post = function createPost() {}`

Does not work:
- Arrow functions: `const createPost = async () => {}`
- Anonymous functions

*Recommendation*: Use named functions for actions that may be queued offline.

## License
MIT
