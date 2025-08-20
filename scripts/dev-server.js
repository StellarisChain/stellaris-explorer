const esbuild = require('esbuild');
const { sassPlugin } = require('esbuild-sass-plugin');
const express = require('express');
const path = require('path');
const fs = require('fs');
const chokidar = require('chokidar');
const WebSocket = require('ws');

const PORT = 3000;
const WS_PORT = 3001;

// Create Express app
const app = express();

// Setup WebSocket server for hot reload
const wss = new WebSocket.Server({ port: WS_PORT });

const broadcast = (message) => {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
};

// Build context for development
let buildContext;

const createBuildContext = async () => {
  return esbuild.context({
    entryPoints: ['src/main.tsx'],
    bundle: true,
    outdir: 'dist',
    platform: 'browser',
    target: 'es2020',
    format: 'iife',
    sourcemap: true,
    minify: false,
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
  });
};

// Initial build
const initBuild = async () => {
  try {
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

    // Create build context
    buildContext = await createBuildContext();
    
    // Initial build
    await buildContext.rebuild();
    
    console.log('✅ Initial build completed');
  } catch (error) {
    console.error('❌ Build failed:', error);
  }
};

// Watch for file changes
const setupWatcher = () => {
  const watcher = chokidar.watch(['src/**/*', 'public/**/*'], {
    ignored: /node_modules/,
    persistent: true
  });

  watcher.on('change', async (filePath) => {
    console.log(`📝 File changed: ${filePath}`);
    
    try {
      if (filePath.startsWith('public/')) {
        // Copy public file
        const relativePath = path.relative('public', filePath);
        const destPath = path.join('dist', relativePath);
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        fs.copyFileSync(filePath, destPath);
      } else {
        // Rebuild JS/CSS
        await buildContext.rebuild();
      }
      
      broadcast({ type: 'reload' });
      console.log('✅ Rebuild completed');
    } catch (error) {
      console.error('❌ Rebuild failed:', error);
      broadcast({ type: 'error', message: error.message });
    }
  });
};

// Serve static files
app.use(express.static(path.join(__dirname, '../dist')));
app.use(express.static(path.join(__dirname, '../public')));

// Serve index.html for all routes (SPA)
app.get('*', (req, res) => {
  const htmlTemplate = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  const processedHtml = htmlTemplate
    .replace(
      '<title>Stellaris Explorer</title>',
      `<title>Stellaris Explorer</title>
      <link rel="stylesheet" href="/main.css">`
    )
    .replace(
      '<script type="module" src="/src/main.tsx"></script>',
      `<script src="/main.js"></script>
      <script>
        // Hot reload WebSocket connection
        const ws = new WebSocket('ws://localhost:${WS_PORT}');
        ws.onmessage = (event) => {
          const message = JSON.parse(event.data);
          if (message.type === 'reload') {
            window.location.reload();
          } else if (message.type === 'error') {
            console.error('Build error:', message.message);
          }
        };
        ws.onopen = () => console.log('🔄 Hot reload connected');
        ws.onclose = () => console.log('❌ Hot reload disconnected');
      </script>`
    );
  res.send(processedHtml);
});

// Start server
const startServer = async () => {
  await initBuild();
  setupWatcher();
  
  app.listen(PORT, () => {
    console.log(`🚀 Development server running at http://localhost:${PORT}`);
    console.log(`🔄 Hot reload WebSocket server running on port ${WS_PORT}`);
  });
};

startServer().catch(console.error);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down development server...');
  if (buildContext) {
    await buildContext.dispose();
  }
  process.exit(0);
});
