export interface CompanySeedData {
  companyId: string;
  title: string;
  companyNameArabic: string | null;
  companyNameEnglish: string | null;
  countryLookupId: string | null; // Will be set dynamically from COUNTRY lookups
  hoAddress: string | null;
  hoLocation: string | null;
  isActive: boolean;
  logo: string | null;
  ticketShortCode: string | null;
}

export const COMPANIES_DATA: readonly Omit<CompanySeedData, 'countryLookupId'>[] = [
  {
    companyId: 'WEFIX001',
    title: 'WeFix',
    companyNameArabic: 'وي فيكس',
    companyNameEnglish: 'WeFix',
    hoAddress: 'Amman, Jordan',
    hoLocation: 'Amman, Jordan',
    isActive: true,
    logo: null,
    ticketShortCode: 'WEFIX',
  },
  {
    companyId: 'COMP001',
    title: 'Gamma Solutions',
    companyNameArabic: 'حلول جاما',
    companyNameEnglish: 'Gamma Solutions',
    hoAddress: '123 Business Street, Amman',
    hoLocation: 'Amman, Jordan',
    isActive: true,
    logo: null,
    ticketShortCode: 'GAMMA',
  },
  {
    companyId: 'COMP002',
    title: 'Strategic Holdings',
    companyNameArabic: 'الاستثمارات الاستراتيجية',
    companyNameEnglish: 'Strategic Holdings',
    hoAddress: '456 Corporate Avenue, Dubai',
    hoLocation: 'Dubai, UAE',
    isActive: true,
    logo: null,
    ticketShortCode: 'STRAT',
  },
  {
    companyId: 'COMP003',
    title: 'Alpha Industries',
    companyNameArabic: 'صناعات ألفا',
    companyNameEnglish: 'Alpha Industries',
    hoAddress: '789 Industrial Road, Riyadh',
    hoLocation: 'Riyadh, Saudi Arabia',
    isActive: true,
    logo: null,
    ticketShortCode: 'ALPHA',
  },
  {
    companyId: 'COMP004',
    title: 'Beta Technologies',
    companyNameArabic: 'تقنيات بيتا',
    companyNameEnglish: 'Beta Technologies',
    hoAddress: '321 Tech Park, Cairo',
    hoLocation: 'Cairo, Egypt',
    isActive: true,
    logo: null,
    ticketShortCode: 'BETA',
  },
  {
    companyId: 'COMP005',
    title: 'Delta Services',
    companyNameArabic: 'خدمات دلتا',
    companyNameEnglish: 'Delta Services',
    hoAddress: '654 Service Boulevard, Doha',
    hoLocation: 'Doha, Qatar',
    isActive: true,
    logo: null,
    ticketShortCode: 'DELTA',
  },
  {
    companyId: 'COMP006',
    title: 'Omega Group',
    companyNameArabic: 'مجموعة أوميغا',
    companyNameEnglish: 'Omega Group',
    hoAddress: '987 Group Plaza, Kuwait City',
    hoLocation: 'Kuwait City, Kuwait',
    isActive: true,
    logo: null,
    ticketShortCode: 'OMEGA',
  },
  {
    companyId: 'COMP007',
    title: 'Sigma Enterprises',
    companyNameArabic: 'مؤسسات سيجما',
    companyNameEnglish: 'Sigma Enterprises',
    hoAddress: '147 Enterprise Way, Beirut',
    hoLocation: 'Beirut, Lebanon',
    isActive: false,
    logo: null,
    ticketShortCode: 'SIGMA',
  },
  {
    companyId: 'COMP008',
    title: 'Theta Corporation',
    companyNameArabic: 'شركة ثيتا',
    companyNameEnglish: 'Theta Corporation',
    hoAddress: '258 Corporate Center, Muscat',
    hoLocation: 'Muscat, Oman',
    isActive: true,
    logo: null,
    ticketShortCode: 'THETA',
  },
  {
    companyId: 'COMP009',
    title: 'Lambda Systems',
    companyNameArabic: 'أنظمة لامدا',
    companyNameEnglish: 'Lambda Systems',
    hoAddress: '369 Systems Drive, Manama',
    hoLocation: 'Manama, Bahrain',
    isActive: true,
    logo: null,
    ticketShortCode: 'LAMDA',
  },
  {
    companyId: 'COMP010',
    title: 'Zeta Holdings',
    companyNameArabic: 'استثمارات زيتا',
    companyNameEnglish: 'Zeta Holdings',
    hoAddress: '741 Holdings Tower, Abu Dhabi',
    hoLocation: 'Abu Dhabi, UAE',
    isActive: true,
    logo: null,
    ticketShortCode: 'ZETA',
  },
];

