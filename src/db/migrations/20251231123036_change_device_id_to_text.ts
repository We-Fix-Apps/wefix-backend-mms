import { DataTypes, QueryInterface } from 'sequelize';

export const up = async (queryInterface: QueryInterface) => {
  const tableDescription = await queryInterface.describeTable('users');
  
  if (tableDescription.device_id) {
    // Change device_id from VARCHAR(128) to TEXT to support JSON metadata
    await queryInterface.changeColumn('users', 'device_id', {
      allowNull: false,
      type: DataTypes.TEXT,
    });

    await queryInterface.sequelize.query(`
      COMMENT ON COLUMN "users"."device_id" IS 'Device ID with metadata stored as JSON string (model, brand, manufacturer, etc.)';
    `);

    console.log('   ✅ Changed device_id column to TEXT in users table');
  } else {
    console.log('   ⚠️  Column device_id does not exist in users table, skipping');
  }
};

export const down = async (queryInterface: QueryInterface) => {
  const tableDescription = await queryInterface.describeTable('users');
  
  if (tableDescription.device_id) {
    // Revert back to VARCHAR(128)
    await queryInterface.changeColumn('users', 'device_id', {
      allowNull: false,
      type: DataTypes.STRING(128),
    });

    console.log('   ✅ Reverted device_id column to VARCHAR(128) in users table');
  }
};

