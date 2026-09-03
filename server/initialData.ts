import {
  Floor,
  Room,
  Bed,
  Resident,
  Payment,
  AdvanceAccount,
  Expense,
  Staff,
  SalaryPayment,
  MaintenanceRequest,
  Complaint,
  ResidentDocument,
  RoomAssignment,
  WhatsAppMessage,
  NotificationItem,
  AuditLog,
  SystemSettings
} from '../src/types';

export const initialSettings: SystemSettings = {
  property_name: 'Hanura Casa Luxury Living',
  hostel_code: 'HC-HYD-01',
  address: 'Plot 42, Silicon Valley Layout, Madhapur, Hyderabad, Telangana 500081',
  contact_phone: '+91 8882997700',
  contact_email: 'management@hanuracasa.com',
  upi_id: 'hanuracasa@icici',
  currency: '₹',
  default_due_day: 5,
  late_fee_grace_days: 5,
  late_fee_amount: 250,
  whatsapp_api_configured: true,
  whatsapp_phone_number_id: '8882997700',
  whatsapp_business_account_id: 'WABA-8882997700',
  whatsapp_access_token: 'EAAO...hc_prod_8882997700',
  whatsapp_webhook_secret: 'whsec_hanura_casa_2026',
  admin_name: 'Sathwik Pala (Director)',
  admin_email: 'palasathwik95@gmail.com',
  admin_role: 'Super Administrator'
};

// Generate Floors & Rooms & Beds
export const generateFloorsAndRooms = (): { floors: Floor[]; rooms: Room[]; beds: Bed[] } => {
  const floors: Floor[] = [];
  const rooms: Room[] = [];
  const beds: Bed[] = [];

  const floorConfigs = [
    { number: 1, name: 'Ground Floor (Premier)' },
    { number: 2, name: 'First Floor (Club)' },
    { number: 3, name: 'Second Floor (Executive)' },
    { number: 4, name: 'Third Floor (Sky Suite)' }
  ];

  floorConfigs.forEach(fc => {
    const floorRooms: Room[] = [];
    const floorId = `floor_${fc.number}`;

    // 6 rooms per floor
    for (let r = 1; r <= 6; r++) {
      const roomNumber = `${fc.number}0${r}`;
      const roomId = `room_${roomNumber}`;
      
      // Sharing configurations
      let sharingType: '5-Sharing' | '4-Sharing' | '3-Sharing' | '2-Sharing' = '4-Sharing';
      let capacity = 4;
      let monthlyFee = 6000;

      if (r === 1 || r === 2) {
        sharingType = '5-Sharing';
        capacity = 5;
        monthlyFee = 5500;
      } else if (r === 3 || r === 4) {
        sharingType = '4-Sharing';
        capacity = 4;
        monthlyFee = 6500;
      } else if (r === 5) {
        sharingType = '3-Sharing';
        capacity = 3;
        monthlyFee = 7500;
      } else {
        sharingType = '2-Sharing';
        capacity = 2;
        monthlyFee = 9000;
      }

      const roomBeds: Bed[] = [];
      for (let b = 1; b <= capacity; b++) {
        const bedId = `bed_${roomNumber}_${b}`;
        const bed: Bed = {
          id: bedId,
          room_id: roomId,
          bed_number: b,
          status: 'VACANT',
          current_resident_id: null,
          current_resident_name: null
        };
        beds.push(bed);
        roomBeds.push(bed);
      }

      const room: Room = {
        id: roomId,
        room_number: roomNumber,
        floor_id: floorId,
        floor_number: fc.number,
        sharing_type: sharingType,
        capacity: capacity,
        monthly_fee: monthlyFee,
        status: 'AVAILABLE',
        amenities: ['Attached Washroom', 'AC 1.5 Ton', 'Individual Wardrobe', 'High-Speed Wi-Fi', 'Study Desk & Lamp', 'Geyser Hot Water'],
        beds: roomBeds,
        occupied_beds_count: 0,
        vacant_beds_count: capacity
      };

      rooms.push(room);
      floorRooms.push(room);
    }

    floors.push({
      id: floorId,
      floor_number: fc.number,
      name: fc.name,
      rooms: floorRooms
    });
  });

  return { floors, rooms, beds };
};

export const initialResidentsData: Array<Partial<Resident> & {
  targetRoom: string;
  targetBed: number;
  openAdvance: number;
  isVacated?: boolean;
  historyLogs?: string[];
}> = [
  {
    id: 'RES-1001',
    name: 'Rahul Sharma',
    photo_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    phone: '+91 98451 22345',
    whatsapp: '+91 98451 22345',
    email: 'rahul.sharma@gmail.com',
    college: 'IIIT Hyderabad',
    course: 'B.Tech CSE',
    academic_year: '3rd Year',
    date_of_birth: '2004-06-14',
    parent_name: 'Anil Sharma',
    parent_phone: '+91 98450 11223',
    emergency_contact: '+91 98450 11223',
    permanent_address: 'Flat 402, Sai Nilayam, Ring Road, Vijayawada, AP',
    joining_date: '2025-08-01',
    monthly_fee: 6500,
    sharing_type: '4-Sharing',
    targetRoom: '204',
    targetBed: 3,
    openAdvance: 6500,
    kyc_status: 'VERIFIED',
    kyc_completion: 100
  },
  {
    id: 'RES-1002',
    name: 'Kiran Reddy',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    phone: '+91 97032 88192',
    whatsapp: '+91 97032 88192',
    email: 'kiran.reddy99@gmail.com',
    college: 'CBIT Gandipet',
    course: 'B.Tech IT',
    academic_year: '4th Year',
    date_of_birth: '2003-11-20',
    parent_name: 'Venkat Reddy',
    parent_phone: '+91 97030 77110',
    emergency_contact: '+91 97030 77110',
    permanent_address: 'H.No 3-4-12, Subhash Nagar, Warangal, TS',
    joining_date: '2025-07-15',
    monthly_fee: 5500,
    sharing_type: '5-Sharing',
    targetRoom: '101',
    targetBed: 1,
    openAdvance: 6000,
    kyc_status: 'VERIFIED',
    kyc_completion: 100
  },
  {
    id: 'RES-1003',
    name: 'Arjun Mehta',
    photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    phone: '+91 91234 56789',
    whatsapp: '+91 91234 56789',
    email: 'arjun.mehta@yahoo.com',
    college: 'VNR VJIET',
    course: 'B.Tech ECE',
    academic_year: '2nd Year',
    date_of_birth: '2005-03-10',
    parent_name: 'Rajesh Mehta',
    parent_phone: '+91 91234 00000',
    emergency_contact: '+91 91234 00000',
    permanent_address: 'Plot 18, Gandhi Nagar, Guntur, AP',
    joining_date: '2025-09-01',
    monthly_fee: 5500,
    sharing_type: '5-Sharing',
    targetRoom: '101',
    targetBed: 2,
    openAdvance: 5500,
    kyc_status: 'VERIFIED',
    kyc_completion: 100
  },
  {
    id: 'RES-1004',
    name: 'Suresh Kumar',
    photo_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
    phone: '+91 94401 23456',
    whatsapp: '+91 94401 23456',
    email: 'suresh.k2004@gmail.com',
    college: 'Vasavi College of Engg',
    course: 'B.Tech Mech',
    academic_year: '3rd Year',
    date_of_birth: '2004-01-25',
    parent_name: 'Narayana Swamy',
    parent_phone: '+91 94400 99887',
    emergency_contact: '+91 94400 99887',
    permanent_address: 'D.No 5-21, Ashok Nagar, Nizamabad, TS',
    joining_date: '2025-08-10',
    monthly_fee: 5500,
    sharing_type: '5-Sharing',
    targetRoom: '101',
    targetBed: 3,
    openAdvance: 5500,
    kyc_status: 'SUBMITTED',
    kyc_completion: 80
  },
  {
    id: 'RES-1005',
    name: 'Vikram Malhotra',
    photo_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
    phone: '+91 98112 33445',
    whatsapp: '+91 98112 33445',
    email: 'vikram.m@outlook.com',
    college: 'JNTUH College of Engg',
    course: 'M.Tech AI & Data Science',
    academic_year: '1st Year',
    date_of_birth: '2002-09-18',
    parent_name: 'Dinesh Malhotra',
    parent_phone: '+91 98110 00112',
    emergency_contact: '+91 98110 00112',
    permanent_address: 'B-14, Park View Apartments, Visakhapatnam, AP',
    joining_date: '2025-08-15',
    monthly_fee: 6500,
    sharing_type: '4-Sharing',
    targetRoom: '204',
    targetBed: 1,
    openAdvance: 6500,
    kyc_status: 'VERIFIED',
    kyc_completion: 100
  },
  {
    id: 'RES-1006',
    name: 'Aditya Sen',
    photo_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
    phone: '+91 96541 22334',
    whatsapp: '+91 96541 22334',
    email: 'aditya.sen@gmail.com',
    college: 'IIIT Hyderabad',
    course: 'B.Tech CSE',
    academic_year: '3rd Year',
    date_of_birth: '2004-12-05',
    parent_name: 'Pranab Sen',
    parent_phone: '+91 96540 11223',
    emergency_contact: '+91 96540 11223',
    permanent_address: '42, Lake View Colony, Tirupati, AP',
    joining_date: '2025-08-01',
    monthly_fee: 6500,
    sharing_type: '4-Sharing',
    targetRoom: '204',
    targetBed: 2,
    openAdvance: 6500,
    kyc_status: 'VERIFIED',
    kyc_completion: 100
  },
  {
    id: 'RES-1007',
    name: 'Karthik Nair',
    photo_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80',
    phone: '+91 98854 33211',
    whatsapp: '+91 98854 33211',
    email: 'karthik.nair9@gmail.com',
    college: 'IIIT Hyderabad',
    course: 'B.Tech ECE',
    academic_year: '3rd Year',
    date_of_birth: '2004-05-14',
    parent_name: 'Madhavan Nair',
    parent_phone: '+91 98850 00119',
    emergency_contact: '+91 98850 00119',
    permanent_address: 'House 12, Riverbed Road, Kozhikode / Hyderabad',
    joining_date: '2025-08-01',
    monthly_fee: 6500,
    sharing_type: '4-Sharing',
    targetRoom: '204',
    targetBed: 4,
    openAdvance: 6500,
    kyc_status: 'VERIFIED',
    kyc_completion: 100
  },
  {
    id: 'RES-1008',
    name: 'Sneha Patel',
    photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    phone: '+91 99887 76655',
    whatsapp: '+91 99887 76655',
    email: 'sneha.patel@gmail.com',
    college: 'Chaitanya Bharathi Institute',
    course: 'B.Tech AI',
    academic_year: '2nd Year',
    date_of_birth: '2005-07-22',
    parent_name: 'Bhupendra Patel',
    parent_phone: '+91 99880 00111',
    emergency_contact: '+91 99880 00111',
    permanent_address: 'A-201, Shanti Heights, Surat / Hyderabad',
    joining_date: '2025-09-01',
    monthly_fee: 5500,
    sharing_type: '5-Sharing',
    targetRoom: '102',
    targetBed: 1,
    openAdvance: 5500,
    kyc_status: 'VERIFIED',
    kyc_completion: 100
  },
  {
    id: 'RES-1009',
    name: 'Ananya Rao',
    photo_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    phone: '+91 97766 55443',
    whatsapp: '+91 97766 55443',
    email: 'ananya.rao@gmail.com',
    college: 'G. Narayanamma Institute',
    course: 'B.Tech CSE',
    academic_year: '3rd Year',
    date_of_birth: '2004-04-18',
    parent_name: 'Koteswara Rao',
    parent_phone: '+91 97760 11223',
    emergency_contact: '+91 97760 11223',
    permanent_address: 'H.No 1-9-88, Vidyanagar, Karimnagar, TS',
    joining_date: '2025-08-01',
    monthly_fee: 5500,
    sharing_type: '5-Sharing',
    targetRoom: '102',
    targetBed: 2,
    openAdvance: 5500,
    kyc_status: 'PENDING',
    kyc_completion: 40
  },
  {
    id: 'RES-1010',
    name: 'Rohan Verma',
    photo_url: 'https://images.unsplash.com/photo-1480429370139-e0132c086e2a?w=200&auto=format&fit=crop&q=80',
    phone: '+91 98234 56780',
    whatsapp: '+91 98234 56780',
    email: 'rohan.v@gmail.com',
    college: 'Mahindra University',
    course: 'B.Tech Civil',
    academic_year: '4th Year',
    date_of_birth: '2003-08-11',
    parent_name: 'Sanjeev Verma',
    parent_phone: '+91 98230 00112',
    emergency_contact: '+91 98230 00112',
    permanent_address: 'Sector 4, Bokaro / Hyderabad',
    joining_date: '2025-07-01',
    monthly_fee: 7500,
    sharing_type: '3-Sharing',
    targetRoom: '205',
    targetBed: 1,
    openAdvance: 7500,
    kyc_status: 'VERIFIED',
    kyc_completion: 100
  },
  {
    id: 'RES-1011',
    name: 'Manoj Pillai',
    photo_url: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=200&auto=format&fit=crop&q=80',
    phone: '+91 98401 99223',
    whatsapp: '+91 98401 99223',
    email: 'manoj.pillai@gmail.com',
    college: 'BITS Pilani Hyderabad',
    course: 'M.Sc Physics + CS',
    academic_year: '3rd Year',
    date_of_birth: '2004-10-30',
    parent_name: 'Ramachandran Pillai',
    parent_phone: '+91 98400 11998',
    emergency_contact: '+91 98400 11998',
    permanent_address: 'T-Square, Anna Nagar, Chennai',
    joining_date: '2025-08-01',
    monthly_fee: 9000,
    sharing_type: '2-Sharing',
    targetRoom: '306',
    targetBed: 1,
    openAdvance: 9000,
    kyc_status: 'VERIFIED',
    kyc_completion: 100
  },
  {
    id: 'RES-1012',
    name: 'Abhishek Choudhury',
    photo_url: 'https://images.unsplash.com/photo-1528892952291-009c663ce843?w=200&auto=format&fit=crop&q=80',
    phone: '+91 97112 88334',
    whatsapp: '+91 97112 88334',
    email: 'abhishek.c@gmail.com',
    college: 'IIIT Hyderabad',
    course: 'Ph.D NLP',
    academic_year: '2nd Year',
    date_of_birth: '2000-02-14',
    parent_name: 'Tapan Choudhury',
    parent_phone: '+91 97110 00223',
    emergency_contact: '+91 97110 00223',
    permanent_address: 'Bhubaneswar, Odisha',
    joining_date: '2025-06-01',
    monthly_fee: 9000,
    sharing_type: '2-Sharing',
    targetRoom: '406',
    targetBed: 1,
    openAdvance: 9000,
    kyc_status: 'VERIFIED',
    kyc_completion: 100
  },
  // Vacated Resident Example
  {
    id: 'RES-1099',
    name: 'Goutham Krishna',
    photo_url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=200&auto=format&fit=crop&q=80',
    phone: '+91 99123 44556',
    whatsapp: '+91 99123 44556',
    email: 'goutham.k@gmail.com',
    college: 'Osmania University',
    course: 'MCA',
    academic_year: 'Graduated',
    date_of_birth: '2002-05-12',
    parent_name: 'Krishna Murthy',
    parent_phone: '+91 99120 00112',
    emergency_contact: '+91 99120 00112',
    permanent_address: 'Nellore, Andhra Pradesh',
    joining_date: '2025-01-10',
    monthly_fee: 6500,
    sharing_type: '4-Sharing',
    targetRoom: '203',
    targetBed: 4,
    openAdvance: 6500,
    isVacated: true,
    kyc_status: 'VERIFIED',
    kyc_completion: 100
  }
];

export const initialStaffData: Staff[] = [
  {
    id: 'STF-01',
    name: 'Chef Raghuveer Singh',
    phone: '+91 98765 11221',
    role: 'Cook',
    joining_date: '2024-06-01',
    monthly_salary: 26000,
    status: 'ACTIVE',
    photo_url: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=200&auto=format&fit=crop&q=80',
    address: 'Madhapur Village, Hyderabad'
  },
  {
    id: 'STF-02',
    name: 'Shyamlal Yadav',
    phone: '+91 98765 22332',
    role: 'Cook',
    joining_date: '2024-09-01',
    monthly_salary: 18000,
    status: 'ACTIVE',
    photo_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80',
    address: 'Kondapur, Hyderabad'
  },
  {
    id: 'STF-03',
    name: 'Lakshmi Prasad',
    phone: '+91 98765 33443',
    role: 'Warden',
    joining_date: '2024-01-15',
    monthly_salary: 28000,
    status: 'ACTIVE',
    photo_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    address: 'Hanura Casa Staff Quarters, Floor 1'
  },
  {
    id: 'STF-04',
    name: 'Ramulu Naik',
    phone: '+91 98765 44554',
    role: 'Security',
    joining_date: '2024-03-01',
    monthly_salary: 16500,
    status: 'ACTIVE',
    photo_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
    address: 'Ayyappa Society, Hyderabad'
  },
  {
    id: 'STF-05',
    name: 'Manjula Bai',
    phone: '+91 98765 55665',
    role: 'Cleaning',
    joining_date: '2024-05-10',
    monthly_salary: 15000,
    status: 'ACTIVE',
    photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    address: 'Borabanda, Hyderabad'
  },
  {
    id: 'STF-06',
    name: 'Naveen Chary',
    phone: '+91 98765 66776',
    role: 'Maintenance Tech',
    joining_date: '2024-07-01',
    monthly_salary: 20000,
    status: 'ACTIVE',
    photo_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
    address: 'KPHB Colony, Hyderabad'
  }
];

export const initialComplaintsData: Complaint[] = [
  {
    id: 'CMP-2026-001',
    resident_id: 'RES-1001',
    resident_name: 'Rahul Sharma',
    room_number: '204',
    category: 'Wi-Fi',
    description: 'Wi-Fi signal drops frequently in the evening around 9 PM on 2nd floor.',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    assigned_person: 'Naveen Chary',
    created_at: '2026-08-18T10:30:00.000Z',
    resolved_at: null,
    resolution_notes: 'Mesh repeater ordered for second floor corridor.'
  },
  {
    id: 'CMP-2026-002',
    resident_id: 'RES-1002',
    resident_name: 'Kiran Reddy',
    room_number: '101',
    category: 'Food / Mess',
    description: 'Requesting less spice in Wednesday dinner curry.',
    priority: 'LOW',
    status: 'RESOLVED',
    assigned_person: 'Chef Raghuveer Singh',
    created_at: '2026-08-14T08:15:00.000Z',
    resolved_at: '2026-08-15T12:00:00.000Z',
    resolution_notes: 'Spices calibrated and mild gravy option prepared separately.'
  },
  {
    id: 'CMP-2026-003',
    resident_id: 'RES-1008',
    resident_name: 'Sneha Patel',
    room_number: '102',
    category: 'Plumbing',
    description: 'Washroom tap has slight water dripping in Room 102.',
    priority: 'HIGH',
    status: 'PENDING',
    assigned_person: 'Naveen Chary',
    created_at: '2026-08-19T14:20:00.000Z',
    resolved_at: null,
    resolution_notes: ''
  }
];

export const initialMaintenanceData: MaintenanceRequest[] = [
  {
    id: 'MNT-2026-001',
    resident_id: 'RES-1001',
    resident_name: 'Rahul Sharma',
    room_number: '204',
    bed_number: 3,
    category: 'AC Repair',
    description: 'AC filter cleaning and cooling coil check before summer peak.',
    priority: 'MEDIUM',
    assigned_staff: 'Naveen Chary',
    estimated_cost: 800,
    actual_cost: 750,
    status: 'RESOLVED',
    created_at: '2026-08-10T09:00:00.000Z',
    completion_date: '2026-08-11T16:00:00.000Z',
    resolution: 'Filter cleaned and gas pressure checked at 65 psi. Cooling verified.'
  },
  {
    id: 'MNT-2026-002',
    resident_id: 'RES-1010',
    resident_name: 'Rohan Verma',
    room_number: '205',
    bed_number: 1,
    category: 'Electrical Switch',
    description: 'Study lamp wall socket has loose contact.',
    priority: 'HIGH',
    assigned_staff: 'Naveen Chary',
    estimated_cost: 350,
    actual_cost: 300,
    status: 'RESOLVED',
    created_at: '2026-08-16T11:00:00.000Z',
    completion_date: '2026-08-16T15:30:00.000Z',
    resolution: 'Replaced anchor modular switch socket with new 6A unit.'
  },
  {
    id: 'MNT-2026-003',
    room_number: '305',
    category: 'Paint / Wall',
    description: 'Touch-up painting and sanitization before assigning to new resident.',
    priority: 'LOW',
    assigned_staff: 'Naveen Chary',
    estimated_cost: 1500,
    status: 'IN_PROGRESS',
    created_at: '2026-08-18T10:00:00.000Z',
    completion_date: null,
    resolution: 'Primer applied on north wall.'
  }
];
