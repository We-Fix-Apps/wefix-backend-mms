import { DataTypes, QueryInterface, UUIDV4 } from 'sequelize';
import { Model, ModelCtor } from 'sequelize-typescript';

/**
 * Auto-generate migration code by comparing models with database schema
 */
export class MigrationGenerator {
  private queryInterface: QueryInterface;

  constructor(queryInterface: QueryInterface) {
    this.queryInterface = queryInterface;
  }

  /**
   * Generate migration code for a model by comparing it with database
   */
  async generateMigrationForModel(model: ModelCtor<Model>, migrationName: string): Promise<string> {
    const tableName = (model as any).tableName || (model as any).name.toLowerCase() + 's';
    const attributes = (model as any).rawAttributes || {};
    const tableOptions = (model as any).options || {};

    // Get current database schema
    let dbColumns: any = {};
    try {
      dbColumns = await this.queryInterface.describeTable(tableName);
    } catch (error) {
      // Table doesn't exist, will generate createTable
    }

    const upOperations: string[] = [];
    const downOperations: string[] = [];
    const allImports = new Set<string>();

    const modelColumns = this.extractModelColumns(attributes, tableOptions);

    // If table doesn't exist, create it
    if (Object.keys(dbColumns).length === 0) {
      const columnsResult = this.generateCreateTableColumns(modelColumns);
      upOperations.push(`  await queryInterface.createTable('${tableName}', {`);
      upOperations.push(...columnsResult.code.split('\n').map(line => '  ' + line));
      upOperations.push('  });');
      
      columnsResult.imports.forEach(imp => allImports.add(imp));
      
      downOperations.push(`  await queryInterface.dropTable('${tableName}');`);
    } else {
      // Table exists, compare columns
      const { adds, changes, removes } = this.compareColumns(modelColumns, dbColumns);

      // Add new columns
      for (const add of adds) {
        const columnResult = this.generateColumnDefinition(add);
        // Check if column already exists (from a previous failed migration)
        const columnExists = dbColumns[add.name] !== undefined;
        
        // If adding a NOT NULL column to an existing table, need to handle existing rows
        if (!add.allowNull && Object.keys(dbColumns).length > 0) {
          // If column doesn't exist, add it as nullable first
          if (!columnExists) {
            const tempColumnResult = this.generateColumnDefinition({ ...add, allowNull: true });
            upOperations.push(`  // Adding ${add.name} as nullable first, then populating data`);
            upOperations.push(`  const tableDescription = await queryInterface.describeTable('${tableName}');`);
            upOperations.push(`  if (!tableDescription['${add.name}']) {`);
            upOperations.push(`    await queryInterface.addColumn('${tableName}', '${add.name}', ${tempColumnResult.code});`);
            upOperations.push(`  }`);
          } else {
            upOperations.push(`  // Column ${add.name} already exists, will populate and make NOT NULL`);
          }
          
          // Generate data population SQL based on column name and existing columns
          const typeInfo = this.getDataTypeString(add.type);
          const hasDefaultValue = add.defaultValue !== undefined && add.defaultValue !== null;
          
          if (typeInfo.typeString.includes('STRING')) {
            // STRING columns - use populateSQL
            const populateSQL = this.generatePopulateSQL(tableName, add.name, dbColumns, add);
            if (populateSQL) {
              upOperations.push(`  // Populate ${add.name} from existing columns`);
              upOperations.push(`  await queryInterface.sequelize.query(\`${populateSQL}\`);`);
            }
          } else if (typeInfo.typeString === 'ENUM' || typeInfo.typeString === 'UUID' || typeInfo.typeString === 'DATE' || typeInfo.typeString === 'BOOLEAN') {
            // ENUM, UUID, DATE, BOOLEAN - use generateDefaultValueSQL (or skip if has default)
            if (!hasDefaultValue || typeInfo.typeString === 'ENUM') {
              const defaultValueSQL = this.generateDefaultValueSQL(tableName, add.name, add);
              if (defaultValueSQL) {
                upOperations.push(`  // Set default values for ${add.name}`);
                upOperations.push(`  await queryInterface.sequelize.query(\`${defaultValueSQL}\`);`);
              }
            }
            // If has default (UUIDV4, CURRENT_TIMESTAMP, etc.), skip population - default will handle it
          }
          
          // Truncate if needed for STRING columns
          if (typeInfo.typeString.includes('STRING') && typeInfo.typeString.match(/\d+/)) {
            const length = typeInfo.typeString.match(/(\d+)/)?.[1] || '255';
            upOperations.push(`  // Truncate to ${length} characters if needed`);
            upOperations.push(`  await queryInterface.sequelize.query(\``);
            upOperations.push(`    UPDATE ${tableName}`);
            upOperations.push(`    SET ${add.name} = SUBSTRING(${add.name} FROM 1 FOR ${length})`);
            upOperations.push(`    WHERE LENGTH(${add.name}) > ${length};`);
            upOperations.push(`  \`);`);
          }
          
          // Make column NOT NULL and apply unique constraint if needed
          const finalColumnResult = this.generateColumnDefinition(add);
          upOperations.push(`  await queryInterface.changeColumn('${tableName}', '${add.name}', ${finalColumnResult.code});`);
        } else {
          // Nullable column or new table - just add it
          if (!columnExists) {
            upOperations.push(`  await queryInterface.addColumn('${tableName}', '${add.name}', ${columnResult.code});`);
          } else {
            upOperations.push(`  // Column ${add.name} already exists, skipping add`);
          }
        }
        columnResult.imports.forEach(imp => allImports.add(imp));
        downOperations.push(`  await queryInterface.removeColumn('${tableName}', '${add.name}');`);
      }

      // Remove columns that exist in DB but not in model
      for (const remove of removes) {
        upOperations.push(`  await queryInterface.removeColumn('${tableName}', '${remove}');`);
        // For down, we need the old column definition - we'll use a placeholder
        downOperations.push(`  await queryInterface.addColumn('${tableName}', '${remove}', {`);
        downOperations.push(`    type: DataTypes.STRING, // TODO: Restore original column definition`);
        downOperations.push(`    allowNull: true,`);
        downOperations.push(`  });`);
      }

      // Change existing columns
      for (const change of changes) {
        const dbCol = dbColumns[change.columnName];
        const _oldAllowNull = dbCol?.allowNull === true || dbCol?.allowNull === 'YES' || dbCol.allowNull === null;
        const newAllowNull = change.newColumn.allowNull !== false;
        
        // If changing to NOT NULL, populate data first (even if schema says NOT NULL, there might be NULLs from failed migrations)
        if (!newAllowNull) {
          const typeInfo = this.getDataTypeString(change.newColumn.type);
          const hasDefaultValue = change.newColumn.defaultValue !== undefined && change.newColumn.defaultValue !== null;
          
          // Handle different column types appropriately
          if (typeInfo.typeString.includes('STRING')) {
            // STRING columns - use populateSQL
            const populateSQL = this.generatePopulateSQL(tableName, change.columnName, dbColumns, change.newColumn);
            if (populateSQL) {
              upOperations.push(`  // Populate ${change.columnName} before making it NOT NULL (handles NULLs from failed migrations)`);
              upOperations.push(`  await queryInterface.sequelize.query(\`${populateSQL}\`);`);
            }
          } else if (typeInfo.typeString === 'ENUM' || typeInfo.typeString === 'UUID' || typeInfo.typeString === 'DATE' || typeInfo.typeString === 'BOOLEAN') {
            // ENUM, UUID, DATE, BOOLEAN - use generateDefaultValueSQL (or skip if has default)
            if (!hasDefaultValue || typeInfo.typeString === 'ENUM') {
              const defaultValueSQL = this.generateDefaultValueSQL(tableName, change.columnName, change.newColumn);
              if (defaultValueSQL) {
                upOperations.push(`  // Set default values for ${change.columnName} before making it NOT NULL`);
                upOperations.push(`  await queryInterface.sequelize.query(\`${defaultValueSQL}\`);`);
              }
            }
            // If has default (UUIDV4, CURRENT_TIMESTAMP, etc.), skip population - default will handle it
          }
          
          // Truncate if needed for STRING columns
          if (typeInfo.typeString.includes('STRING') && typeInfo.typeString.match(/\d+/)) {
            const length = typeInfo.typeString.match(/(\d+)/)?.[1] || '255';
            upOperations.push(`  // Truncate ${change.columnName} to ${length} characters if needed`);
            upOperations.push(`  await queryInterface.sequelize.query(\``);
            upOperations.push(`    UPDATE ${tableName}`);
            upOperations.push(`    SET ${change.columnName} = SUBSTRING(${change.columnName} FROM 1 FOR ${length})`);
            upOperations.push(`    WHERE LENGTH(${change.columnName}) > ${length};`);
            upOperations.push(`  \`);`);
          }
        }
        
        const newColumnResult = this.generateColumnDefinition(change.newColumn);
        upOperations.push(`  await queryInterface.changeColumn('${tableName}', '${change.columnName}', ${newColumnResult.code});`);
        newColumnResult.imports.forEach(imp => allImports.add(imp));
        
        // For down, restore old definition
        const oldColumnResult = this.generateColumnDefinition(change.oldColumn);
        downOperations.push(`  await queryInterface.changeColumn('${tableName}', '${change.columnName}', ${oldColumnResult.code});`);
        oldColumnResult.imports.forEach(imp => allImports.add(imp));
      }
    }

    // Generate the migration file content with proper imports
    return this.generateMigrationFile(migrationName, upOperations, downOperations, Array.from(allImports));
  }

  /**
   * Extract columns from model attributes
   */
  private extractModelColumns(attributes: any, options: any): any[] {
    const columns: any[] = [];
    const underscored = options.underscored || false;

    for (const [key, attribute] of Object.entries(attributes)) {
      const attr = attribute as any;
      const columnName = underscored ? this.camelToSnake(key) : key;
      
      // Detect UUIDV4 default value
      let {defaultValue} = attr;
      if (defaultValue === DataTypes.UUIDV4 || 
          (defaultValue && defaultValue.toString && defaultValue.toString().includes('UUIDV4')) ||
          (attr.type && attr.type === DataTypes.UUID && attr.defaultValue === UUIDV4)) {
        defaultValue = DataTypes.UUIDV4;
      }
      
      // Extract ENUM values if present
      const columnType = attr.type || attr.DataType;
      let enumValues: string[] | undefined;
      if (columnType && columnType.constructor && columnType.constructor.name && columnType.constructor.name.includes('ENUM')) {
        enumValues = columnType.options?.values || columnType.values || undefined;
        if (enumValues && Array.isArray(enumValues)) {
          // Keep enum values for later use
          enumValues = enumValues;
        } else if (enumValues && typeof enumValues === 'object') {
          enumValues = Object.values(enumValues) as string[];
        }
      }
      
      columns.push({
        allowNull: attr.allowNull !== false,
        autoIncrement: attr.autoIncrement || false,
        defaultValue,
        enumValues, // Store enum values separately
        name: columnName,
        primaryKey: attr.primaryKey || false,
        type: columnType,
        unique: attr.unique || false,
      });
    }

    return columns;
  }

  /**
   * Compare model columns with database columns
   */
  private compareColumns(modelColumns: any[], dbColumns: any): {
    adds: any[];
    changes: { newColumn: any; oldColumn: any; columnName: string }[];
    removes: string[];
  } {
    const adds: any[] = [];
    const removes: string[] = [];
    const changes: { newColumn: any; oldColumn: any; columnName: string }[] = [];

    // Find new columns
    for (const modelCol of modelColumns) {
      if (!dbColumns[modelCol.name]) {
        adds.push(modelCol);
      } else {
        // Check if column changed
        const dbCol = dbColumns[modelCol.name];
        if (this.columnsDiffer(modelCol, dbCol)) {
          changes.push({
            columnName: modelCol.name,
            newColumn: modelCol,
            oldColumn: this.dbColumnToModel(dbCol),
          });
        }
      }
    }

    // Find removed columns
    for (const dbColName of Object.keys(dbColumns)) {
      const exists = modelColumns.some(mc => mc.name === dbColName);
      if (!exists) {
        removes.push(dbColName);
      }
    }

    return { adds, changes, removes };
  }

  /**
   * Check if columns differ
   */
  private columnsDiffer(modelCol: any, dbCol: any): boolean {
    // Compare type
    const modelTypeInfo = this.getDataTypeString(modelCol.type);
    const modelType = modelTypeInfo.typeString;
    const dbType = dbCol.type?.toLowerCase() || '';

    // Basic comparison - can be enhanced
    if (modelType !== this.dbTypeToSequelizeType(dbType)) return true;
    if (modelCol.allowNull !== (dbCol.allowNull !== false && dbCol.allowNull !== 'NO')) return true;
    if (modelCol.unique !== dbCol.unique) return true;

    return false;
  }

  /**
   * Convert DataType to string representation with values for ENUM
   * Supports all SQL data types: STRING, UUID, DATE, INTEGER, DECIMAL, TEXT, JSON, etc.
   */
  private getDataTypeString(dataType: any): { enumValues?: string[]; typeString: string } {
    if (!dataType) return { typeString: 'STRING' };
    
    // If it's already a string (from database type), use it
    if (typeof dataType === 'string') {
      // If it's a database type string like "CHARACTER VARYING(255)", convert it
      if (dataType.includes('CHARACTER VARYING') || dataType.includes('VARCHAR')) {
        const match = dataType.match(/\((\d+)\)/);
        const length = match ? match[1] : '';
        return { typeString: length ? `STRING(${length})` : 'STRING' };
      }
      // Already converted Sequelize type
      return { typeString: dataType };
    }
    
    // Handle Sequelize DataTypes
    if (dataType.constructor && dataType.constructor.name) {
      const typeName = dataType.constructor.name;
      
      // String types
      if (typeName.includes('STRING')) {
        const length = dataType.options?.length || dataType._length || '';
        return { typeString: length ? `STRING(${length})` : 'STRING' };
      }
      if (typeName.includes('TEXT')) return { typeString: 'TEXT' };
      if (typeName.includes('CHAR')) return { typeString: 'STRING' };
      
      // Numeric types
      if (typeName.includes('INTEGER')) return { typeString: 'INTEGER' };
      if (typeName.includes('BIGINT')) return { typeString: 'BIGINT' };
      if (typeName.includes('SMALLINT')) return { typeString: 'SMALLINT' };
      if (typeName.includes('DECIMAL')) return { typeString: 'DECIMAL' };
      if (typeName.includes('FLOAT')) return { typeString: 'FLOAT' };
      if (typeName.includes('DOUBLE')) return { typeString: 'DOUBLE' };
      if (typeName.includes('REAL')) return { typeString: 'REAL' };
      
      // Date/Time types
      if (typeName.includes('DATE')) return { typeString: 'DATE' };
      if (typeName.includes('TIME')) return { typeString: 'TIME' };
      if (typeName.includes('TIMESTAMP')) return { typeString: 'TIMESTAMP' };
      
      // UUID
      if (typeName.includes('UUID')) return { typeString: 'UUID' };
      
      // Boolean
      if (typeName.includes('BOOLEAN')) return { typeString: 'BOOLEAN' };
      
      // Enum
      if (typeName.includes('ENUM')) {
        // Extract ENUM values
        const values = dataType.options?.values || dataType.values || [];
        return { 
          enumValues: Array.isArray(values) ? values : Object.values(values),
          typeString: 'ENUM',
        };
      }
      
      // JSON types
      if (typeName.includes('JSON')) return { typeString: 'JSON' };
      if (typeName.includes('JSONB')) return { typeString: 'JSONB' };
      
      // Array types (PostgreSQL)
      if (typeName.includes('ARRAY')) return { typeString: 'ARRAY' };
      
      // Binary types
      if (typeName.includes('BLOB')) return { typeString: 'BLOB' };
      if (typeName.includes('BYTEA')) return { typeString: 'BYTEA' };
      
      // Geometry types (PostGIS)
      if (typeName.includes('GEOMETRY')) return { typeString: 'GEOMETRY' };
      if (typeName.includes('GEOGRAPHY')) return { typeString: 'GEOGRAPHY' };
    }

    // Default fallback
    return { typeString: 'STRING' };
  }

  /**
   * Convert database type string to Sequelize DataType
   */
  private dbTypeToSequelizeType(dbType: string): string {
    if (!dbType) return 'STRING';
    
    const normalized = dbType.toLowerCase().trim();
    
    // Handle PostgreSQL types
    if (normalized.includes('character varying') || normalized.includes('varchar')) {
      const match = normalized.match(/\((\d+)\)/);
      const length = match ? match[1] : '';
      return length ? `STRING(${length})` : 'STRING';
    }
    
    if (normalized.includes('timestamp')) {
      return 'DATE';
    }
    
    if (normalized.includes('uuid')) {
      return 'UUID';
    }
    
    if (normalized.includes('boolean') || normalized.includes('bool')) {
      return 'BOOLEAN';
    }
    
    if (normalized.includes('integer') || normalized.includes('int')) {
      return 'INTEGER';
    }
    
    if (normalized.includes('text')) {
      return 'TEXT';
    }
    
    if (normalized.includes('enum') || normalized.includes('user-defined')) {
      return 'ENUM'; // Will need manual adjustment for enum values
    }
    
    // Default to STRING
    return 'STRING';
  }

  /**
   * Convert database column to model format
   */
  private dbColumnToModel(dbCol: any): any {
    const sequelizeType = this.dbTypeToSequelizeType(dbCol.type);
    
    return {
      allowNull: dbCol.allowNull !== false && dbCol.allowNull !== 'NO',
      name: dbCol.field || dbCol.Field,
      type: sequelizeType,
      unique: dbCol.unique || false,
    };
  }

  /**
   * Generate column definition code
   */
  private generateColumnDefinition(column: any): { code: string; imports: string[] } {
    const parts: string[] = [];
    const imports: string[] = [];
    
    // Get type string with enum values if applicable
    const typeInfo = this.getDataTypeString(column.type);
    
    // Check if column has enumValues stored separately (from extractModelColumns)
    const enumValues = column.enumValues || typeInfo.enumValues;
    
    if (typeInfo.typeString === 'ENUM' && enumValues && Array.isArray(enumValues) && enumValues.length > 0) {
      // Format enum values as: ENUM('value1', 'value2', 'value3')
      const enumValuesStr = enumValues.map((v: string) => `'${v}'`).join(', ');
      parts.push(`type: DataTypes.ENUM(${enumValuesStr}),`);
    } else {
      parts.push(`type: DataTypes.${typeInfo.typeString},`);
    }
    
    if (column.allowNull !== undefined) {
      parts.push(`allowNull: ${column.allowNull},`);
    }
    
    if (column.primaryKey) {
      parts.push(`primaryKey: true,`);
    }
    
    if (column.unique) {
      parts.push(`unique: true,`);
    }
    
    if (column.defaultValue !== undefined && column.defaultValue !== null) {
      const defaultValueCode = this.generateDefaultValue(column.defaultValue, column.type);
      if (defaultValueCode.code) {
        parts.push(`defaultValue: ${defaultValueCode.code},`);
        if (defaultValueCode.imports.length > 0) {
          imports.push(...defaultValueCode.imports);
        }
      }
    }

    return {
      code: `{\n    ${parts.join('\n    ')}\n  }`,
      imports: [...new Set(imports)], // Remove duplicates
    };
  }

  /**
   * Generate defaultValue code and track needed imports
   */
  private generateDefaultValue(defaultValue: any, _dataType: any): { code: string; imports: string[] } {
    const imports: string[] = [];

    // Handle UUIDV4
    if (defaultValue === DataTypes.UUIDV4 || (defaultValue && defaultValue.toString && defaultValue.toString().includes('UUIDV4'))) {
      imports.push('UUIDV4');
      return { code: 'DataTypes.UUIDV4', imports };
    }

    // Handle literal SQL values
    if (typeof defaultValue === 'function' && defaultValue.name === 'literal') {
      imports.push('literal');
      return { code: "literal('CURRENT_TIMESTAMP')", imports };
    }

    // Handle string literals
    if (typeof defaultValue === 'string') {
      return { code: `'${defaultValue}'`, imports: [] };
    }

    // Handle numbers
    if (typeof defaultValue === 'number') {
      return { code: String(defaultValue), imports: [] };
    }

    // Handle boolean
    if (typeof defaultValue === 'boolean') {
      return { code: String(defaultValue), imports: [] };
    }

    // Handle functions (like getIsoTimestamp)
    if (typeof defaultValue === 'function') {
      // Skip function defaults in migrations - they'll be handled by Sequelize
      return { code: '', imports: [] };
    }

    // Handle objects
    if (typeof defaultValue === 'object') {
      try {
        return { code: JSON.stringify(defaultValue), imports: [] };
      } catch {
        return { code: 'null', imports: [] };
      }
    }

    return { code: 'undefined', imports: [] };
  }

  /**
   * Generate createTable columns code
   */
  private generateCreateTableColumns(columns: any[]): { code: string; imports: string[] } {
    const lines: string[] = [];
    const allImports: string[] = [];
    
    for (const col of columns) {
      const def = this.generateColumnDefinition(col);
      lines.push(`${col.name}: ${def.code.replace(/\n/g, '\n    ')},`);
      if (def.imports.length > 0) {
        allImports.push(...def.imports);
      }
    }

    return {
      code: lines.join('\n'),
      imports: [...new Set(allImports)],
    };
  }

  /**
   * Generate migration file content
   */
  private generateMigrationFile(migrationName: string, upOps: string[], downOps: string[], imports: string[] = []): string {
    const hasOperations = upOps.length > 0;
    
    // Build imports statement
    const baseImports = ['DataTypes', 'QueryInterface'];
    const allImports = [...new Set([...baseImports, ...imports])];
    const importsStatement = `import { ${allImports.join(', ')} } from 'sequelize';`;

    return `${importsStatement}

export const up = async (queryInterface: QueryInterface) => {
${hasOperations ? upOps.join('\n') : '  // No changes detected'}
};

export const down = async (queryInterface: QueryInterface) => {
${hasOperations ? downOps.join('\n') : '  // No rollback needed'}
};
`;
  }

  /**
   * Generate SQL to populate a new NOT NULL column from existing columns
   * Uses smart pattern detection and generic fallbacks for any column type
   */
  private generatePopulateSQL(tableName: string, newColumnName: string, existingColumns: any, _columnInfo?: any): string | null {
    const columnLower = newColumnName.toLowerCase();
    const sources: string[] = [];
    
    // Pattern-based detection for common column names
    const patterns = {
      address: ['street', 'location'],
      amount: ['price', 'total', 'value'],
      city: ['location', 'address'],
      code: ['id', 'key', 'reference'],
      content: ['description', 'text', 'body'],
      count: ['total', 'number'],
      country: ['location', 'region'],
      date: ['created_at', 'timestamp'],
      description: ['content', 'text', 'body', 'note'],
      device_id: ['id', 'uuid'],
      email: ['username', 'login'],
      end_date: ['updated_at', 'date'],
      first_name: ['name', 'full_name'],
      full_name: ['first_name', 'last_name'],
      ip_address: ['ip', 'address'],
      last_name: ['surname', 'family_name'],
      mobile: ['phone', 'telephone'],
      name: ['title', 'label'],
      phone: ['mobile', 'telephone', 'contact'],
      postal_code: ['zip', 'zip_code'],
      price: ['cost', 'amount'],
      reference: ['code', 'key'],
      slug: ['name', 'title'],
      start_date: ['created_at', 'date'],
      state: ['status'],
      status: ['state', 'active'],
      street: ['address'],
      title: ['name', 'label', 'heading'],
      total: ['count', 'sum'],
      user_agent: ['agent', 'browser'],
      user_name: ['username', 'user_number', 'email'],
      username: ['user_number', 'email', 'login', 'account'],
    };
    
    // Try to find related columns based on patterns
    const findRelatedColumns = (colName: string): string[] => {
      const related: string[] = [];
      // Exact pattern match
      if (patterns[colName]) {
        patterns[colName].forEach(pattern => {
          Object.keys(existingColumns).forEach(existingCol => {
            if (existingCol.toLowerCase().includes(pattern.toLowerCase())) {
              related.push(existingCol);
            }
          });
        });
      }
      
      // Partial word match (e.g., "phone" in "phone_number")
      const colWords = colName.split('_');
      Object.keys(existingColumns).forEach(existingCol => {
        const existingWords = existingCol.toLowerCase().split('_');
        const commonWords = colWords.filter(w => existingWords.includes(w));
        if (commonWords.length > 0 && existingCol.toLowerCase() !== colName) {
          related.push(existingCol);
        }
      });
      
      return [...new Set(related)]; // Remove duplicates
    };
    
    const relatedColumns = findRelatedColumns(columnLower);
    
    // Build COALESCE sources based on related columns
    if (relatedColumns.length > 0) {
      relatedColumns.forEach(col => {
        // Special handling for email extraction
        if ((columnLower.includes('username') || columnLower.includes('user_name')) && col.toLowerCase() === 'email') {
          sources.push(`SUBSTRING(${col} FROM '^([^@]+)')`);
        } else if (columnLower.includes('phone') && col.toLowerCase() === 'email') {
          sources.push(`CASE WHEN ${col} ~ '^[0-9]+@' THEN SUBSTRING(${col} FROM '^([0-9]+)') ELSE NULL END`);
        } else if (columnLower === 'full_name' && (col.toLowerCase().includes('first') || col.toLowerCase().includes('last'))) {
          // Special case: build full_name from first_name + last_name
          const firstName = Object.keys(existingColumns).find(c => c.toLowerCase().includes('first'));
          const lastName = Object.keys(existingColumns).find(c => c.toLowerCase().includes('last'));
          if (firstName && lastName) {
            sources.push(`CONCAT_WS(' ', ${firstName}, ${lastName})`);
            return; // Skip adding individual columns
          }
        } else {
          sources.push(`NULLIF(${col}, '')`);
        }
      });
    }
    
    // Add smart defaults based on column name patterns
    if (columnLower.includes('email')) {
      if (existingColumns.id) sources.push(`'user_' || id::text || '@example.com'`);
    } else if (columnLower.includes('phone') || columnLower.includes('mobile')) {
      sources.push(`'0000000000'`);
    } else if (columnLower.includes('username') || columnLower.includes('user_name') || columnLower.includes('login')) {
      if (existingColumns.id) sources.push(`'user_' || id::text`);
    } else if (columnLower.includes('name') || columnLower.includes('title') || columnLower.includes('label')) {
      if (existingColumns.id) sources.push(`'Untitled_' || id::text`);
      else sources.push(`'Untitled'`);
    } else if (columnLower.includes('code') || columnLower.includes('reference')) {
      if (existingColumns.id) sources.push(`'REF_' || id::text`);
    } else if (columnLower.includes('slug')) {
      if (existingColumns.id) sources.push(`'slug-' || id::text`);
    } else if (columnLower.includes('description') || columnLower.includes('content') || columnLower.includes('text')) {
      sources.push(`''`);
    } else if (columnLower.includes('address') || columnLower.includes('street') || columnLower.includes('city')) {
      sources.push(`'Unknown'`);
    } else if (columnLower.includes('status') || columnLower.includes('state')) {
      sources.push(`'active'`);
    } else if (columnLower.includes('url') || columnLower.includes('link')) {
      sources.push(`'#'`);
    } else if (columnLower.includes('color')) {
      sources.push(`'#000000'`);
    } else if (columnLower.includes('count') || columnLower.includes('number')) {
      sources.push(`'0'`);
    } else {
      // Generic fallback: try to find any similar column
      const similarColumns = Object.keys(existingColumns).filter(col => {
        const colLowerExisting = col.toLowerCase();
        // Check if they share at least 3 characters or one full word
        const minLen = Math.min(columnLower.length, colLowerExisting.length);
        if (minLen >= 3) {
          for (let i = 0; i <= columnLower.length - 3; i++) {
            const substring = columnLower.substring(i, i + 3);
            if (colLowerExisting.includes(substring)) {
              return true;
            }
          }
        }
        return false;
      });
      
      if (similarColumns.length > 0) {
        sources.push(`NULLIF(${similarColumns[0]}, '')`);
      } else if (existingColumns.id) {
        // Ultimate fallback: use id
        sources.push(`'default_' || id::text`);
      } else {
        // Last resort: empty string
        sources.push(`''`);
      }
    }
    
    // Generate final UPDATE statement
    if (sources.length > 0) {
      return `UPDATE ${tableName} SET ${newColumnName} = COALESCE(${sources.join(', ')}) WHERE ${newColumnName} IS NULL;`;
    }
    
    return null;
  }

  /**
   * Generate SQL to set default values for all column types
   * Handles UUID, DATE, BOOLEAN, ENUM, INTEGER, DECIMAL, TEXT, JSON, etc.
   */
  private generateDefaultValueSQL(tableName: string, columnName: string, _columnInfo: any): string | null {
    const typeInfo = this.getDataTypeString(_columnInfo.type);
    const columnLower = columnName.toLowerCase();
    
    // UUID columns with UUIDV4 default - don't populate, the default will handle it
    if (typeInfo.typeString === 'UUID') {
      if (_columnInfo.defaultValue === DataTypes.UUIDV4 || _columnInfo.defaultValue === UUIDV4) {
        // UUIDV4 default will generate values automatically, no need to populate
        return null;
      }
      // If no default, use gen_random_uuid()
      return `UPDATE ${tableName} SET ${columnName} = gen_random_uuid() WHERE ${columnName} IS NULL;`;
    }
    
    // DATE/DATETIME/TIMESTAMP columns
    if (typeInfo.typeString === 'DATE' || typeInfo.typeString === 'DATETIME' || typeInfo.typeString === 'TIMESTAMP') {
      return `UPDATE ${tableName} SET ${columnName} = CURRENT_TIMESTAMP WHERE ${columnName} IS NULL;`;
    }
    
    // BOOLEAN columns - use false by default unless specified
    if (typeInfo.typeString === 'BOOLEAN') {
      const defaultValue = _columnInfo.defaultValue !== undefined ? _columnInfo.defaultValue : false;
      return `UPDATE ${tableName} SET ${columnName} = ${defaultValue} WHERE ${columnName} IS NULL;`;
    }
    
    // ENUM columns - use first enum value
    if (typeInfo.typeString === 'ENUM') {
      if (_columnInfo.enumValues && _columnInfo.enumValues.length > 0) {
        const firstValue = _columnInfo.enumValues[0];
        return `UPDATE ${tableName} SET ${columnName} = '${firstValue}' WHERE ${columnName} IS NULL;`;
      } else if (typeInfo.enumValues && typeInfo.enumValues.length > 0) {
        const firstValue = typeInfo.enumValues[0];
        return `UPDATE ${tableName} SET ${columnName} = '${firstValue}' WHERE ${columnName} IS NULL;`;
      }
    }
    
    // INTEGER/BIGINT/SMALLINT columns - smart defaults based on column name
    if (typeInfo.typeString.includes('INTEGER') || typeInfo.typeString === 'BIGINT' || typeInfo.typeString === 'SMALLINT') {
      if (columnLower.includes('count') || columnLower.includes('quantity') || columnLower.includes('number')) {
        return `UPDATE ${tableName} SET ${columnName} = 0 WHERE ${columnName} IS NULL;`;
      } else if (columnLower.includes('age')) {
        return `UPDATE ${tableName} SET ${columnName} = 0 WHERE ${columnName} IS NULL;`;
      } else if (columnLower.includes('order') || columnLower.includes('sort') || columnLower.includes('position')) {
        return `UPDATE ${tableName} SET ${columnName} = 0 WHERE ${columnName} IS NULL;`;
      } else {
        return `UPDATE ${tableName} SET ${columnName} = 0 WHERE ${columnName} IS NULL;`;
      }
    }
    
    // DECIMAL/FLOAT/DOUBLE columns - for prices, amounts, etc.
    if (typeInfo.typeString.includes('DECIMAL') || typeInfo.typeString === 'FLOAT' || typeInfo.typeString === 'DOUBLE' || typeInfo.typeString === 'REAL') {
      if (columnLower.includes('price') || columnLower.includes('cost') || columnLower.includes('amount') || columnLower.includes('total')) {
        return `UPDATE ${tableName} SET ${columnName} = 0.00 WHERE ${columnName} IS NULL;`;
      } else if (columnLower.includes('rate') || columnLower.includes('percentage') || columnLower.includes('ratio')) {
        return `UPDATE ${tableName} SET ${columnName} = 0.0 WHERE ${columnName} IS NULL;`;
      } else {
        return `UPDATE ${tableName} SET ${columnName} = 0.0 WHERE ${columnName} IS NULL;`;
      }
    }
    
    // TEXT/LONGTEXT columns
    if (typeInfo.typeString === 'TEXT' || typeInfo.typeString === 'LONGTEXT' || typeInfo.typeString === 'MEDIUMTEXT') {
      return `UPDATE ${tableName} SET ${columnName} = '' WHERE ${columnName} IS NULL;`;
    }
    
    // JSON/JSONB columns
    if (typeInfo.typeString === 'JSON' || typeInfo.typeString === 'JSONB') {
      if (columnLower.includes('array') || columnLower.includes('list') || columnLower.includes('items')) {
        return `UPDATE ${tableName} SET ${columnName} = '[]'::json WHERE ${columnName} IS NULL;`;
      } else {
        return `UPDATE ${tableName} SET ${columnName} = '{}'::json WHERE ${columnName} IS NULL;`;
      }
    }
    
    // ARRAY columns (PostgreSQL)
    if (typeInfo.typeString.includes('ARRAY')) {
      return `UPDATE ${tableName} SET ${columnName} = ARRAY[]::text[] WHERE ${columnName} IS NULL;`;
    }
    
    // BLOB/BYTEA columns
    if (typeInfo.typeString === 'BLOB' || typeInfo.typeString === 'BYTEA') {
      return null; // Binary data shouldn't be auto-populated
    }
    
    return null;
  }

  /**
   * Convert camelCase to snake_case
   */
  private camelToSnake(str: string): string {
    return str.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
  }
}

