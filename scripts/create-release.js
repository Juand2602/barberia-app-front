#!/usr/bin/env node

/**
 * Script para crear releases automáticamente desde VS Code
 * Uso: npm run release
 */

const { execSync } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function exec(command) {
  try {
    return execSync(command, { encoding: 'utf-8' }).trim();
  } catch (error) {
    console.error(`❌ Error ejecutando: ${command}`);
    console.error(error.message);
    process.exit(1);
  }
}

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('\n🚀 Asistente de Release\n');

  // 1. Verificar que no haya cambios sin commitear
  const status = exec('git status --porcelain');
  if (status) {
    console.log('⚠️  Tienes cambios sin commitear:');
    console.log(status);
    const continuar = await question('\n¿Deseas continuar de todos modos? (y/n): ');
    if (continuar.toLowerCase() !== 'y') {
      console.log('❌ Cancelado');
      process.exit(0);
    }
  }

  // 2. Obtener versión actual
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../package.json'), 'utf-8')
  );
  const currentVersion = packageJson.version;
  
  console.log(`\n📦 Versión actual: ${currentVersion}`);

  // 3. Sugerir nueva versión
  const [major, minor, patch] = currentVersion.split('.').map(Number);
  console.log('\nOpciones de nueva versión:');
  console.log(`  1. Patch (${major}.${minor}.${patch + 1}) - Correcciones de bugs`);
  console.log(`  2. Minor (${major}.${minor + 1}.0) - Nuevas características`);
  console.log(`  3. Major (${major + 1}.0.0) - Cambios importantes`);
  console.log(`  4. Personalizada`);

  const opcion = await question('\nSelecciona una opción (1-4): ');
  
  let newVersion;
  switch(opcion) {
    case '1':
      newVersion = `${major}.${minor}.${patch + 1}`;
      break;
    case '2':
      newVersion = `${major}.${minor + 1}.0`;
      break;
    case '3':
      newVersion = `${major + 1}.0.0`;
      break;
    case '4':
      newVersion = await question('Ingresa la versión (ej: 1.2.3): ');
      break;
    default:
      console.log('❌ Opción inválida');
      process.exit(1);
  }

  // 4. Pedir mensaje de release
  const mensaje = await question(`\n📝 Mensaje del release (ej: "Corrección en módulo de citas"): `);

  // 5. Confirmar
  console.log('\n📋 Resumen:');
  console.log(`   Versión: ${currentVersion} → ${newVersion}`);
  console.log(`   Tag: v${newVersion}`);
  console.log(`   Mensaje: ${mensaje}`);
  
  const confirmar = await question('\n¿Confirmar release? (y/n): ');
  if (confirmar.toLowerCase() !== 'y') {
    console.log('❌ Cancelado');
    process.exit(0);
  }

  console.log('\n🔧 Procesando...\n');

  // 6. Actualizar package.json
  console.log('1️⃣  Actualizando package.json...');
  packageJson.version = newVersion;
  fs.writeFileSync(
    path.join(__dirname, '../package.json'),
    JSON.stringify(packageJson, null, 2) + '\n'
  );

  // 7. Commit del cambio de versión
  console.log('2️⃣  Creando commit...');
  exec('git add package.json');
  exec(`git commit -m "chore: bump version to ${newVersion}"`);

  // 8. Crear tag
  console.log('3️⃣  Creando tag...');
  exec(`git tag -a v${newVersion} -m "${mensaje}"`);

  // 9. Push
  console.log('4️⃣  Subiendo a GitHub...');
  exec('git push origin main');
  exec(`git push origin v${newVersion}`);

  console.log('\n✅ ¡Release creado exitosamente!');
  console.log(`\n🔗 Ver en GitHub: https://github.com/TU_USUARIO/TU_REPO/releases/tag/v${newVersion}`);
  console.log('\n⏳ GitHub Actions compilará automáticamente el ejecutable en unos minutos...');
  
  rl.close();
}

main().catch(error => {
  console.error('❌ Error:', error);
  rl.close();
  process.exit(1);
});