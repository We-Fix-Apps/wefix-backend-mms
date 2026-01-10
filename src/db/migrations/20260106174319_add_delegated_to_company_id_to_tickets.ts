import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  // Helper to check if column exists
  const columnExists = async (tableName: string, columnName: string): Promise<boolean> => {
    try {
      const tableDescription = await queryInterface.describeTable(tableName);
      return columnName in tableDescription;
    } catch {
      return false;
    }
  };

  // Add delegated_to_company_id column to tickets table (if it doesn't exist)
  if (!(await columnExists('tickets', 'delegated_to_company_id'))) {
    await queryInterface.addColumn('tickets', 'delegated_to_company_id', {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Company ID to which this ticket is delegated (e.g., WeFix company ID 39)',
      references: {
        model: 'companies',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
    console.log('   ✅ Added delegated_to_company_id column to tickets table');
  } else {
    console.log('   ⚠️  Column delegated_to_company_id already exists in tickets table, skipping');
  }

  // Make assign_to_team_leader_id nullable (check current state first)
  const tableDescription = await queryInterface.describeTable('tickets');
  if (tableDescription.assign_to_team_leader_id?.allowNull === false) {
    await queryInterface.changeColumn('tickets', 'assign_to_team_leader_id', {
      type: DataTypes.INTEGER,
      allowNull: true,
    });
    console.log('   ✅ Made assign_to_team_leader_id nullable');
  } else {
    console.log('   ⚠️  assign_to_team_leader_id is already nullable, skipping');
  }

  // Make assign_to_technician_id nullable (check current state first)
  if (tableDescription.assign_to_technician_id?.allowNull === false) {
    await queryInterface.changeColumn('tickets', 'assign_to_technician_id', {
      type: DataTypes.INTEGER,
      allowNull: true,
    });
    console.log('   ✅ Made assign_to_technician_id nullable');
  } else {
    console.log('   ⚠️  assign_to_technician_id is already nullable, skipping');
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  // Remove delegated_to_company_id column
  await queryInterface.removeColumn('tickets', 'delegated_to_company_id');

  // Revert assign_to_team_leader_id to not null (but we can't enforce this if there are null values)
  await queryInterface.changeColumn('tickets', 'assign_to_team_leader_id', {
    type: DataTypes.INTEGER,
    allowNull: false,
  });

  // Revert assign_to_technician_id to not null (but we can't enforce this if there are null values)
  await queryInterface.changeColumn('tickets', 'assign_to_technician_id', {
    type: DataTypes.INTEGER,
    allowNull: false,
  });
}
