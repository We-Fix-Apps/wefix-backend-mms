import { QueryInterface } from 'sequelize';

/**
 * Migration Template
 * 
 * Replace this with your actual migration logic.
 * Common operations:
 * 
 * Add Column:
 *   await queryInterface.addColumn('table_name', 'column_name', {
 *     type: DataTypes.STRING(50),
 *     allowNull: true,
 *   });
 * 
 * Remove Column:
 *   await queryInterface.removeColumn('table_name', 'column_name');
 * 
 * Change Column:
 *   await queryInterface.changeColumn('table_name', 'column_name', {
 *     type: DataTypes.STRING(100),
 *     allowNull: false,
 *   });
 * 
 * Rename Column:
 *   await queryInterface.renameColumn('table_name', 'old_name', 'new_name');
 * 
 * Add Index:
 *   await queryInterface.addIndex('table_name', ['column_name'], {
 *     unique: true,
 *     name: 'index_name',
 *   });
 * 
 * Remove Index:
 *   await queryInterface.removeIndex('table_name', 'index_name');
 */
export const up = async (_queryInterface: QueryInterface) => {
  // TODO: Add your migration logic here
  // Example: await _queryInterface.addColumn('users', 'new_field', { type: DataTypes.STRING });
};

export const down = async (_queryInterface: QueryInterface) => {
  // TODO: Add your rollback logic here (reverse of up)
  // Example: await _queryInterface.removeColumn('users', 'new_field');
};
