# relative-date

A lightweight, modern React component for displaying relative dates (e.g., "2 years ago", "3 days ago") using the ECMAScript `Temporal` API and `Intl.ListFormat`.

This library avoids heavy dependencies like `moment.js` or `date-fns` by leveraging modern browser capabilities.

## Features

- **Modern API**: Built on the `Temporal` API for precise date calculations.
- **Internationalization**: Uses `Intl.ListFormat` for grammatically correct lists (e.g., "1 year and 3 months ago").
- **Customizable**: Supports custom locales and CSS classes.
- **Accessible**: Renders a semantic `<time>` element.
- **Tiny**: Zero runtime dependencies (besides `react` peer dependency).

## Prerequisites

This library relies on the **[Temporal API](https://tc39.es/proposal-temporal/)**, which is currently a Stage 3 proposal.

> **Note:** This library automatically polyfills `Temporal` if it is not supported in the user's environment. The polyfill is loaded dynamically to strip bundle size on modern browsers.

## Installation

```bash
npm install relative-date
# or
yarn add relative-date
# or
pnpm add relative-date
```

## Usage

Import the `TimeAgo` component and pass it an ISO date string.

```tsx
import { TimeAgo } from 'relative-date';

function App() {
  const dateStr = "2023-11-15T10:00:00.000Z";

  return (
    <div>
      <h3>Post details</h3>
      <p>
        Posted: <TimeAgo date={dateStr} />
      </p>
      
      {/* With custom locale (Spanish) */}
      <p>
        Publicado: <TimeAgo date={dateStr} locale="es-ES" />
      </p>
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
| ------ | ------ | --------- | ------------- |
| `date` | `string` | **Required** | The ISO date string to calculate from (e.g., "2025-12-09"). |
| `locale` | `string` | `'en-US'` | BCP 47 language tag (e.g., "fr-FR", "es-ES"). |
| `className` | `string` | `''` | CSS class for custom styling. |
| `errorFallback` | `string` | `'Invalid date'` | Text to display if the date is invalid or calculation fails. |

## License

MIT
