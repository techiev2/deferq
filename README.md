# LaterJS

A tiny, zero-dependency JavaScript library for queuing async actions when offline and automatically retrying them when connectivity returns.

- **Lightweight**: ~30 lines of code
- **Zero dependencies**
- **Concurrent retries**: All queued actions run in parallel when back online
- **Persistent**: Uses `localStorage` to survive page reloads
- **Flexible**: Queue any async function by name

Ideal for simple offline support without the complexity of service workers.

## Installation

### Via npm

Install with: `npm install laterjs`

### Via CDN

```html
<script src="https://unpkg.com/laterjs@1.0.0/dist/laterjs.min.js"></script>
```


## Usage
### 1. Initialize the library (once)
```JavaScript
import 'laterjs';  // Automatically registers the "online" listener
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
When the browser fires the "online" event, LaterJS:

- Loads the queue from localStorage
- Executes all queued functions concurrently
- Removes successful actions
- Keeps persistent failures for the next online event

No additional setup required.

## API
```JavaScript
addToQueue(key: string, fnName: string, payload: any)
````
Queues an action.

- key: localStorage key for the queue (e.g., 'networkQueue')
- fnName: Name of the function as it exists on window (string)
- payload: Data to pass to the function when replayed

Example: addToQueue('networkQueue', 'createPost', { post: 'data' })


## How It Works

- When offline, use addToQueue instead of calling the function directly.
- Actions are serialized and stored in localStorage under the given key.
- On "online", LaterJS replays all actions concurrently using Promise.allSettled.
- Successful actions are removed; failed ones remain for future retries.

## Notes

- Actions are tab-specific (localStorage is not shared across tabs).
- Functions must be available on window with the exact name used when queuing.
- Payloads must be JSON-serializable.
- Functions to queue must be pure functions and not use global state, for safety and proper application.
- Functions must be in the window scope. Functions scoped inside closures are not visible to the library.
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