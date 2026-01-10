import { QueryInterface } from 'sequelize';

export const up = async (queryInterface: QueryInterface) => {
  // Check if column exists before removing
  const tableDescription = await queryInterface.describeTable('contracts');
  
  if (tableDescription.managed_by_lookup_id) {
    // Remove foreign key constraint first
    try {
      await queryInterface.removeConstraint('contracts', 'contracts_managed_by_lookup_id_fkey');
      console.log('   ✅ Removed foreign key constraint for managed_by_lookup_id');
    } catch (error: any) {
      if (!error.message.includes('does not exist')) {
        console.log('   ⚠️  Could not remove foreign key constraint:', error.message);
      }
    }

    // Remove the column
    await queryInterface.removeColumn('contracts', 'managed_by_lookup_id');
    console.log('   ✅ Removed managed_by_lookup_id column from contracts table');
  } else {
    console.log('   ⚠️  Column managed_by_lookup_id does not exist in contracts table, skipping');
  }
};

export const down = async (queryInterface: QueryInterface) => {
  // Check if column exists before adding
  const tableDescription = await queryInterface.describeTable('contracts');
  
  if (!tableDescription.managed_by_lookup_id) {
    const { DataTypes } = await import('sequelize');
    
    // Add the column back
    await queryInterface.addColumn('contracts', 'managed_by_lookup_id', {
      allowNull: true,
      type: DataTypes.INTEGER,
    });

    // Add foreign key constraint
    try {
      await queryInterface.addConstraint('contracts', {
        fields: ['managed_by_lookup_id'],
        type: 'foreign key',
        name: 'contracts_managed_by_lookup_id_fkey',
        references: {
          table: 'lookups',
          field: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });
      console.log('   ✅ Added foreign key constraint for managed_by_lookup_id');
    } catch (error: any) {
      if (!error.message.includes('already exists')) {
        console.log('   ⚠️  Could not add foreign key constraint:', error.message);
      }
    }

    await queryInterface.sequelize.query(`
      COMMENT ON COLUMN "contracts"."managed_by_lookup_id" IS 'Reference to the Managed By lookup (WeFix Team or Client Team)';
    `);

    console.log('   ✅ Added managed_by_lookup_id column back to contracts table');
  } else {
    console.log('   ⚠️  Column managed_by_lookup_id already exists in contracts table, skipping');
  }
};
