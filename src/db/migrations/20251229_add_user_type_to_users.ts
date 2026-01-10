import { DataTypes, QueryInterface } from 'sequelize';

export const up = async (queryInterface: QueryInterface) => {
  // Check if column already exists
  const tableDescription = await queryInterface.describeTable('users');
  
  if (!tableDescription.user_type_id) {
    // Add the user_type_id column
    await queryInterface.addColumn('users', 'user_type_id', {
      allowNull: false,
      type: DataTypes.INTEGER,
      defaultValue: 206, // Default to B2C
    });

    await queryInterface.sequelize.query(`
      COMMENT ON COLUMN "users"."user_type_id" IS 'User Type lookup reference: 206=B2C, 207=B2B';
    `);

    // Add foreign key constraint to lookups table
    await queryInterface.addConstraint('users', {
      fields: ['user_type_id'],
      type: 'foreign key',
      name: 'users_user_type_id_fkey',
      references: {
        table: 'lookups',
        field: 'id',
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });

    // Create unique constraint for B2B users (207) only with mobile_number
    // This ensures mobile_number is unique only when user_type_id = 207 (B2B)
    // The constraint is enforced at the database level for both INSERT and UPDATE operations
    // If a duplicate mobile_number is entered or updated for a B2B user, PostgreSQL will raise an error
    // Note: PostgreSQL implements partial unique constraints using partial unique indexes
    // The unique index automatically enforces uniqueness and raises database-level errors on duplicate
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX users_mobile_number_b2b_unique 
      ON users (mobile_number) 
      WHERE user_type_id = 207 AND mobile_number IS NOT NULL;
    `);

    console.log('   ✅ Added user_type_id column to users table');
    console.log('   ✅ Created unique constraint for mobile_number (B2B users only)');
  } else {
    console.log('   ⚠️  Column user_type_id already exists in users table, skipping');
  }
};

export const down = async (queryInterface: QueryInterface) => {
  const tableDescription = await queryInterface.describeTable('users');
  
  if (tableDescription.user_type_id) {
    // Drop the unique index (which enforces the unique constraint)
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS users_mobile_number_b2b_unique;
    `);

    // Remove foreign key constraint (using SQL to handle if it doesn't exist)
    await queryInterface.sequelize.query(`
      DO $$ 
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'users_user_type_id_fkey' 
          AND table_name = 'users'
        ) THEN
          ALTER TABLE "users" DROP CONSTRAINT "users_user_type_id_fkey";
        END IF;
      END $$;
    `);

    // Remove the column
    await queryInterface.removeColumn('users', 'user_type_id');
    
    console.log('   ✅ Removed user_type_id column from users table');
  }
};

