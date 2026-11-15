/**
 * Purely visual color-mapping helpers for badge accents and false-color indicator dots.
 * NOTE: Strictly for UI styling; does not alter scientific wavelength values.
 */

export const chHue = (ch: number): number => 262 - 254 * ((ch - 1) / 101);
export const chColor = (ch: number, l = 62): string => `hsl(${chHue(ch).toFixed(0)} 90% ${l}%)`;
