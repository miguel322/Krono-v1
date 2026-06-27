const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');
const assetsDir = path.join(distDir, 'assets');

try {
  // Encontrar archivos JS y CSS compilados
  const files = fs.readdirSync(assetsDir);
  const jsFile = files.find(f => f.endsWith('.js'));
  const cssFile = files.find(f => f.endsWith('.css'));

  if (!jsFile || !cssFile) {
    console.error('❌ Error: No se encontraron los assets compilados en dist/assets.');
    process.exit(1);
  }

  console.log(`📦 Uniendo assets: ${jsFile} y ${cssFile}...`);

  const jsContent = fs.readFileSync(path.join(assetsDir, jsFile), 'utf8');
  const cssContent = fs.readFileSync(path.join(assetsDir, cssFile), 'utf8');

  let htmlContent = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');

  // Reemplazar etiqueta script
  const scriptRegex = /<script type="module" crossorigin src="\/assets\/index-.*?\.js"><\/script>/;
  htmlContent = htmlContent.replace(scriptRegex, `<script type="module">${jsContent}</script>`);

  // Reemplazar etiqueta link CSS
  const linkRegex = /<link rel="stylesheet" crossorigin href="\/assets\/index-.*?\.css">/;
  htmlContent = htmlContent.replace(linkRegex, `<style>${cssContent}</style>`);

  const outPath = path.join(__dirname, 'KRONO_Prototipo.html');
  fs.writeFileSync(outPath, htmlContent, 'utf8');

  console.log(`✅ ¡Prototipo compilado en un único archivo HTML exitosamente!`);
  console.log(`📍 Guardado en: ${outPath}`);
} catch (err) {
  console.error('❌ Error durante el empaquetado del archivo único:', err.message);
  process.exit(1);
}
