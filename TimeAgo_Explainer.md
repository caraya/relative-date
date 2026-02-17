# TimeAgo Component Explainer

This document explains the inner workings of the `TimeAgo` component, a lightweight React component for displaying localized relative dates (e.g., "2 years, 3 months ago") using modern browser APIs.

## 1. How It Works

The component operates in several distinct phases to ensure accuracy and localization:

### Phase 1: Environment Check & Polyfilling

The component first checks if the `Temporal` API is available globally.

- If **supported**, it renders immediately.
- If **missing**, it dynamically imports the `temporal-polyfill` chunk. This ensures the heavy polyfill code is only downloaded by browsers that need it (Progressive Enhancement).

### Phase 2: Date Calculation

It uses `Temporal.PlainDate` to parse the input ISO string and compares it to "Today" (`Temporal.Now.plainDateISO()`).

- By using `PlainDate`, it ignores time zones and focuses on calendar dates (ideal for "posted on X date" logic).
- It calculates the difference (`duration`) in terms of years, months, and days.

### Phase 3: Text Construction

Instead of manually translating words like "year" or "ago", the component generates the text using a "Swap Strategy" to leverage the browser's built-in `Intl` engine:

1. **Generate List**: It calculates precise durations (e.g., "5 years", "3 months") using `Intl.NumberFormat`.
2. **Join List**: It combines them grammatically using `Intl.ListFormat` (e.g., "5 years, 3 months and 2 days").
3. **Contextualize**: To add the "ago" or "in" suffix/prefix correctly for any language:
    - It asks the browser for the standard relative string of the *largest unit* (e.g., "5 years ago").
    - It locates the numeric part ("5 years") within that string.
    - It **swaps** the simple "5 years" with the detailed "5 years, 3 months and 2 days".

This results in a grammatically correct sentence ("2 years, 3 months ago" in English, "hace 2 años, 3 meses" in Spanish) without shipping any translation files.

## 2. Web APIs Used

| API | Purpose | Example Output |
| :--- | :--- | :--- |
| **`Temporal`** | Modern date/time math (Stage 3) | `diff.years`, `diff.months` |
| **`Intl.NumberFormat`** | Localized unit formatting | "5 years", "5 años" |
| **`Intl.ListFormat`** | Grammatically correct lists | "A, B, and C" |
| **`Intl.RelativeTimeFormat`** | Relative context ("ago", "in") | "5 years ago", "hace 5 años" |
| **`React.lazy` / `import()`** | Code splitting | Loads polyfill on demand |

## 3. Browser Compatibility

- **Logic (`Intl` APIs)**: Supported in all modern browsers (Chrome 72+, Firefox 65+, Safari 13+).
- **Math (`Temporal` API)**: Currently in **Stage 3**.
  - **Native Support**: None (as of early 2025).
  - **Polyfill**: Required. This library handles it automatically via `temporal-polyfill`.

## 4. Helper Function Implementation

Here is a clean, non-React, pure TypeScript version of the logic for reference. You can extract this into a utility function like `formatRelativeDate(date, locale)`.

```typescript
import 'temporal-polyfill/global'; // Ensure Temporal is active

export function formatRelativeDate(dateStr: string, locale: string = 'en-US'): string {
  try {
    const postDate = Temporal.PlainDate.from(dateStr);
    const today = Temporal.Now.plainDateISO();
    
    // 1. Calculate the difference
    const diff = postDate.until(today, { largestUnit: 'year' });
    const isFuture = diff.sign === -1;

    // 2. Handle specific cases
    if (isFuture) {
      // Returns "now" or "in 0 seconds" depending on locale
      return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(0, 'second');
    }

    if (diff.years === 0 && diff.months === 0 && diff.days === 0) {
      // Returns "today"
      return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(0, 'day');
    }

    // 3. Prepare units for the list
    const parts: string[] = [];
    
    const formatUnit = (val: number, unit: 'year' | 'month' | 'day') => 
      new Intl.NumberFormat(locale, { style: 'unit', unit, unitDisplay: 'long' }).format(val);

    const years = Math.abs(diff.years);
    const months = Math.abs(diff.months);
    const days = Math.abs(diff.days);

    if (years > 0) parts.push(formatUnit(years, 'year'));
    if (months > 0) parts.push(formatUnit(months, 'month'));
    if (days > 0) parts.push(formatUnit(days, 'day'));

    // 4. Combine list (e.g., "5 years, 3 months")
    const listFormatter = new Intl.ListFormat(locale, { style: 'long', type: 'conjunction' });
    const detailedList = listFormatter.format(parts);

    // 5. Apply "ago" context using the Swap Strategy
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'always' });

    // Determine the largest unit to generate the template string
    const largestUnit = years > 0 ? 'year' : (months > 0 ? 'month' : 'day');
    const largestValue = years > 0 ? years : (months > 0 ? months : days);

    // Generate "5 years ago"
    const standardRelative = rtf.format(-largestValue, largestUnit);
    // Generate "5 years"
    const standardUnit = formatUnit(largestValue, largestUnit);

    // Inject our detailed list into the relative template
    if (standardRelative.includes(standardUnit)) {
      return standardRelative.replace(standardUnit, detailedList);
    }

    // Fallback: If replacement fails, return the detailed list roughly or the simple one
    return standardRelative;

  } catch (err) {
    console.error('Date formatting failed', err);
    return 'Invalid date';
  }
}
```

## 5. Static Site Generation (SSG) Pitfalls

It is important to understand that `TimeAgo` relies on **client-side calculation** relative to the *current moment* (`Temporal.Now.plainDateISO()`). This creates a fundamental conflict with Static Site Generation (SSG) frameworks like Eleventy, Next.js (with static export), Gatsby, or Astro.

### The Problem: Stale "Now"

When a static site is built, "Now" is the **build time**, not the **view time**.

1. **Build Time**: You run `npm run build` on **Jan 1st**. The server renders "2 days ago" for a post from Dec 30th.
2. **View Time**: A user visits the site on **Feb 1st**. The HTML still says "2 days ago" because it was baked into the static file.

### Partial Hydration Mismatches

Even in frameworks that hydrate (like Next.js), you might encounter **hydration errors**:

- Server renders: "2 days ago" (at build/request time)
- Client renders: "3 days ago" (at view time)
- **Result**: React throws a hydration mismatch error because the server HTML doesn't match the client's initial render.

### The Solution: Client-Only Rendering

To use this component safely in SSG or SSR environments, ensure implementation is **client-side only**:

1. **Use `useEffect`**: This component naturally handles this because the `Temporal` polyfill import and the `isReady` state are triggered inside a `useEffect`.
2. **Loading State**: The component renders the `loadingFallback` (or nothing) initially on the server, and only renders the calculated date after the component mounts in the browser.

This design ensures the date is always calculated fresh relative to the user's actual current time.
