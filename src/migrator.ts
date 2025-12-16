// Set CLI mode flag before importing ORM to prevent auto-running migrations
process.env.UMZUG_CLI_MODE = 'true';

const path = require('path');
const { orm } = require(path.join(__dirname, 'db', 'orm.js'));

async function waitForUmzug(maxAttempts = 50, interval = 100) {
  for (let i = 0; i < maxAttempts; i++) {
    if (orm && orm.umzug) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  return false;
}

async function runMigrator() {
  try {
    // Wait for Umzug to be initialized (ORM initialization is async)
    const isReady = await waitForUmzug();
    
    if (!isReady || !orm || !orm.umzug) {
      console.error('Umzug instance is not available.');
      process.exit(1);
    }

    const args = process.argv.slice(2);
    const command = args[0];

    // Handle "generate" command - auto-generate from models
    if (command === 'generate' || command === 'auto') {
      const MigrationGenerator = require(path.join(__dirname, 'db', 'migration-generator.js')).MigrationGenerator;
      const { MODELS } = require(path.join(__dirname, 'db', 'models', 'index.js'));
      
      // Extract migration name from arguments
      let migrationName = args[1] || 'auto-generated';
      
      const generator = new MigrationGenerator(orm.queryInterface);
      const fs = require('fs');
      const migrationsFolder = path.join(path.resolve(), 'src/db/migrations');
      
      if (!fs.existsSync(migrationsFolder)) {
        fs.mkdirSync(migrationsFolder, { recursive: true });
      }

      // Generate timestamp-based filename
      const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '');
      const filename = `${timestamp}-${migrationName}.ts`;
      const filepath = path.join(migrationsFolder, filename);

      console.log('🔍 Comparing models with database schema...');
      
      // Generate migration for each model
      let allUpOps: string[] = [];
      let allDownOps: string[] = [];
      const allImports = new Set<string>(['DataTypes', 'QueryInterface']);
      
      for (const ModelClass of MODELS) {
        if (!ModelClass) continue; // Skip empty entries
        
        try {
          const modelName = ModelClass.name || ModelClass.constructor?.name || 'Unknown';
          const migrationCode = await generator.generateMigrationForModel(ModelClass, migrationName);
          
          // Extract imports from the generated code
          const importMatch = migrationCode.match(/import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]sequelize['"];?/);
          if (importMatch) {
            const imports = importMatch[1].split(',').map(i => i.trim());
            imports.forEach(imp => allImports.add(imp));
          }
          
          // Parse the generated code to extract operations
          const upMatch = migrationCode.match(/export const up = async.*?\{([\s\S]+?)\};/s);
          const downMatch = migrationCode.match(/export const down = async.*?\{([\s\S]+?)\};/s);
          
          if (upMatch && upMatch[1].trim() && !upMatch[1].includes('No changes')) {
            const ops = upMatch[1].trim().split('\n').filter(l => l.trim() && !l.includes('// No changes'));
            allUpOps.push(...ops);
          }
          if (downMatch && downMatch[1].trim() && !downMatch[1].includes('No rollback')) {
            const ops = downMatch[1].trim().split('\n').filter(l => l.trim() && !l.includes('// No rollback'));
            allDownOps.push(...ops);
          }
        } catch (error) {
          const modelName = ModelClass?.name || ModelClass?.constructor?.name || 'Unknown';
          console.warn(`⚠️  Could not generate migration for ${modelName}:`, error.message);
        }
      }

      // Generate final migration file with all collected imports
      const importsArray = Array.from(allImports).sort();
      const importsStatement = `import { ${importsArray.join(', ')} } from 'sequelize';`;
      const finalMigration = `${importsStatement}

export const up = async (queryInterface: QueryInterface) => {
${allUpOps.length > 0 ? allUpOps.map(op => '  ' + op).join('\n') : '  // No changes detected between models and database'}
};

export const down = async (queryInterface: QueryInterface) => {
${allDownOps.length > 0 ? allDownOps.map(op => '  ' + op).join('\n') : '  // No rollback needed'}
};
`;

      fs.writeFileSync(filepath, finalMigration, 'utf8');
      console.log(`✅ Auto-generated migration file: ${filepath}`);
      console.log(`📝 Please review the generated migration before running it.`);
      return;
    }

    // Handle "create" command programmatically
    if (command === 'create') {
      // Extract migration name from arguments
      let migrationName = null;
      
      // Try to find --name flag
      const nameIndex = args.indexOf('--name');
      if (nameIndex !== -1 && args[nameIndex + 1]) {
        migrationName = args[nameIndex + 1];
      } else if (args[1] && !args[1].startsWith('--')) {
        // Support "create migration-name" format
        migrationName = args[1];
      }
      
      if (!migrationName) {
        console.error('Migration name is required. Usage: migrate create <name> or migrate create --name <name>');
        process.exit(1);
      }

      // Manually create migration file using Umzug's template
      const fs = require('fs');
      const migrationsFolder = path.join(path.resolve(), 'src/db/migrations');
      const templatePath = path.join(path.resolve(), 'src/db/template/simple-migrations.ts');
      
      // Ensure migrations folder exists
      if (!fs.existsSync(migrationsFolder)) {
        fs.mkdirSync(migrationsFolder, { recursive: true });
      }

      // Generate timestamp-based filename
      const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '');
      const filename = `${timestamp}-${migrationName}.ts`;
      const filepath = path.join(migrationsFolder, filename);

      // Read template
      const templateContent = fs.readFileSync(templatePath, 'utf8');

      // Write migration file
      fs.writeFileSync(filepath, templateContent, 'utf8');
      
      console.log(`✅ Migration file created: ${filepath}`);
      return;
    }

    // For other commands (up, down, status), use Umzug CLI
    await orm.umzug.runAsCLI();
  } catch (error) {
    console.error('Error running migrator:', error);
    process.exit(1);
  }
}

runMigrator();
