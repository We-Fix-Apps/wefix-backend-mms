import { DataTypes, QueryInterface } from 'sequelize';

export const up = async (queryInterface: QueryInterface) => {
  // Step 1: Drop the existing partial unique index
  await queryInterface.sequelize.query(`
    DROP INDEX IF EXISTS users_mobile_number_b2b_unique;
  `);

  // Step 2: Change the default value from 206 to 207 for user_type_id column
  await queryInterface.sequelize.query(`
    ALTER TABLE "users" 
    ALTER COLUMN "user_type_id" SET DEFAULT 207;
  `);

  // Step 3: Update existing NULL or default values to 207 (B2B)
  // Note: This will only affect new inserts, existing rows keep their current values
  await queryInterface.sequelize.query(`
    COMMENT ON COLUMN "users"."user_type_id" IS 'User Type lookup reference: 206=B2C, 207=B2B (default: 207)';
  `);

  // Step 4: Create a function to check mobile number uniqueness for users by type
  // This function will be called by the trigger
  await queryInterface.sequelize.query(`
    CREATE OR REPLACE FUNCTION check_user_type_mobile_number_unique()
    RETURNS TRIGGER AS $$
    BEGIN
      -- Check for both B2B (207) and B2C (206) users
      IF NEW.user_type_id IN (206, 207) AND NEW.mobile_number IS NOT NULL THEN
        -- Check if another user with the same type already has this mobile number
        IF EXISTS (
          SELECT 1 
          FROM users 
          WHERE mobile_number = NEW.mobile_number 
            AND user_type_id = NEW.user_type_id
            AND id != COALESCE(NEW.id, -1)
            AND is_deleted = false
        ) THEN
          RAISE EXCEPTION 'Mobile number % already exists for another % user. Mobile numbers must be unique within the same user type.', 
            NEW.mobile_number, 
            CASE WHEN NEW.user_type_id = 207 THEN 'B2B' ELSE 'B2C' END;
        END IF;
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Step 5: Create trigger for INSERT operations
  await queryInterface.sequelize.query(`
    DROP TRIGGER IF EXISTS trigger_check_user_type_mobile_number_insert ON users;
    CREATE TRIGGER trigger_check_user_type_mobile_number_insert
      BEFORE INSERT ON users
      FOR EACH ROW
      EXECUTE FUNCTION check_user_type_mobile_number_unique();
  `);

  // Step 6: Create trigger for UPDATE operations
  await queryInterface.sequelize.query(`
    DROP TRIGGER IF EXISTS trigger_check_user_type_mobile_number_update ON users;
    CREATE TRIGGER trigger_check_user_type_mobile_number_update
      BEFORE UPDATE ON users
      FOR EACH ROW
      WHEN (NEW.user_type_id IN (206, 207) AND NEW.mobile_number IS NOT NULL AND (OLD.mobile_number IS DISTINCT FROM NEW.mobile_number OR OLD.user_type_id != NEW.user_type_id))
      EXECUTE FUNCTION check_user_type_mobile_number_unique();
  `);

  console.log('   ✅ Dropped old partial unique index');
  console.log('   ✅ Changed default value for user_type_id from 206 to 207');
  console.log('   ✅ Created trigger to enforce mobile number uniqueness for B2B and B2C users within their respective types');
};

export const down = async (queryInterface: QueryInterface) => {
  // Step 1: Drop triggers
  await queryInterface.sequelize.query(`
    DROP TRIGGER IF EXISTS trigger_check_user_type_mobile_number_insert ON users;
    DROP TRIGGER IF EXISTS trigger_check_user_type_mobile_number_update ON users;
  `);

  // Step 2: Drop function
  await queryInterface.sequelize.query(`
    DROP FUNCTION IF EXISTS check_user_type_mobile_number_unique();
  `);

  // Step 3: Restore default value to 206
  await queryInterface.sequelize.query(`
    ALTER TABLE "users" 
    ALTER COLUMN "user_type_id" SET DEFAULT 206;
  `);

  await queryInterface.sequelize.query(`
    COMMENT ON COLUMN "users"."user_type_id" IS 'User Type lookup reference: 206=B2C, 207=B2B';
  `);

  // Step 4: Restore the partial unique index (old constraint)
  await queryInterface.sequelize.query(`
    CREATE UNIQUE INDEX users_mobile_number_b2b_unique 
    ON users (mobile_number) 
    WHERE user_type_id = 207 AND mobile_number IS NOT NULL;
  `);

  console.log('   ✅ Reverted to old partial unique index');
  console.log('   ✅ Changed default value for user_type_id from 207 to 206');
};

