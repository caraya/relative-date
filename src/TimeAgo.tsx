import React, { useMemo, useState, useEffect } from 'react';

export interface TimeAgoProps {
  /** The ISO date string to calculate from (e.g., "2025-12-09") */
  date: string;
  /** BCP 47 language tag (e.g., "en-US", "es-ES") */
  locale?: string;
  /** Custom class for styling */
  className?: string;
  /** Fallback text if the date is invalid */
  errorFallback?: string;
  /** Content to display while polyfill is loading (if needed) */
  loadingFallback?: React.ReactNode;
}

/**
 * A generic, accessible component to display human-readable time differences.
 */
export const TimeAgo: React.FC<TimeAgoProps> = ({
  date,
  locale = 'en-US',
  className = '',
  errorFallback = 'Invalid date',
  loadingFallback = null,
}) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if natively supported
    if (typeof Temporal !== 'undefined') {
      setIsReady(true);
      return;
    }

    // Dynamically import polyfill
    import('temporal-polyfill/global')
      .then(() => setIsReady(true))
      .catch((err) => console.error('Failed to load Temporal polyfill:', err));
  }, []);

  const timeAgo = useMemo(() => {
    if (!isReady || !date) return isReady && !date ? errorFallback : null;

    try {
      // 1. Convert inputs to Temporal types
      const postDate = Temporal.PlainDate.from(date);
      const today = Temporal.Now.plainDateISO();

      // 2. Calculate duration
      // Note: We use 'year' as largest unit but might want month/day rounding logic later.
      const diff = postDate.until(today, { largestUnit: 'year' });

      // 3. Handle future dates
      const isFuture = diff.sign === -1;

      if (isFuture) {
        // As requested: just say "in the future" or equivalent "right now" logic?
        // User asked: "If the date is in the future, just say right now"
        // Let's use RelativeTimeFormat for "now" (0 seconds) which usually renders "now".
        const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
        return rtf.format(0, 'second');
      }
      
      // 4. Build the parts for the list
      const parts: string[] = [];
      
      const formatUnit = (value: number, unit: 'year' | 'month' | 'day') => {
        return new Intl.NumberFormat(locale, { style: 'unit', unit, unitDisplay: 'long' }).format(value);
      };

      const years = Math.abs(diff.years);
      const months = Math.abs(diff.months);
      const days = Math.abs(diff.days);

      if (years > 0) parts.push(formatUnit(years, 'year'));
      if (months > 0) parts.push(formatUnit(months, 'month'));
      if (days > 0) parts.push(formatUnit(days, 'day'));

      if (parts.length === 0) {
        // Fallback for "now" or "today"
        const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
        return rtf.format(0, 'day');
      }

      // 5. Format the list grammatically
      const listFormatter = new Intl.ListFormat(locale, {
        style: 'long',
        type: 'conjunction',
      });
      const durationString = listFormatter.format(parts);

      // 6. Add "ago" or "in" context
      // This uses a robust replacement strategy:
      // 1. Generate the standard relative time string for the largest unit (e.g., "5 years ago").
      // 2. Generate the standard number format for that same unit (e.g., "5 years").
      // 3. Replace the latter in the former with our detailed list ("5 years, 3 months").
      // If the strings don't match perfectly (rare edge cases), we fallback to the standard single-unit relative time strings.

      const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'always' });
      
      const largestUnit = diff.years > 0 ? 'year' : (diff.months > 0 ? 'month' : 'day');
      const largestValue = diff.years > 0 ? diff.years : (diff.months > 0 ? diff.months : diff.days);
      
      const fullRelativeString = rtf.format(isFuture ? largestValue : -largestValue, largestUnit);
      const unitString = new Intl.NumberFormat(locale, { style: 'unit', unit: largestUnit, unitDisplay: 'long' }).format(largestValue);

      if (fullRelativeString.includes(unitString)) {
        return fullRelativeString.replace(unitString, durationString);
      }
      
      return fullRelativeString;
    } catch (err) {
      console.error(`TimeAgo error for date "${date}":`, err);
      return errorFallback;
    }
  }, [date, locale, errorFallback, isReady]);

  if (!isReady && typeof Temporal === 'undefined') {
    return <span className={className}>{loadingFallback}</span>;
  }

  return (
    <time dateTime={date} className={className}>
      {timeAgo}
    </time>
  );
};
