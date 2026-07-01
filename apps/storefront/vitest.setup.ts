// Extend Vitest's `expect` with @testing-library/jest-dom matchers
// (`toBeInTheDocument`, `toHaveTextContent`, …) and auto-clean the DOM.
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
