import { DataTypes, QueryInterface } from 'sequelize';

export const up = async (queryInterface: QueryInterface) => {
  const tableDescription = await queryInterface.describeTable('contracts');
  
  if (!tableDescription.number_of_emergency_tickets) {
    await queryInterface.addColumn('contracts', 'number_of_emergency_tickets', {
      allowNull: false,
      defaultValue: 0,
      type: DataTypes.INTEGER,
    });
    
    console.log('   ✅ Added number_of_emergency_tickets column to contracts table');
  } else {
    console.log('   ⚠️  Column number_of_emergency_tickets already exists in contracts table, skipping');
  }
};

export const down = async (queryInterface: QueryInterface) => {
  const tableDescription = await queryInterface.describeTable('contracts');
  
  if (tableDescription.number_of_emergency_tickets) {
    await queryInterface.removeColumn('contracts', 'number_of_emergency_tickets');
    console.log('   ✅ Removed number_of_emergency_tickets column from contracts table');
  }
};
