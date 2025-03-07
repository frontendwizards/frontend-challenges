# Traffic Light Challenge

## Problem Description

Create a simulated traffic light. The traffic light should cycle through red, yellow, and green lights automatically, mimicking the behavior of a real traffic signal.

## Requirements

1. Display three lights: red, yellow, and green.
2. Automatically cycle through the lights in a customizable order.
3. Each light should be customizable with:
   - Duration (how long it stays active)
   - Color (background color when active)
   - Next state (which light comes next)
4. Only one light should be active at a time.
5. The cycle should repeat indefinitely.
6. Support different layouts (vertical/horizontal)

## Design First!

Before looking at the implementation hints below, try to:

1. Design the component structure on your own
2. Think about how you would manage state transitions
3. Consider how to make it customizable (colors, timing, order)
4. Plan your component's API (props)

## Implementation Hints

If you're stuck or want to validate your approach, here's one way you could structure the component's API:

### Possible Props Structure

```typescript
type Config = {
  [key: string]: {
    backgroundColor: string; // Color when active
    duration: number; // Duration in milliseconds
    next: string; // Key of the next light state
  };
};
```

Example configuration:

```typescript
const config = {
  red: {
    backgroundColor: "red",
    duration: 2000,
    next: "green",
  },
  yellow: {
    backgroundColor: "yellow",
    duration: 1000,
    next: "red",
  },
  green: {
    backgroundColor: "green",
    duration: 2000,
    next: "yellow",
  },
};
```

You might also want to support different layouts:

```tsx
<TrafficLight config={config} layout="horizontal" />
```

Remember: This is just one possible implementation. Feel free to design your own API structure!