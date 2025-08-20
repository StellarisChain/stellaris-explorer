const esbuild = require('esbuild');
const { sassPlugin } = require('esbuild-sass-plugin');
const fs = require('fs');
const path = require('path');

// Clean dist directory
const distDir = path.join(__dirname, '../dist');
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

// Copy public assets
const publicDir = path.join(__dirname, '../public');
const copyPublicAssets = (src, dest) => {
  if (!fs.existsSync(src)) return;
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyPublicAssets(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
};

copyPublicAssets(publicDir, distDir);

// Copy and process HTML
const htmlTemplate = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const processedHtml = htmlTemplate.replace(
  '<script type="module" src="/src/main.tsx"></script>',
  '<script src="/main.js"></script>'
);
fs.writeFileSync(path.join(distDir, 'index.html'), processedHtml);

// Build with esbuild
esbuild.build({
  entryPoints: ['src/main.tsx'],
  bundle: true,
  outdir: 'dist',
  platform: 'browser',
  target: 'es2020',
  format: 'iife',
  sourcemap: true,
  minify: true,
  splitting: false,
  plugins: [
    sassPlugin({
      loadPaths: [path.join(__dirname, '../src/styles')],
      precompile(source, pathname) {
        const variablesPath = path.join(__dirname, '../src/styles/variables.scss');
        const variablesContent = fs.readFileSync(variablesPath, 'utf8');
        return variablesContent + '\n' + source;
      },
    }),
  ],
  define: {
    'process.env.NODE_ENV': '"production"',
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
}).then(() => {
  console.log('✅ Build completed successfully!');
}).catch((error) => {
  console.error('❌ Build failed:', error);
  process.exit(1);
});
