import { QueryInterface } from 'sequelize';

export const up = async (queryInterface: QueryInterface) => {
  console.log('\n🔄 Updating Zarqa Branch to Company ID 2...');

  // Update Zarqa Branch to belong to Company ID 2 and set as active
  const [updatedRows] = await queryInterface.sequelize.query(`
    UPDATE branches
    SET company_id = 2,
        is_active = true,
        updated_at = NOW()
    WHERE branch_title = 'Zarqa Branch'
      AND is_deleted = false
  `) as [any[], unknown];

  const rowCount = Array.isArray(updatedRows) ? updatedRows.length : (updatedRows as any).rowCount || 0;

  if (rowCount > 0) {
    console.log(`   ✅ Updated Zarqa Branch to Company ID 2 (${rowCount} row(s) affected)`);
  } else {
    console.log('   ⚠️  Zarqa Branch not found. It will be created with Company ID 2 on next seed.');
  }
};

export const down = async (queryInterface: QueryInterface) => {
  // Revert: Set Zarqa Branch back to Company ID 1 and inactive
  await queryInterface.sequelize.query(`
    UPDATE branches
    SET company_id = 1,
        is_active = false,
        updated_at = NOW()
    WHERE branch_title = 'Zarqa Branch'
      AND is_deleted = false
  `);

  console.log('   ⚠️  Reverted Zarqa Branch to Company ID 1 (inactive)');
};

