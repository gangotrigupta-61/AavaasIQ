// ─── Core Domain Types ───────────────────────────────────────────────────────

export interface Resident {
  id: string;
  name: string;
  flat: string;
  block: string;
  mobile: string;
  email: string;
  joinedAt: string;
  status: "active" | "inactive";
  societyName: string;
}

export type ComplaintStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type ComplaintPriority = 'low' | 'medium' | 'high' | 'urgent';
export type MaintenanceStatus = 'paid' | 'pending' | 'overdue';

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: "plumbing" | "electrical" | "lift" | "garbage" | "parking" | "noise" | "security" | "other" | string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  residentId: string;
  residentName: string;
  flat: string;
  societyId?: string;
  assignedTo?: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string | null;
}


export interface Visitor {
  id: string;
  residentId?: string;
  societyId?: string;
  name: string;
  purpose: "delivery" | "guest" | "service" | "cab" | "other";
  flatNo: string;
  residentName: string;
  visitDate?: string;
  expectedAt?: string;
  arrivedAt?: string;
  exitedAt?: string;
  status: "expected" | "approved" | "inside" | "exited" | "rejected";
  phone?: string;
  vehicleNo?: string;
  passCode?: string;
}

export interface Delivery {
  id: string;
  residentId?: string;
  societyId?: string;
  provider: string;
  trackingId: string;
  description: string;
  deliveryDate?: string;
  arrivedAt?: string;
  collectedAt?: string;
  status: 'expected' | 'received' | 'collected' | 'returned' | 'in_transit' | 'arrived';
  rawStatus?: 'expected' | 'received' | 'collected' | 'returned';
  flatNo?: string;
  residentName?: string;
}

export interface ServiceProvider {
  id: string;
  societyId?: string;
  userId?: string | null;
  name: string;
  category: string;
  phone?: string | null;
  rating: number;
  reviewCount: number;
  experience: string;
  startingPrice: number;
  verified: boolean;
  available: boolean;
  bio: string;
}

export interface Notice {
  id: string;
  societyId?: string;
  title: string;
  content: string;
  category: "general" | "maintenance" | "event" | "urgent";
  priority?: "normal" | "important" | "urgent";
  publishedAt: string;
  publishedBy: string;
}

export interface CommunityEvent {
  id: string;
  societyId?: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  organiser: string;
  category: 'festival' | 'meeting' | 'sports' | 'cultural' | 'maintenance';
  rsvpCount: number;
  maxCapacity?: number;
  isUserRsvpd?: boolean;
}

export interface MaintenanceBill {
  id: string;
  residentId: string;
  month: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: MaintenanceStatus;
  paymentReference?: string | null;
  societyId?: string;
}

export interface MaintenanceRecord {
  id: string;
  residentId: string;
  societyId: string;
  residentName?: string;
  flat?: string;
  block?: string;
  title: string;
  amount: number;
  dueDate: string;
  status: MaintenanceStatus;
  paymentReference?: string | null;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyContact {
  id: string;
  societyId?: string;
  name: string;
  category: string;
  phone: string;
  availableHours: string;
  description?: string | null;
  isActive?: boolean;
}

export interface EmergencyCategoryGroup {
  category: string;
  contacts: EmergencyContact[];
}

export interface ServiceBooking {
  id: string;
  serviceId?: string;
  providerId?: string;
  providerName?: string;
  residentId: string;
  residentName?: string;
  service: string;
  serviceTitle?: string;
  notes?: string | null;
  scheduledAt: string;
  status: 'pending' | 'accepted' | 'declined' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  amount: number;
  flat: string;
  block?: string | null;
  createdAt?: string;
}

// ─── UI Helper Types ─────────────────────────────────────────────────────────

export type BadgeVariant = "success" | "warning" | "error" | "info" | "neutral";

export type UserRole = "resident" | "admin" | "security" | "provider";

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
}

export interface StatCardData {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    direction: "up" | "down" | "neutral";
  };
  variant?: "default" | "warning" | "success" | "error";
}

export interface ActivityItem {
  id: string;
  type: "visitor" | "delivery" | "complaint" | "notice" | "payment" | "event";
  title: string;
  description: string;
  time: string;
  status?: string;
}
