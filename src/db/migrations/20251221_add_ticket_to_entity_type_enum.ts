import { QueryInterface } from 'sequelize';

export const up = async (queryInterface: QueryInterface) => {
  console.log('Adding "ticket" value to enum_files_entity_type enum...');
  const enumName = 'enum_files_entity_type';
  const valueToAdd = 'ticket';

  try {
    // Check if the value already exists
    const [results] = await queryInterface.sequelize.query(`
      SELECT enumlabel FROM pg_enum 
      WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = '${enumName}')
      AND enumlabel = '${valueToAdd}';
    `);
    
    if (Array.isArray(results) && results.length > 0) {
      console.log(`Note: "${valueToAdd}" already exists in ${enumName}`);
      return;
    }

    // PostgreSQL doesn't support IF NOT EXISTS for ALTER TYPE ADD VALUE
    // So we check first and only add if it doesn't exist
    await queryInterface.sequelize.query(`ALTER TYPE ${enumName} ADD VALUE '${valueToAdd}';`);
    console.log(`✓ Added "${valueToAdd}" to ${enumName}`);
  } catch (error: any) {
    if (error.message.includes('already exists')) {
      console.log(`Note: "${valueToAdd}" already exists in ${enumName}`);
    } else {
      console.log(`Note: Could not add "${valueToAdd}" to enum:`, error.message);
      throw error;
    }
  }
};

export const down = async (queryInterface: QueryInterface) => {
  console.log('Warning: PostgreSQL does not support removing enum values.');
  console.log('To remove enum values, you would need to:');
  console.log('1. Create a new enum type with the desired values');
  console.log('2. Update the column to use the new enum type');
  console.log('3. Drop the old enum type');
  console.log('This is a complex operation and may cause data loss.');
  console.log('Skipping down migration for safety.');
};

