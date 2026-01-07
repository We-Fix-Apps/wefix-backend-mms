import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  // Add delegated_to_company_id column to tickets table
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

  // Make assign_to_team_leader_id nullable
  await queryInterface.changeColumn('tickets', 'assign_to_team_leader_id', {
    type: DataTypes.INTEGER,
    allowNull: true,
  });

  // Make assign_to_technician_id nullable
  await queryInterface.changeColumn('tickets', 'assign_to_technician_id', {
    type: DataTypes.INTEGER,
    allowNull: true,
  });
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
