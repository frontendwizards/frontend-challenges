# Star Rating Challenge

## Problem Description

Create a reusable star rating component that allows users to select a rating between 1 and 5 stars. The component should provide both interactive functionality and visual feedback.

## Requirements

- The component must accept a `rating` prop, which specifies the current rating as a number (1-5).
- It should provide an `onChange` prop, a callback function that is invoked whenever the user changes the rating.
- Stars should have three visual states:
  1. **Empty** (default/unselected state)
  2. **Filled** (selected state)
  3. **Highlighted** (hover state)
- While hovering over a star, all stars up to the hovered one should visually indicate the hover state by changing color to yellow.
- Clicking on a star should update the rating corresponding to the clicked star.

## Example Usage

```tsx
const [rating, setRating] = useState(4);

<StarRating rating={rating} onChange={setRating} />
```

## Bonus

- Add animation/transition effects when changing star states
- Accessibility Features:
  - The component should be navigable using keyboard (Arrow keys)
  - Implement proper ARIA labels and roles for screen readers
- Make the component customizable (size, number of stars)
- Write unit tests (eg: using vitest)