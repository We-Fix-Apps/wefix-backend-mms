/**
 * Script to add zones to Zarqa Branch
 * Run this script to add zones directly to the database
 */

import { Branch } from '../models/branch.model';
import { Zone } from '../models/zone.model';
import { ZARQA_BRANCH_ZONES } from './zonesSeed';

export const addZarqaBranchZones = async (): Promise<void> => {
  try {
    console.log('\n🌱 Adding zones to Zarqa Branch...');

    // Find Zarqa Branch
    const zarqaBranch = await Branch.findOne({
      where: {
        branchTitle: 'Zarqa Branch',
        // Or use branchNameEnglish: 'Zarqa Branch'
      },
    });

    if (!zarqaBranch) {
      console.log('   ⚠️  Zarqa Branch not found. Please seed branches first.');
      return;
    }

    console.log(`   ✅ Found Zarqa Branch (ID: ${zarqaBranch.id})`);

    // Check if zones already exist for Zarqa Branch
    const existingZones = await Zone.findAll({
      where: {
        branchId: zarqaBranch.id,
      },
    });

    // Filter out zones that already exist
    const zonesToCreate = ZARQA_BRANCH_ZONES.filter(
      (zoneData) => !existingZones.some((existing) => existing.zoneNumber === zoneData.zoneNumber)
    );

    if (zonesToCreate.length === 0) {
      console.log('   ℹ️  All zones for Zarqa Branch already exist.');
      return;
    }

    let createdCount = 0;
    for (const zoneData of zonesToCreate) {
      try {
        await Zone.create({
          zoneTitle: zoneData.zoneTitle,
          zoneNumber: zoneData.zoneNumber,
          zoneDescription: zoneData.zoneDescription,
          branchId: zarqaBranch.id,
          isActive: zoneData.isActive,
        });

        createdCount++;
        console.log(`   ✅ Created zone: ${zoneData.zoneTitle} (${zoneData.zoneNumber})`);
      } catch (error: any) {
        console.error(`   ⚠️  Error creating zone "${zoneData.zoneTitle}":`, error.message);
      }
    }

    console.log(`   ✅ Added ${createdCount} zones to Zarqa Branch`);
  } catch (error: any) {
    console.error('   ❌ Error adding zones to Zarqa Branch:', error.message);
    throw error;
  }
};

