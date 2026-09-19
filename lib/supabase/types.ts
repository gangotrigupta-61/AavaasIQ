/**
 * Database types for the Phase 1 Supabase schema.
 * These types represent the 3 database tables: profiles, societies, society_memberships.
 *
 * DO NOT import from here in components that use the frontend mock data —
 * the existing lib/types.ts is for mock/domain types and is kept separate.
 */

export type UserRole = 'resident' | 'admin' | 'security' | 'provider';
export type MembershipStatus = 'active' | 'pending' | 'inactive';

/** Row type for the `profiles` table. */
export interface Profile {
  id: string;               // UUID — matches auth.users(id)
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;       // ISO 8601 timestamptz
  updated_at: string;
}

/** Row type for the `societies` table. */
export interface Society {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  created_at: string;
  updated_at: string;
}

/** Row type for the `society_memberships` table. */
export interface SocietyMembership {
  id: string;
  user_id: string;          // references profiles(id)
  society_id: string;       // references societies(id)
  flat_number: string | null;
  block: string | null;
  status: MembershipStatus;
  created_at: string;
}

/** Combined profile + membership data fetched for the resident dashboard. */
export interface ResidentProfileData {
  profile: Profile;
  membership: SocietyMembership | null;
  society: Society | null;
}

// ─── Phase 2: Complaints & Maintenance Database Types ─────────────────────────

export type ComplaintStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type ComplaintPriority = 'low' | 'medium' | 'high' | 'urgent';
export type MaintenanceStatus = 'pending' | 'paid' | 'overdue';

/** Row type for the `complaints` table in Supabase. */
export interface DbComplaint {
  id: string;
  resident_id: string;
  society_id: string;
  category: string;
  title: string;
  description: string | null;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

/** Row type for the `maintenance_records` table in Supabase. */
export interface DbMaintenanceRecord {
  id: string;
  resident_id: string;
  society_id: string;
  title: string;
  amount: number;
  due_date: string | null;
  status: MaintenanceStatus;
  payment_reference: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Phase 3 & 4: Database Types ──────────────────────────────────────────────

export type VisitorStatus = 'expected' | 'approved' | 'inside' | 'exited' | 'rejected';
export type DeliveryStatus = 'expected' | 'received' | 'collected' | 'returned';
export type NoticePriority = 'normal' | 'important' | 'urgent';

export interface DbVisitor {
  id: string;
  resident_id: string;
  society_id: string;
  visitor_name: string;
  visitor_phone: string | null;
  purpose: string | null;
  visit_date: string | null;
  expected_arrival: string | null;
  arrived_at: string | null;
  exited_at: string | null;
  pass_code: string | null;
  status: VisitorStatus;
  created_at: string;
  updated_at: string;
}

export interface DbDelivery {
  id: string;
  resident_id: string;
  society_id: string;
  courier_name: string | null;
  tracking_number: string | null;
  description: string | null;
  delivery_date: string | null;
  status: DeliveryStatus;
  received_at: string | null;
  collected_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbNotice {
  id: string;
  society_id: string;
  title: string;
  content: string;
  category: string | null;
  priority: NoticePriority;
  published_by: string | null;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export interface DbEvent {
  id: string;
  society_id: string;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbEventRsvp {
  id: string;
  event_id: string;
  resident_id: string;
  status: 'going' | 'not_going';
  created_at: string;
}

// ─── Phase 5: Home Services & Emergency Contacts Database Types ───────────────

export type ServiceBookingStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface DbServiceProvider {
  id: string;
  society_id: string;
  user_id: string | null;
  name: string;
  category: string;
  phone: string | null;
  rating: number;
  review_count: number;
  experience: string | null;
  starting_price: number;
  verified: boolean;
  available: boolean;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbServiceBooking {
  id: string;
  society_id: string;
  provider_id: string;
  resident_id: string;
  service_title: string;
  description: string | null;
  flat_number: string;
  block: string | null;
  scheduled_at: string;
  status: ServiceBookingStatus;
  amount: number;
  created_at: string;
  updated_at: string;
}

export interface DbEmergencyContact {
  id: string;
  society_id: string;
  name: string;
  category: string;
  phone: string;
  available_hours: string;
  description: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}
