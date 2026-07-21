import { z } from "zod";

export const employeeSchema = z.object({
  // ================= Personal Information =================
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  employeeId: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  maritalStatus: z.string().optional(),
  bloodGroup: z.string().optional(),
  nationality: z.string().optional(),
  citizenshipNumber: z.string().optional(),

  // ================= Address =================
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),

  // ================= Emergency Contact =================
  emergencyContactName: z.string().optional(),
  emergencyPhone: z.string().optional(),

  // ================= Employment Information =================
  department: z.string().min(1, "Department is required"),
  designation: z.string().min(1, "Designation is required"),
  joinDate: z.string().min(1, "Join date is required"),
  employmentType: z.string().optional(),
  confirmationDate: z.string().optional(),
  workLocation: z.string().optional(),
  status: z.string().optional(),
  // "" from an empty <select> would fail a UUID FK — coerce blank to undefined
  shiftId: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.string().uuid().optional(),
  ),
  reportingManagerId: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.string().uuid().optional(),
  ),

  // ================= Salary Information =================
  salary: z.coerce.number().min(0, "Salary must be positive"),
  salaryType: z.string().optional(),
  currency: z.string().optional(),
  salaryEffectiveDate: z.string().optional(),
  allowances: z.coerce.number().min(0).optional(),
  bonus: z.coerce.number().min(0).optional(),
  overtime: z.coerce.number().min(0).optional(),
  tax: z.coerce.number().min(0).optional(),
  pf: z.coerce.number().min(0).optional(),
  insurance: z.coerce.number().min(0).optional(),

  // ================= Bank Information =================
  bankName: z.string().optional(),
  accountHolderName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  ifscSwiftCode: z.string().optional(),
  paymentMethod: z.string().optional(),

  // ================= Government Information =================
  panTaxNumber: z.string().optional(),
  pfNumber: z.string().optional(),
  esiNumber: z.string().optional(),

  // ================= Notes =================
  salaryNotes: z.string().optional(),
});

export const expenseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  category: z.string().min(1, "Category is required"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  date: z.string().min(1, "Expense date is required"),
  description: z.string().optional(),
  status: z.string().optional(),
});

export const accountSchema = z.object({
  // ── Identity ──────────────────────────────────────────────
  accountNumber: z.string().optional(),
  name: z.string().min(1, "Account name is required"),
  industry: z.string().optional(),

  type: z
    .enum(["Customer", "Partner", "Prospect", "Competitor", "Vendor", "Other"])
    .optional(),

  status: z.enum(["Active", "Inactive", "Blocked"]).optional(),

  ownership: z
    .enum(["Private", "Public", "Government", "Partnership", "Non-Profit", "Other"])
    .optional(),

  // NOTE: rating/priority were each declared twice before, which silently
  // disabled the enum check. Declared once now.
  rating: z.enum(["Hot", "Warm", "Cold"]).optional().or(z.literal("")),
  priority: z.enum(["Low", "Medium", "High"]).optional().or(z.literal("")),

  territory: z.string().optional(),
  source: z.string().optional(),

  // ── Contact ───────────────────────────────────────────────
  website: z.string().optional(),
  // Allow "" so an untouched optional field doesn't fail validation.
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  mobile: z.string().optional(),

  // ── Financials (HTML number inputs give strings → coerce) ──
  annualRevenue: z.coerce.number().min(0, "Revenue cannot be negative").optional(),
  employees: z.coerce.number().int().min(0, "Employees cannot be negative").optional(),
  creditLimit: z.coerce.number().min(0, "Credit limit cannot be negative").optional(),
  currency: z.string().optional(),

  // ── Billing address ───────────────────────────────────────
  billingStreet: z.string().optional(),
  billingCity: z.string().optional(),
  billingState: z.string().optional(),
  billingCountry: z.string().optional(),
  billingZip: z.string().optional(),

  // ── Shipping address ──────────────────────────────────────
  shippingStreet: z.string().optional(),
  shippingCity: z.string().optional(),
  shippingState: z.string().optional(),
  shippingCountry: z.string().optional(),
  shippingZip: z.string().optional(),

  // ── Tax / relations ───────────────────────────────────────
  taxNumber: z.string().optional(),
  gstNumber: z.string().optional(),
  assignedToId: z.preprocess((v) => (v === "" ? undefined : v), z.string().uuid().optional()),
  parentAccountId: z.preprocess((v) => (v === "" ? undefined : v), z.string().uuid().optional()),

  // ── Misc ──────────────────────────────────────────────────
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  // Allow "" so an untouched optional field doesn't fail validation.
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
  notes: z.string().optional(),
  // "" from an empty <select> would fail a UUID FK — coerce blank to undefined
  accountId: z.preprocess((v) => (v === "" ? undefined : v), z.string().uuid().optional()),
  assignedToId: z.preprocess((v) => (v === "" ? undefined : v), z.string().uuid().optional()),
});

export const opportunitySchema = z.object({
  name: z
    .string()
    .trim()
    .min(
      1,
      "Opportunity name is required"
    ),

  accountId: z.preprocess(
    (value) =>
      value === ""
        ? undefined
        : value,
    z.string().uuid().optional()
  ),

  assignedToId: z.preprocess(
    (value) =>
      value === ""
        ? undefined
        : value,
    z.string().uuid().optional()
  ),

  stage: z
    .enum([
      "Prospecting",
      "Qualification",
      "Needs Analysis",
      "Value Proposition",
      "Decision Makers",
      "Perception Analysis",
      "Proposal/Price",
      "Negotiation/Review",
      "Closed Won",
      "Closed Lost",
    ])
    .optional(),

  value: z.coerce
    .number()
    .min(
      0,
      "Value cannot be negative"
    )
    .optional(),

  probability: z.coerce
    .number()
    .min(
      0,
      "Probability cannot be below 0"
    )
    .max(
      100,
      "Probability cannot exceed 100"
    )
    .optional(),

  closeDate: z
    .string()
    .optional(),

  source: z
    .string()
    .optional(),

  description: z
    .string()
    .optional(),
});

export const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),

  code: z.string().optional(),

  accountId: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.string().uuid().optional(),
  ),

  projectManagerId: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.string().uuid().optional(),
  ),

  clientId: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.string().uuid().optional(),
  ),

  status: z.string().optional(),

  priority: z.string().optional(),

  billingType: z.string().optional(),

  budget: z.coerce.number().min(0).optional(),

  estimatedHours: z.coerce.number().min(0).optional(),

  actualHours: z.coerce.number().min(0).optional(),

  progress: z.coerce.number().min(0).max(100).optional(),

  startDate: z.string().optional(),

  endDate: z.string().optional(),

  description: z.string().optional(),
});

export const supportSchema = z.object({
  subject: z.string().min(1, "Subject is required"),

  accountId: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.string().uuid().optional(),
  ),

  contactId: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.string().uuid().optional(),
  ),

  assignedToId: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.string().uuid().optional(),
  ),

  category: z.string().optional(),

  priority: z.string().optional(),

  status: z.string().optional(),

  severity: z.string().optional(),

  channel: z.string().optional(),

  resolution: z.string().optional(),

  dueDate: z.string().optional(),

  firstResponseTime: z.string().optional(),

  resolutionTime: z.string().optional(),

  description: z.string().optional(),
});

export const ticketSchema = z.object({
  subject: z.string().min(1, "Subject is required"),

  description: z.string().min(1, "Description is required"),

  category: z.string().optional(),

  priority: z.string().min(1, "Priority is required"),

  status: z.string().optional(),

  assignedToId: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.string().uuid().optional(),
  ),

  accountId: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.string().uuid().optional(),
  ),

  contactId: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.string().uuid().optional(),
  ),

  channel: z.string().optional(),

  severity: z.string().optional(),

  resolution: z.string().optional(),

  dueDate: z.string().optional(),
});
