import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  console.log('Restoring customer_name and process_id fields to tickets table...');

  // Check if customer_name column exists, if not add it
  try {
    const [results] = await queryInterface.sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'tickets' 
      AND column_name = 'customer_name'
    `);

    if ((results as any[]).length === 0) {
      await queryInterface.addColumn('tickets', 'customer_name', {
        allowNull: true,
        type: DataTypes.STRING(255),
        comment: 'Individual customer name for the ticket',
      });
      console.log('✓ Added customer_name column to tickets table');
    } else {
      console.log('Note: customer_name column already exists in tickets table');
    }
  } catch (error: any) {
    console.log('Note: Could not add customer_name column:', error.message);
    throw error;
  }

  // Check if process_id column exists, if not add it
  try {
    const [results] = await queryInterface.sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'tickets' 
      AND column_name = 'process_id'
    `);

    if ((results as any[]).length === 0) {
      await queryInterface.addColumn('tickets', 'process_id', {
        allowNull: true,
        type: DataTypes.INTEGER,
        comment: 'Process lookup ID (e.g., Ready to Visit)',
      });
      console.log('✓ Added process_id column to tickets table');

      // Add foreign key constraint for processId if it doesn't exist
      try {
        const [constraintResults] = await queryInterface.sequelize.query(`
          SELECT constraint_name 
          FROM information_schema.table_constraints 
          WHERE table_name = 'tickets' 
          AND constraint_name = 'tickets_process_id_fkey'
        `);

        if ((constraintResults as any[]).length === 0) {
          await queryInterface.addConstraint('tickets', {
            fields: ['process_id'],
            name: 'tickets_process_id_fkey',
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE',
            references: {
              field: 'id',
              table: 'lookups',
            },
            type: 'foreign key',
          });
          console.log('✓ Added foreign key constraint for process_id');
        } else {
          console.log('Note: Foreign key constraint tickets_process_id_fkey already exists');
        }
      } catch (error: any) {
        console.log('Note: Could not add foreign key constraint:', error.message);
        // Don't throw here, as the column was added successfully
      }
    } else {
      console.log('Note: process_id column already exists in tickets table');
    }
  } catch (error: any) {
    console.log('Note: Could not add process_id column:', error.message);
    throw error;
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  console.log('Removing customer_name and process_id fields from tickets table...');

  // Remove foreign key constraint if it exists
  try {
    await queryInterface.removeConstraint('tickets', 'tickets_process_id_fkey');
    console.log('✓ Removed foreign key constraint tickets_process_id_fkey');
  } catch (error: any) {
    console.log('Note: Could not remove foreign key constraint:', error.message);
  }

  // Remove process_id column
  try {
    await queryInterface.removeColumn('tickets', 'process_id');
    console.log('✓ Removed process_id column from tickets table');
  } catch (error: any) {
    console.log('Note: Could not remove process_id column:', error.message);
  }

  // Remove customer_name column
  try {
    await queryInterface.removeColumn('tickets', 'customer_name');
    console.log('✓ Removed customer_name column from tickets table');
  } catch (error: any) {
    console.log('Note: Could not remove customer_name column:', error.message);
  }
}

