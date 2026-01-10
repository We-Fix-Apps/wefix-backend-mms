import { QueryInterface } from 'sequelize';

export const up = async (queryInterface: QueryInterface) => {
  // Check if column exists
  const tableDescription = await queryInterface.describeTable('contracts');
  
  if (tableDescription.number_of_preventive_tickets) {
    // Remove the column
    await queryInterface.removeColumn('contracts', 'number_of_preventive_tickets');
    console.log('   ✅ Removed number_of_preventive_tickets column from contracts table');
  } else {
    console.log('   ⚠️  Column number_of_preventive_tickets does not exist in contracts table, skipping');
  }
};

export const down = async (queryInterface: QueryInterface) => {
  const tableDescription = await queryInterface.describeTable('contracts');
  
  if (!tableDescription.number_of_preventive_tickets) {
    const { DataTypes } = await import('sequelize');
    
    await queryInterface.addColumn('contracts', 'number_of_preventive_tickets', {
      allowNull: false,
      defaultValue: 0,
      type: DataTypes.INTEGER,
    });
    
    console.log('   ✅ Added number_of_preventive_tickets column back to contracts table');
  } else {
    console.log('   ⚠️  Column number_of_preventive_tickets already exists in contracts table, skipping');
  }
};
