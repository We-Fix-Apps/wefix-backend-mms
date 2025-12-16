
export interface ContractSeedData {
  contractTitle: string;
  companyId: string; // Will be set dynamically from existing companies
  businessModelLookupId: string; // Will be set dynamically from BUSINESS_MODEL lookups
  isActive: boolean;
  numberOfTeamLeaders: number;
  numberOfBranches: number;
  numberOfPreventiveTickets: number;
  numberOfCorrectiveTickets: number;
  contractStartDate: Date | null;
  contractEndDate: Date | null;
  contractValue: number | null;
  contractFiles: string | null;
  contractDescription: string | null;
}

export const CONTRACTS_DATA: readonly Omit<ContractSeedData, 'companyId' | 'businessModelLookupId'>[] = [
  {
    contractTitle: 'Annual Maintenance Contract 2025',
    isActive: true,
    numberOfTeamLeaders: 2,
    numberOfBranches: 3,
    numberOfPreventiveTickets: 12,
    numberOfCorrectiveTickets: 24,
    contractStartDate: new Date('2025-01-01'),
    contractEndDate: new Date('2025-12-31'),
    contractValue: 334121.50,
    contractFiles: null,
    contractDescription: 'Annual maintenance contract for 2025 covering preventive and corrective maintenance services.',
  },
  {
    contractTitle: 'Service Agreement 2023-2025',
    isActive: false,
    numberOfTeamLeaders: 1,
    numberOfBranches: 2,
    numberOfPreventiveTickets: 6,
    numberOfCorrectiveTickets: 12,
    contractStartDate: new Date('2023-02-23'),
    contractEndDate: new Date('2025-04-07'),
    contractValue: 391184.00,
    contractFiles: null,
    contractDescription: 'Multi-year service agreement covering maintenance and support services.',
  },
  {
    contractTitle: 'Premium Support Package',
    isActive: true,
    numberOfTeamLeaders: 3,
    numberOfBranches: 5,
    numberOfPreventiveTickets: 24,
    numberOfCorrectiveTickets: 48,
    contractStartDate: new Date('2024-06-01'),
    contractEndDate: new Date('2026-05-31'),
    contractValue: 567890.25,
    contractFiles: null,
    contractDescription: 'Premium support package with extended coverage and priority response times.',
  },
  {
    contractTitle: 'Basic Maintenance Plan',
    isActive: true,
    numberOfTeamLeaders: 1,
    numberOfBranches: 1,
    numberOfPreventiveTickets: 4,
    numberOfCorrectiveTickets: 8,
    contractStartDate: new Date('2024-09-15'),
    contractEndDate: new Date('2025-09-14'),
    contractValue: 125000.00,
    contractFiles: null,
    contractDescription: 'Basic maintenance plan for small-scale operations.',
  },
  {
    contractTitle: 'Enterprise Service Contract',
    isActive: true,
    numberOfTeamLeaders: 5,
    numberOfBranches: 8,
    numberOfPreventiveTickets: 36,
    numberOfCorrectiveTickets: 72,
    contractStartDate: new Date('2024-01-01'),
    contractEndDate: new Date('2026-12-31'),
    contractValue: 1250000.00,
    contractFiles: null,
    contractDescription: 'Comprehensive enterprise-level service contract with full coverage.',
  },
  {
    contractTitle: 'Quarterly Service Agreement',
    isActive: true,
    numberOfTeamLeaders: 1,
    numberOfBranches: 2,
    numberOfPreventiveTickets: 3,
    numberOfCorrectiveTickets: 6,
    contractStartDate: new Date('2025-01-01'),
    contractEndDate: new Date('2025-03-31'),
    contractValue: 45000.00,
    contractFiles: null,
    contractDescription: 'Quarterly service agreement for Q1 2025.',
  },
  {
    contractTitle: 'White Label Partnership',
    isActive: true,
    numberOfTeamLeaders: 4,
    numberOfBranches: 6,
    numberOfPreventiveTickets: 18,
    numberOfCorrectiveTickets: 36,
    contractStartDate: new Date('2024-03-01'),
    contractEndDate: new Date('2027-02-28'),
    contractValue: 890000.00,
    contractFiles: null,
    contractDescription: 'White label partnership agreement for extended service delivery.',
  },
  {
    contractTitle: 'Standard Maintenance Contract',
    isActive: true,
    numberOfTeamLeaders: 2,
    numberOfBranches: 3,
    numberOfPreventiveTickets: 8,
    numberOfCorrectiveTickets: 16,
    contractStartDate: new Date('2024-11-01'),
    contractEndDate: new Date('2025-10-31'),
    contractValue: 245000.00,
    contractFiles: null,
    contractDescription: 'Standard maintenance contract with regular service intervals.',
  },
  {
    contractTitle: 'Emergency Support Agreement',
    isActive: false,
    numberOfTeamLeaders: 1,
    numberOfBranches: 1,
    numberOfPreventiveTickets: 0,
    numberOfCorrectiveTickets: 12,
    contractStartDate: new Date('2023-07-01'),
    contractEndDate: new Date('2024-06-30'),
    contractValue: 78000.00,
    contractFiles: null,
    contractDescription: 'Emergency support agreement for critical system maintenance.',
  },
  {
    contractTitle: 'Comprehensive Service Plan',
    isActive: true,
    numberOfTeamLeaders: 3,
    numberOfBranches: 4,
    numberOfPreventiveTickets: 16,
    numberOfCorrectiveTickets: 32,
    contractStartDate: new Date('2024-08-01'),
    contractEndDate: new Date('2026-07-31'),
    contractValue: 678000.00,
    contractFiles: null,
    contractDescription: 'Comprehensive service plan with full maintenance and support coverage.',
  },
];

