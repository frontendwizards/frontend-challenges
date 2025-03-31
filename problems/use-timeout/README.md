# useTimeout Hook

MakeA React hook for handling timeouts with automatic cleanup. This hook provides a simple way to execute a callback after a specified delay, with proper cleanup when the component unmounts or dependencies change.

## Usage

```tsx
import { useTimeout } from "./useTimeout";

function MyComponent() {
  useTimeout(() => {
    console.log("This will run after 1000ms");
  }, 1000);

  return <div>Check the console!</div>;
}
```

## API

```tsx
const clear = useTimeout(callback: () => void, delay: number)
```

### Parameters

- `callback`: Function to be executed after the delay
- `delay`: Time in milliseconds to wait before executing the callback

### Returns

- `clear`: Function to manually clear the timeout

## Example

```tsx
function ExampleComponent() {
  const [count, setCount] = useState(0);

  // Will increment count after 2 seconds
  useTimeout(() => {
    setCount((c) => c + 1);
  }, 2000);

  return <div>Count: {count}</div>;
}
```

## Features

- 🔄 Automatic cleanup on unmount
- 🧹 Proper cleanup when dependencies change
- 💪 TypeScript support
- ⚡️ Zero dependencies

## Bonus

- Write unit tests
- Add support for dynamic delays
