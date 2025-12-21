import { DataTypes, QueryInterface } from 'sequelize';

export const up = async (queryInterface: QueryInterface) => {
  console.log('Changing files.id from UUID to INTEGER...');
  
  try {
    // First, check if id is UUID
    const tableDescription = await queryInterface.describeTable('files');
    const idType = tableDescription.id?.type;
    
    // Check if it's UUID type (could be 'uuid' or 'UUID' or include 'uuid')
    if (idType && (idType.toLowerCase().includes('uuid') || idType === 'CHARACTER VARYING(36)')) {
      console.log('Current id type is UUID, converting to INTEGER...');
      
      // Step 1: Add a temporary INTEGER column (without auto-increment for now)
      await queryInterface.addColumn('files', 'id_new', {
        type: DataTypes.INTEGER,
        allowNull: true, // Temporarily nullable
      });
      console.log('✓ Added temporary id_new column');
      
      // Step 2: Populate the new INTEGER column with sequential values
      // Create a sequence and populate existing rows
      await queryInterface.sequelize.query(`
        CREATE SEQUENCE IF NOT EXISTS files_id_new_seq;
        UPDATE files 
        SET id_new = nextval('files_id_new_seq')
        WHERE id_new IS NULL;
        SELECT setval('files_id_new_seq', COALESCE((SELECT MAX(id_new) FROM files), 0) + 1, false);
      `);
      console.log('✓ Populated id_new with sequential integers');
      
      // Step 3: Drop old primary key constraint
      try {
        await queryInterface.removeConstraint('files', 'files_pkey');
        console.log('✓ Removed old primary key constraint');
      } catch (error: any) {
        console.log('Note: Could not remove primary key constraint:', error.message);
      }
      
      // Step 4: Drop old id column
      await queryInterface.removeColumn('files', 'id');
      console.log('✓ Removed old id column');
      
      // Step 5: Rename new column to id
      await queryInterface.renameColumn('files', 'id_new', 'id');
      console.log('✓ Renamed id_new to id');
      
      // Step 6: Make id NOT NULL and set as primary key
      await queryInterface.changeColumn('files', 'id', {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      });
      console.log('✓ Set id as primary key with auto-increment');
      
      // Step 7: Update the sequence to be owned by the id column and set as default
      await queryInterface.sequelize.query(`
        ALTER SEQUENCE files_id_new_seq OWNED BY files.id;
        SELECT setval('files_id_new_seq', COALESCE((SELECT MAX(id) FROM files), 0) + 1, false);
      `);
      console.log('✓ Updated sequence for auto-increment');
      
    } else if (idType && idType.toLowerCase().includes('integer')) {
      console.log('Note: id is already INTEGER, no changes needed');
    } else {
      console.log(`Note: Unexpected id type: ${idType}. Skipping migration.`);
    }
  } catch (error: any) {
    console.log('Error changing id to INTEGER:', error.message);
    throw error;
  }
};

export const down = async (queryInterface: QueryInterface) => {
  console.log('Warning: Reverting id from INTEGER to UUID is complex and may cause data loss.');
  console.log('This operation requires:');
  console.log('1. Creating a new UUID column');
  console.log('2. Generating UUIDs for all existing records');
  console.log('3. Updating all foreign key references');
  console.log('4. Dropping and recreating the id column');
  console.log('Skipping down migration for safety. Please backup your data before attempting this manually.');
};

