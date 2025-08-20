module.exports = {
  entryPoints: ['src/main.tsx'],
  bundle: true,
  outdir: 'dist',
  platform: 'browser',
  target: 'es2020',
  format: 'iife',
  sourcemap: true,
  plugins: [],
  define: {
    'process.env.NODE_ENV': '"development"',
  },
  loader: {
    '.svg': 'dataurl',
    '.png': 'dataurl',
    '.jpg': 'dataurl',
    '.jpeg': 'dataurl',
    '.gif': 'dataurl',
  },
  jsx: 'automatic',
  tsconfig: 'tsconfig.json',
};
