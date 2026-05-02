/**
 * ReqFlow Database Seed Script
 *
 * Run with: node scripts/seed-database.js
 *
 * Make sure to install mongodb driver first:
 * npm install mongodb
 */

const { MongoClient, ObjectId } = require('mongodb');

// MongoDB Connection
const MONGODB_URI = 'mongodb+srv://Rayan:R%40y%40n123@cluster0.j1fsxxa.mongodb.net/reqflow?retryWrites=true&w=majority';

// ============== SAMPLE DATA ==============

// Users
const users = [
  {
    _id: new ObjectId(),
    name: 'Ahmed Al-Rashid',
    email: 'ahmed@reqflow.com',
    passwordHash: '$2b$10$XvQbLY8eBt5xvZ1234567890hashexample', // In production, use bcrypt
    role: 'client',
    title: 'Project Owner',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: new ObjectId(),
    name: 'Sara Mohammed',
    email: 'sara@reqflow.com',
    passwordHash: '$2b$10$XvQbLY8eBt5xvZ1234567890hashexample',
    role: 'manager',
    title: 'Project Manager',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: new ObjectId(),
    name: 'Khalid Hassan',
    email: 'khalid@reqflow.com',
    passwordHash: '$2b$10$XvQbLY8eBt5xvZ1234567890hashexample',
    role: 'member',
    title: 'Senior Developer',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: new ObjectId(),
    name: 'Fatima Ali',
    email: 'fatima@reqflow.com',
    passwordHash: '$2b$10$XvQbLY8eBt5xvZ1234567890hashexample',
    role: 'member',
    title: 'UI/UX Designer',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: new ObjectId(),
    name: 'Omar Nasser',
    email: 'omar@reqflow.com',
    passwordHash: '$2b$10$XvQbLY8eBt5xvZ1234567890hashexample',
    role: 'member',
    title: 'Backend Developer',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: new ObjectId(),
    name: 'Rayan Modiq',
    email: 'rayanmodiq@gmail.com',
    passwordHash: '$2b$10$XvQbLY8eBt5xvZ1234567890hashexample',
    role: 'manager',
    title: 'Admin',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Projects
const projects = [
  {
    _id: new ObjectId(),
    name: 'E-Commerce Platform',
    description: 'Full-featured e-commerce platform with payment integration, inventory management, and customer portal.',
    color: '#1353d8',
    owner: users[0]._id,
    members: [
      { user: users[1]._id, role: 'manager', joinedAt: new Date() },
      { user: users[2]._id, role: 'member', joinedAt: new Date() },
      { user: users[3]._id, role: 'member', joinedAt: new Date() },
      { user: users[4]._id, role: 'member', joinedAt: new Date() }
    ],
    status: 'active',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  },
  {
    _id: new ObjectId(),
    name: 'Mobile Banking App',
    description: 'Secure mobile banking application with biometric authentication and real-time transactions.',
    color: '#10b981',
    owner: users[0]._id,
    members: [
      { user: users[1]._id, role: 'manager', joinedAt: new Date() },
      { user: users[2]._id, role: 'member', joinedAt: new Date() },
      { user: users[4]._id, role: 'member', joinedAt: new Date() }
    ],
    status: 'active',
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date()
  },
  {
    _id: new ObjectId(),
    name: 'Healthcare Portal',
    description: 'Patient management system with appointment scheduling, medical records, and telemedicine features.',
    color: '#f59e0b',
    owner: users[0]._id,
    members: [
      { user: users[1]._id, role: 'manager', joinedAt: new Date() },
      { user: users[3]._id, role: 'member', joinedAt: new Date() }
    ],
    status: 'active',
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date()
  }
];

// Requirements
const requirements = [
  // E-Commerce Platform Requirements
  {
    _id: new ObjectId(),
    requirementId: 'REQ-001',
    projectId: projects[0]._id.toString(),
    title: 'User Registration and Authentication',
    description: 'Implement a secure user registration system with email verification, password requirements (minimum 8 characters, uppercase, lowercase, number, special character), and OAuth integration for Google and Facebook login.',
    originalDescription: null,
    type: 'functional',
    priority: 'critical',
    status: 'approved',
    deadline: new Date('2024-06-01'),
    assignee: {
      id: users[2]._id.toString(),
      name: users[2].name,
      role: users[2].role
    },
    createdBy: {
      id: users[0]._id.toString(),
      name: users[0].name,
      role: users[0].role
    },
    acceptanceCriteria: [
      {
        text: 'User can register with email and password',
        createdBy: { id: users[0]._id.toString(), name: users[0].name, role: users[0].role },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        text: 'Email verification is sent upon registration',
        createdBy: { id: users[0]._id.toString(), name: users[0].name, role: users[0].role },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        text: 'OAuth login works with Google and Facebook',
        createdBy: { id: users[0]._id.toString(), name: users[0].name, role: users[0].role },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    linkedRequirementIds: [],
    duplicateGroupId: null,
    mergedFromIds: [],
    mergedIntoRequirementId: null,
    comments: [
      {
        author: { id: users[1]._id.toString(), name: users[1].name, role: users[1].role },
        message: 'Please ensure we follow OWASP security guidelines for authentication.',
        kind: 'comment',
        createdAt: new Date('2024-04-15'),
        updatedAt: new Date('2024-04-15')
      }
    ],
    versions: [
      {
        versionNumber: 1,
        snapshot: {
          title: 'User Registration and Authentication',
          description: 'Implement a secure user registration system with email verification.',
          type: 'functional',
          priority: 'high',
          status: 'draft',
          acceptanceCriteria: ['User can register with email and password'],
          linkedRequirementIds: []
        },
        changeSummary: 'Initial requirement creation',
        editedBy: { id: users[0]._id.toString(), name: users[0].name, role: users[0].role },
        createdAt: new Date('2024-04-01')
      }
    ],
    history: [
      {
        action: 'Requirement created',
        details: null,
        actor: { id: users[0]._id.toString(), name: users[0].name, role: users[0].role },
        createdAt: new Date('2024-04-01')
      },
      {
        action: 'Status changed to review',
        details: 'Submitted for review',
        actor: { id: users[0]._id.toString(), name: users[0].name, role: users[0].role },
        createdAt: new Date('2024-04-10')
      },
      {
        action: 'Assigned to Khalid Hassan',
        details: null,
        actor: { id: users[1]._id.toString(), name: users[1].name, role: users[1].role },
        createdAt: new Date('2024-04-12')
      },
      {
        action: 'Status changed to approved',
        details: 'Approved by project owner',
        actor: { id: users[0]._id.toString(), name: users[0].name, role: users[0].role },
        createdAt: new Date('2024-04-20')
      }
    ],
    rejectionReason: null,
    archivedAt: null,
    isArchived: false,
    createdAt: new Date('2024-04-01'),
    updatedAt: new Date()
  },
  {
    _id: new ObjectId(),
    requirementId: 'REQ-002',
    projectId: projects[0]._id.toString(),
    title: 'Shopping Cart Functionality',
    description: 'Implement a shopping cart system that allows users to add, remove, and update product quantities. Cart should persist across sessions and support guest checkout.',
    originalDescription: null,
    type: 'functional',
    priority: 'high',
    status: 'review',
    deadline: new Date('2024-06-15'),
    assignee: {
      id: users[4]._id.toString(),
      name: users[4].name,
      role: users[4].role
    },
    createdBy: {
      id: users[0]._id.toString(),
      name: users[0].name,
      role: users[0].role
    },
    acceptanceCriteria: [
      {
        text: 'Users can add products to cart',
        createdBy: { id: users[0]._id.toString(), name: users[0].name, role: users[0].role },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        text: 'Cart persists after browser close',
        createdBy: { id: users[0]._id.toString(), name: users[0].name, role: users[0].role },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        text: 'Guest users can checkout without account',
        createdBy: { id: users[0]._id.toString(), name: users[0].name, role: users[0].role },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    linkedRequirementIds: ['REQ-001'],
    duplicateGroupId: null,
    mergedFromIds: [],
    mergedIntoRequirementId: null,
    comments: [
      {
        author: { id: users[2]._id.toString(), name: users[2].name, role: users[2].role },
        message: 'Should we use localStorage or server-side sessions for cart persistence?',
        kind: 'clarification-request',
        createdAt: new Date('2024-04-18'),
        updatedAt: new Date('2024-04-18')
      },
      {
        author: { id: users[0]._id.toString(), name: users[0].name, role: users[0].role },
        message: 'Use both - localStorage for guests and sync with server for logged-in users.',
        kind: 'clarification-response',
        createdAt: new Date('2024-04-19'),
        updatedAt: new Date('2024-04-19')
      }
    ],
    versions: [],
    history: [
      {
        action: 'Requirement created',
        details: null,
        actor: { id: users[0]._id.toString(), name: users[0].name, role: users[0].role },
        createdAt: new Date('2024-04-05')
      },
      {
        action: 'Status changed to review',
        details: 'Ready for review',
        actor: { id: users[0]._id.toString(), name: users[0].name, role: users[0].role },
        createdAt: new Date('2024-04-16')
      }
    ],
    rejectionReason: null,
    archivedAt: null,
    isArchived: false,
    createdAt: new Date('2024-04-05'),
    updatedAt: new Date()
  },
  {
    _id: new ObjectId(),
    requirementId: 'REQ-003',
    projectId: projects[0]._id.toString(),
    title: 'Payment Gateway Integration',
    description: 'Integrate Stripe and PayPal payment gateways. Support credit/debit cards, digital wallets, and buy-now-pay-later options. Implement PCI-DSS compliant payment processing.',
    originalDescription: null,
    type: 'functional',
    priority: 'critical',
    status: 'draft',
    deadline: new Date('2024-07-01'),
    assignee: null,
    createdBy: {
      id: users[0]._id.toString(),
      name: users[0].name,
      role: users[0].role
    },
    acceptanceCriteria: [
      {
        text: 'Stripe integration is complete and tested',
        createdBy: { id: users[0]._id.toString(), name: users[0].name, role: users[0].role },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        text: 'PayPal checkout works correctly',
        createdBy: { id: users[0]._id.toString(), name: users[0].name, role: users[0].role },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    linkedRequirementIds: ['REQ-002'],
    duplicateGroupId: null,
    mergedFromIds: [],
    mergedIntoRequirementId: null,
    comments: [],
    versions: [],
    history: [
      {
        action: 'Requirement created',
        details: null,
        actor: { id: users[0]._id.toString(), name: users[0].name, role: users[0].role },
        createdAt: new Date('2024-04-10')
      }
    ],
    rejectionReason: null,
    archivedAt: null,
    isArchived: false,
    createdAt: new Date('2024-04-10'),
    updatedAt: new Date()
  },
  {
    _id: new ObjectId(),
    requirementId: 'REQ-004',
    projectId: projects[0]._id.toString(),
    title: 'Product Search and Filtering',
    description: 'Implement advanced search functionality with filters for category, price range, brand, ratings, and availability. Include autocomplete suggestions and search history.',
    originalDescription: null,
    type: 'functional',
    priority: 'medium',
    status: 'approved',
    deadline: new Date('2024-05-20'),
    assignee: {
      id: users[2]._id.toString(),
      name: users[2].name,
      role: users[2].role
    },
    createdBy: {
      id: users[0]._id.toString(),
      name: users[0].name,
      role: users[0].role
    },
    acceptanceCriteria: [
      {
        text: 'Search returns relevant results within 500ms',
        createdBy: { id: users[0]._id.toString(), name: users[0].name, role: users[0].role },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        text: 'All filter combinations work correctly',
        createdBy: { id: users[0]._id.toString(), name: users[0].name, role: users[0].role },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    linkedRequirementIds: [],
    duplicateGroupId: null,
    mergedFromIds: [],
    mergedIntoRequirementId: null,
    comments: [],
    versions: [],
    history: [
      {
        action: 'Requirement created',
        details: null,
        actor: { id: users[0]._id.toString(), name: users[0].name, role: users[0].role },
        createdAt: new Date('2024-04-02')
      },
      {
        action: 'Status changed to approved',
        details: 'Approved',
        actor: { id: users[0]._id.toString(), name: users[0].name, role: users[0].role },
        createdAt: new Date('2024-04-25')
      }
    ],
    rejectionReason: null,
    archivedAt: null,
    isArchived: false,
    createdAt: new Date('2024-04-02'),
    updatedAt: new Date()
  },
  {
    _id: new ObjectId(),
    requirementId: 'REQ-005',
    projectId: projects[0]._id.toString(),
    title: 'System Performance Requirements',
    description: 'The system must handle 10,000 concurrent users with page load times under 3 seconds. API response times should be under 200ms for 95th percentile.',
    originalDescription: null,
    type: 'non-functional',
    priority: 'high',
    status: 'locked',
    deadline: null,
    assignee: {
      id: users[4]._id.toString(),
      name: users[4].name,
      role: users[4].role
    },
    createdBy: {
      id: users[0]._id.toString(),
      name: users[0].name,
      role: users[0].role
    },
    acceptanceCriteria: [
      {
        text: 'Load tests pass with 10,000 concurrent users',
        createdBy: { id: users[1]._id.toString(), name: users[1].name, role: users[1].role },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        text: 'Performance monitoring is in place',
        createdBy: { id: users[1]._id.toString(), name: users[1].name, role: users[1].role },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    linkedRequirementIds: [],
    duplicateGroupId: null,
    mergedFromIds: [],
    mergedIntoRequirementId: null,
    comments: [],
    versions: [],
    history: [
      {
        action: 'Requirement created',
        details: null,
        actor: { id: users[0]._id.toString(), name: users[0].name, role: users[0].role },
        createdAt: new Date('2024-03-28')
      },
      {
        action: 'Status changed to locked',
        details: 'Locked by manager',
        actor: { id: users[1]._id.toString(), name: users[1].name, role: users[1].role },
        createdAt: new Date('2024-04-30')
      }
    ],
    rejectionReason: null,
    archivedAt: null,
    isArchived: false,
    createdAt: new Date('2024-03-28'),
    updatedAt: new Date()
  },
  // Mobile Banking App Requirements
  {
    _id: new ObjectId(),
    requirementId: 'REQ-006',
    projectId: projects[1]._id.toString(),
    title: 'Biometric Authentication',
    description: 'Implement fingerprint and Face ID authentication for iOS and Android. Include fallback to PIN/password when biometrics fail.',
    originalDescription: null,
    type: 'functional',
    priority: 'critical',
    status: 'approved',
    deadline: new Date('2024-05-15'),
    assignee: {
      id: users[2]._id.toString(),
      name: users[2].name,
      role: users[2].role
    },
    createdBy: {
      id: users[0]._id.toString(),
      name: users[0].name,
      role: users[0].role
    },
    acceptanceCriteria: [
      {
        text: 'Fingerprint authentication works on supported devices',
        createdBy: { id: users[0]._id.toString(), name: users[0].name, role: users[0].role },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        text: 'Face ID works on iPhone X and newer',
        createdBy: { id: users[0]._id.toString(), name: users[0].name, role: users[0].role },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    linkedRequirementIds: [],
    duplicateGroupId: null,
    mergedFromIds: [],
    mergedIntoRequirementId: null,
    comments: [],
    versions: [],
    history: [
      {
        action: 'Requirement created',
        details: null,
        actor: { id: users[0]._id.toString(), name: users[0].name, role: users[0].role },
        createdAt: new Date('2024-03-15')
      }
    ],
    rejectionReason: null,
    archivedAt: null,
    isArchived: false,
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date()
  },
  {
    _id: new ObjectId(),
    requirementId: 'REQ-007',
    projectId: projects[1]._id.toString(),
    title: 'Fund Transfer Module',
    description: 'Enable users to transfer funds between accounts, to other bank accounts, and internationally. Include real-time balance updates and transaction notifications.',
    originalDescription: null,
    type: 'functional',
    priority: 'high',
    status: 'review',
    deadline: new Date('2024-06-01'),
    assignee: {
      id: users[4]._id.toString(),
      name: users[4].name,
      role: users[4].role
    },
    createdBy: {
      id: users[0]._id.toString(),
      name: users[0].name,
      role: users[0].role
    },
    acceptanceCriteria: [
      {
        text: 'Internal transfers complete within 5 seconds',
        createdBy: { id: users[0]._id.toString(), name: users[0].name, role: users[0].role },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        text: 'Transaction notifications are sent via push and email',
        createdBy: { id: users[0]._id.toString(), name: users[0].name, role: users[0].role },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    linkedRequirementIds: ['REQ-006'],
    duplicateGroupId: null,
    mergedFromIds: [],
    mergedIntoRequirementId: null,
    comments: [],
    versions: [],
    history: [
      {
        action: 'Requirement created',
        details: null,
        actor: { id: users[0]._id.toString(), name: users[0].name, role: users[0].role },
        createdAt: new Date('2024-03-20')
      }
    ],
    rejectionReason: null,
    archivedAt: null,
    isArchived: false,
    createdAt: new Date('2024-03-20'),
    updatedAt: new Date()
  },
  {
    _id: new ObjectId(),
    requirementId: 'REQ-008',
    projectId: projects[1]._id.toString(),
    title: 'Security Compliance Requirements',
    description: 'Ensure compliance with PCI-DSS, SOC 2 Type II, and local banking regulations. Implement end-to-end encryption for all sensitive data.',
    originalDescription: null,
    type: 'non-functional',
    priority: 'critical',
    status: 'approved',
    deadline: null,
    assignee: null,
    createdBy: {
      id: users[0]._id.toString(),
      name: users[0].name,
      role: users[0].role
    },
    acceptanceCriteria: [
      {
        text: 'Pass PCI-DSS audit',
        createdBy: { id: users[0]._id.toString(), name: users[0].name, role: users[0].role },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        text: 'All data encrypted at rest and in transit',
        createdBy: { id: users[0]._id.toString(), name: users[0].name, role: users[0].role },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    linkedRequirementIds: [],
    duplicateGroupId: null,
    mergedFromIds: [],
    mergedIntoRequirementId: null,
    comments: [],
    versions: [],
    history: [
      {
        action: 'Requirement created',
        details: null,
        actor: { id: users[0]._id.toString(), name: users[0].name, role: users[0].role },
        createdAt: new Date('2024-03-10')
      }
    ],
    rejectionReason: null,
    archivedAt: null,
    isArchived: false,
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date()
  },
  // Healthcare Portal Requirements
  {
    _id: new ObjectId(),
    requirementId: 'REQ-009',
    projectId: projects[2]._id.toString(),
    title: 'Appointment Scheduling System',
    description: 'Allow patients to book, reschedule, and cancel appointments online. Include calendar integration, availability checking, and automated reminders.',
    originalDescription: null,
    type: 'functional',
    priority: 'high',
    status: 'draft',
    deadline: new Date('2024-07-15'),
    assignee: {
      id: users[3]._id.toString(),
      name: users[3].name,
      role: users[3].role
    },
    createdBy: {
      id: users[0]._id.toString(),
      name: users[0].name,
      role: users[0].role
    },
    acceptanceCriteria: [
      {
        text: 'Patients can view available time slots',
        createdBy: { id: users[0]._id.toString(), name: users[0].name, role: users[0].role },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        text: 'Automated SMS reminders sent 24 hours before appointment',
        createdBy: { id: users[0]._id.toString(), name: users[0].name, role: users[0].role },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    linkedRequirementIds: [],
    duplicateGroupId: null,
    mergedFromIds: [],
    mergedIntoRequirementId: null,
    comments: [],
    versions: [],
    history: [
      {
        action: 'Requirement created',
        details: null,
        actor: { id: users[0]._id.toString(), name: users[0].name, role: users[0].role },
        createdAt: new Date('2024-04-01')
      }
    ],
    rejectionReason: null,
    archivedAt: null,
    isArchived: false,
    createdAt: new Date('2024-04-01'),
    updatedAt: new Date()
  },
  {
    _id: new ObjectId(),
    requirementId: 'REQ-010',
    projectId: projects[2]._id.toString(),
    title: 'HIPAA Compliance',
    description: 'Ensure all patient data handling complies with HIPAA regulations. Implement audit logging, access controls, and data encryption.',
    originalDescription: null,
    type: 'non-functional',
    priority: 'critical',
    status: 'review',
    deadline: null,
    assignee: null,
    createdBy: {
      id: users[0]._id.toString(),
      name: users[0].name,
      role: users[0].role
    },
    acceptanceCriteria: [
      {
        text: 'Complete HIPAA compliance audit',
        createdBy: { id: users[0]._id.toString(), name: users[0].name, role: users[0].role },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        text: 'All access to patient data is logged',
        createdBy: { id: users[0]._id.toString(), name: users[0].name, role: users[0].role },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    linkedRequirementIds: [],
    duplicateGroupId: null,
    mergedFromIds: [],
    mergedIntoRequirementId: null,
    comments: [],
    versions: [],
    history: [
      {
        action: 'Requirement created',
        details: null,
        actor: { id: users[0]._id.toString(), name: users[0].name, role: users[0].role },
        createdAt: new Date('2024-03-25')
      }
    ],
    rejectionReason: null,
    archivedAt: null,
    isArchived: false,
    createdAt: new Date('2024-03-25'),
    updatedAt: new Date()
  },
  // Rejected Requirement Example
  {
    _id: new ObjectId(),
    requirementId: 'REQ-011',
    projectId: projects[0]._id.toString(),
    title: 'Cryptocurrency Payment Support',
    description: 'Add support for Bitcoin and Ethereum payments on the e-commerce platform.',
    originalDescription: null,
    type: 'functional',
    priority: 'low',
    status: 'rejected',
    deadline: null,
    assignee: null,
    createdBy: {
      id: users[2]._id.toString(),
      name: users[2].name,
      role: users[2].role
    },
    acceptanceCriteria: [],
    linkedRequirementIds: ['REQ-003'],
    duplicateGroupId: null,
    mergedFromIds: [],
    mergedIntoRequirementId: null,
    comments: [],
    versions: [],
    history: [
      {
        action: 'Requirement created',
        details: null,
        actor: { id: users[2]._id.toString(), name: users[2].name, role: users[2].role },
        createdAt: new Date('2024-04-20')
      },
      {
        action: 'Status changed to rejected',
        details: 'Out of scope for initial release',
        actor: { id: users[0]._id.toString(), name: users[0].name, role: users[0].role },
        createdAt: new Date('2024-04-22')
      }
    ],
    rejectionReason: 'Out of scope for initial release. May reconsider for v2.0.',
    archivedAt: null,
    isArchived: false,
    createdAt: new Date('2024-04-20'),
    updatedAt: new Date()
  }
];

// Activities/Audit Log
const activities = [
  {
    _id: new ObjectId(),
    type: 'created',
    actor: { id: users[0]._id.toString(), name: users[0].name, role: users[0].role },
    targetType: 'requirement',
    targetId: requirements[0]._id.toString(),
    targetTitle: requirements[0].title,
    projectId: projects[0]._id.toString(),
    details: { requirementId: 'REQ-001' },
    createdAt: new Date('2024-04-01'),
    updatedAt: new Date('2024-04-01')
  },
  {
    _id: new ObjectId(),
    type: 'assigned',
    actor: { id: users[1]._id.toString(), name: users[1].name, role: users[1].role },
    targetType: 'requirement',
    targetId: requirements[0]._id.toString(),
    targetTitle: requirements[0].title,
    projectId: projects[0]._id.toString(),
    details: { assignee: users[2].name },
    createdAt: new Date('2024-04-12'),
    updatedAt: new Date('2024-04-12')
  },
  {
    _id: new ObjectId(),
    type: 'approved',
    actor: { id: users[0]._id.toString(), name: users[0].name, role: users[0].role },
    targetType: 'requirement',
    targetId: requirements[0]._id.toString(),
    targetTitle: requirements[0].title,
    projectId: projects[0]._id.toString(),
    details: {},
    createdAt: new Date('2024-04-20'),
    updatedAt: new Date('2024-04-20')
  },
  {
    _id: new ObjectId(),
    type: 'commented',
    actor: { id: users[1]._id.toString(), name: users[1].name, role: users[1].role },
    targetType: 'requirement',
    targetId: requirements[0]._id.toString(),
    targetTitle: requirements[0].title,
    projectId: projects[0]._id.toString(),
    details: { message: 'Please ensure we follow OWASP security guidelines for authentication.' },
    createdAt: new Date('2024-04-15'),
    updatedAt: new Date('2024-04-15')
  },
  {
    _id: new ObjectId(),
    type: 'rejected',
    actor: { id: users[0]._id.toString(), name: users[0].name, role: users[0].role },
    targetType: 'requirement',
    targetId: requirements[10]._id.toString(),
    targetTitle: requirements[10].title,
    projectId: projects[0]._id.toString(),
    details: { reason: 'Out of scope for initial release' },
    createdAt: new Date('2024-04-22'),
    updatedAt: new Date('2024-04-22')
  }
];

// Notifications
const notifications = [
  {
    _id: new ObjectId(),
    userId: users[2]._id.toString(),
    type: 'assignment',
    title: 'New Assignment',
    message: 'You have been assigned to requirement REQ-001: User Registration and Authentication',
    relatedType: 'requirement',
    relatedId: requirements[0]._id.toString(),
    read: true,
    actorId: users[1]._id.toString(),
    actorName: users[1].name,
    createdAt: new Date('2024-04-12'),
    updatedAt: new Date('2024-04-12')
  },
  {
    _id: new ObjectId(),
    userId: users[2]._id.toString(),
    type: 'comment',
    title: 'New Comment',
    message: 'Sara Mohammed commented on REQ-001',
    relatedType: 'requirement',
    relatedId: requirements[0]._id.toString(),
    read: false,
    actorId: users[1]._id.toString(),
    actorName: users[1].name,
    createdAt: new Date('2024-04-15'),
    updatedAt: new Date('2024-04-15')
  },
  {
    _id: new ObjectId(),
    userId: users[0]._id.toString(),
    type: 'status_change',
    title: 'Requirement In Review',
    message: 'REQ-002: Shopping Cart Functionality is now in review',
    relatedType: 'requirement',
    relatedId: requirements[1]._id.toString(),
    read: false,
    actorId: users[0]._id.toString(),
    actorName: users[0].name,
    createdAt: new Date('2024-04-16'),
    updatedAt: new Date('2024-04-16')
  },
  {
    _id: new ObjectId(),
    userId: users[1]._id.toString(),
    type: 'deadline',
    title: 'Deadline Approaching',
    message: 'REQ-004: Product Search and Filtering deadline is in 3 days',
    relatedType: 'requirement',
    relatedId: requirements[3]._id.toString(),
    read: false,
    actorId: null,
    actorName: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// ============== SEED FUNCTION ==============

async function seedDatabase() {
  let client;

  try {
    console.log('🔗 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected successfully!\n');

    const db = client.db('reqflow');

    // Drop existing collections (optional - comment out to keep existing data)
    console.log('🗑️  Clearing existing data...');
    const collections = ['users', 'projects', 'requirements', 'activities', 'notifications'];
    for (const coll of collections) {
      try {
        await db.collection(coll).drop();
        console.log(`   Dropped ${coll}`);
      } catch (e) {
        // Collection might not exist
      }
    }
    console.log('');

    // Insert Users
    console.log('👥 Inserting users...');
    const usersResult = await db.collection('users').insertMany(users);
    console.log(`   Inserted ${usersResult.insertedCount} users`);

    // Insert Projects
    console.log('📁 Inserting projects...');
    const projectsResult = await db.collection('projects').insertMany(projects);
    console.log(`   Inserted ${projectsResult.insertedCount} projects`);

    // Insert Requirements
    console.log('📋 Inserting requirements...');
    const requirementsResult = await db.collection('requirements').insertMany(requirements);
    console.log(`   Inserted ${requirementsResult.insertedCount} requirements`);

    // Insert Activities
    console.log('📊 Inserting activities...');
    const activitiesResult = await db.collection('activities').insertMany(activities);
    console.log(`   Inserted ${activitiesResult.insertedCount} activities`);

    // Insert Notifications
    console.log('🔔 Inserting notifications...');
    const notificationsResult = await db.collection('notifications').insertMany(notifications);
    console.log(`   Inserted ${notificationsResult.insertedCount} notifications`);

    // Create indexes
    console.log('\n📇 Creating indexes...');

    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    console.log('   Created unique index on users.email');

    await db.collection('requirements').createIndex({ projectId: 1, status: 1, priority: 1 });
    await db.collection('requirements').createIndex({ requirementId: 1 }, { unique: true });
    await db.collection('requirements').createIndex({ title: 'text', description: 'text' });
    console.log('   Created indexes on requirements');

    await db.collection('activities').createIndex({ projectId: 1, createdAt: -1 });
    console.log('   Created index on activities');

    await db.collection('notifications').createIndex({ userId: 1, read: 1, createdAt: -1 });
    console.log('   Created index on notifications');

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${users.length}`);
    console.log(`   Projects: ${projects.length}`);
    console.log(`   Requirements: ${requirements.length}`);
    console.log(`   Activities: ${activities.length}`);
    console.log(`   Notifications: ${notifications.length}`);

    console.log('\n👤 Test User Credentials:');
    console.log('   Client: ahmed@reqflow.com');
    console.log('   Manager: sara@reqflow.com');
    console.log('   Member: khalid@reqflow.com');
    console.log('   Admin: rayanmodiq@gmail.com');
    console.log('   (All passwords need to be set via your auth system)');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Connection closed.');
    }
  }
}

// Run the seed
seedDatabase().catch(console.error);
