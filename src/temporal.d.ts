// Type definitions for the Temporal API
// This is a minimal definition to satisfy the compiler for the used methods.

declare namespace Temporal {
  interface Duration {
    sign: number;
    years: number;
    months: number;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    milliseconds: number;
    microseconds: number;
    nanoseconds: number;
  }

  interface PlainDate {
    until(other: PlainDate, options?: { largestUnit?: string }): Duration;
    equals(other: PlainDate): boolean;
    toString(): string;
  }

  const PlainDate: {
    from(item: string | object): PlainDate;
  };

  const Now: {
    plainDateISO(): PlainDate;
  };
}
