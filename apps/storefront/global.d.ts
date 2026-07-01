// Ambient declarations for non-code assets imported for their side effects.
// Next.js ships type declarations for images (next/image-types/global) but not
// for stylesheets, so a side-effect import like `import './globals.css'` has no
// module to resolve to and the TS language service reports TS2882. Declaring the
// modules here resolves them for both `tsc` and the editor.

declare module '*.css';

declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
