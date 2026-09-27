/**
 * Figtree ships one file per weight. Android resolves a bundled font by file
 * name and only understands the `_bold` / `_italic` suffixes, so `fontWeight`
 * alone silently falls back to the system font there. Pick the face through
 * `fontFamily` instead and leave `fontWeight` unset.
 */
export const fonts = {
  regular: 'Figtree-Regular',
  medium: 'Figtree-Medium',
  semiBold: 'Figtree-SemiBold',
  bold: 'Figtree-Bold',
} as const;

export type FontName = (typeof fonts)[keyof typeof fonts];
