/**
 * AavaasIQ Guided Product Assistant Knowledge Base & Query Resolver
 *
 * Implements deterministic, role-aware navigation and FAQ guidance
 * based strictly on real, implemented AavaasIQ features.
 *
 * ZERO fake data, ZERO fake AI responses, ZERO hallucinations.
 * Structured so an LLM/AI provider can be connected in the future.
 */

export type AssistantRole = 'resident' | 'admin' | 'security' | 'provider';

export interface QuickAction {
  label: string;
  href: string;
  description: string;
}

export interface SuggestedQuestion {
  question: string;
  category: string;
}

export interface AssistantAction {
  label: string;
  href: string;
}

export interface AssistantResponse {
  text: string;
  action?: AssistantAction;
  suggestedActions?: QuickAction[];
}

// ─── 1. Role-specific Quick Actions ──────────────────────────────────────────

export const ROLE_QUICK_ACTIONS: Record<AssistantRole, QuickAction[]> = {
  resident: [
    { label: 'Raise a Complaint', href: '/resident/complaints', description: 'Report an issue to society management' },
    { label: 'Visitors', href: '/resident/visitors', description: 'Pre-register expected guests or view pass codes' },
    { label: 'Deliveries', href: '/resident/deliveries', description: 'Track courier parcels logged at the gate' },
    { label: 'Maintenance', href: '/resident/maintenance', description: 'View current dues and payment history' },
    { label: 'Book a Service', href: '/resident/services', description: 'Browse verified plumbers, electricians, cleaners' },
    { label: 'Events', href: '/resident/events', description: 'Community announcements & RSVP to events' },
    { label: 'Emergency Contacts', href: '/resident/emergency', description: 'Police, fire, ambulance & society contacts' },
    { label: 'My Profile & Pass', href: '/resident/profile', description: 'View your digital resident pass and flat details' },
  ],
  admin: [
    { label: 'Residents Directory', href: '/admin/residents', description: 'Browse registered residents and flat allocations' },
    { label: 'Complaints', href: '/admin/complaints', description: 'Review, prioritize, and resolve resident complaints' },
    { label: 'Maintenance Collection', href: '/admin/maintenance', description: 'Track society collection rates and pending dues' },
    { label: 'Gate Visitors', href: '/admin/visitors', description: 'Audit all gate entries and check-in logs' },
    { label: 'Service Partners', href: '/admin/services', description: 'Manage home service professionals & availability' },
    { label: 'Notice Board & Events', href: '/admin/notices', description: 'Publish circulars, announcements, and society events' },
    { label: 'Analytics Report', href: '/admin/analytics', description: 'Complaint resolution rates & traffic metrics' },
    { label: 'Society Settings', href: '/admin/settings', description: 'Manage society profile, rates, and description' },
  ],
  security: [
    { label: 'Visitor Verification', href: '/security/visitors', description: 'Verify visitor pass codes and approve entries' },
    { label: 'Log Delivery', href: '/security/deliveries', description: 'Record incoming parcels for resident flats' },
    { label: 'Emergency Contacts', href: '/security/emergency', description: 'Instant police, fire, ambulance & admin numbers' },
    { label: 'Gate Preferences', href: '/security/settings', description: 'Update guard profile and preferences' },
  ],
  provider: [
    { label: 'Job Requests', href: '/provider/requests', description: 'Accept or decline new resident service bookings' },
    { label: 'Booking Schedule', href: '/provider/bookings', description: 'View confirmed and in-progress jobs for today' },
    { label: 'Monthly Earnings', href: '/provider/earnings', description: 'Track completed jobs and payment history' },
    { label: 'Profile & Location', href: '/provider/settings', description: 'Update trade category, rates, address, and coordinates' },
  ],
};

// ─── 2. Suggested Questions per Role ─────────────────────────────────────────

export const ROLE_SUGGESTED_QUESTIONS: Record<AssistantRole, SuggestedQuestion[]> = {
  resident: [
    { question: 'How do I raise a complaint?', category: 'Complaints' },
    { question: 'Where can I approve visitors?', category: 'Visitors' },
    { question: 'How do I track deliveries?', category: 'Deliveries' },
    { question: 'Where can I pay maintenance?', category: 'Maintenance' },
    { question: 'How do I book a home service?', category: 'Services' },
    { question: 'Where can I see society events?', category: 'Events' },
    { question: 'Who do I contact in an emergency?', category: 'Emergency' },
  ],
  admin: [
    { question: 'How do I add or manage residents?', category: 'Residents' },
    { question: 'Where do I review complaints?', category: 'Complaints' },
    { question: 'How do I publish a notice?', category: 'Notices' },
    { question: 'Where do I track maintenance collections?', category: 'Maintenance' },
    { question: 'How do I view society analytics?', category: 'Analytics' },
  ],
  security: [
    { question: 'How do I check in a visitor?', category: 'Visitors' },
    { question: 'How do I log a delivery?', category: 'Deliveries' },
    { question: 'What do I do in an emergency?', category: 'Emergency' },
  ],
  provider: [
    { question: 'Where do I view new service requests?', category: 'Requests' },
    { question: 'How do I track my completed bookings?', category: 'Bookings' },
    { question: 'Where can I check my earnings?', category: 'Earnings' },
  ],
};

// ─── 3. Deterministic Query Resolver ─────────────────────────────────────────

export function resolveAssistantQuery(query: string, role: AssistantRole): AssistantResponse {
  const q = query.toLowerCase().trim();

  // ── RESIDENT INTENTS ──
  if (role === 'resident') {
    if (/complaint|issue|problem|broken|leak|repair|grievance|dispute/.test(q)) {
      return {
        text: 'You can raise a complaint from the Complaints section of your Resident Dashboard. Select the category (plumbing, electrical, sanitation, etc.), add a description, and track resolution status in real time.',
        action: { label: 'Open Complaints', href: '/resident/complaints' },
      };
    }

    if (/plumb|electric|clean|ac\b|paint|beaut|appliance|carpenter|service|technician|hire|worker|vendor/.test(q)) {
      return {
        text: 'You can find available service providers in Home Services. Browse verified professionals, compare rates, check their service area or location, and book directly.',
        action: { label: 'Open Home Services', href: '/resident/services' },
      };
    }

    if (/emergency|ambulance|fire|police|sos|danger|urgent|hospital|security contact|gate phone/.test(q)) {
      return {
        text: 'You can access emergency contacts from the Emergency section. It provides instant hotlines for Police (100/112), Fire (101), Ambulance (108), society gate security, and management committee.',
        action: { label: 'Open Emergency', href: '/resident/emergency' },
      };
    }

    if (/visitor|guest|pass|entry|gate entry|pre.?approve|expected|car|cab|taxi/.test(q)) {
      return {
        text: 'You can pre-approve expected guests and view visitor history in the Visitors section. Each pre-approved guest receives a secure 6-digit pass code for gate entry.',
        action: { label: 'Open Visitors', href: '/resident/visitors' },
      };
    }

    if (/deliver|parcel|package|courier|amazon|flipkart|swiggy|zomato|order/.test(q)) {
      return {
        text: 'You can track incoming parcel deliveries in the Deliveries section. Security logs each courier upon arrival at the gate and marks it collected when received.',
        action: { label: 'Open Deliveries', href: '/resident/deliveries' },
      };
    }

    if (/mainten|due|bill|fee|payment|pay|charge|receipt|cost/.test(q)) {
      return {
        text: 'You can view your current maintenance dues, billing cycle, due dates, and payment history in the Maintenance section.',
        action: { label: 'Open Maintenance', href: '/resident/maintenance' },
      };
    }

    if (/event|rsvp|festiv|celebrat|gathering|meeting|agm|party/.test(q)) {
      return {
        text: 'You can explore upcoming community events, festival celebrations, and society meetings in the Events section, where you can RSVP directly.',
        action: { label: 'Open Events', href: '/resident/events' },
      };
    }

    if (/notice|announcement|circular|broadcast|rule|guideline/.test(q)) {
      return {
        text: 'Official management announcements, maintenance notices, and policy circulars are posted on the Society Notices board.',
        action: { label: 'Open Notices', href: '/resident/notices' },
      };
    }

    if (/profile|pass\b|id card|identity|flat|member|qr/.test(q)) {
      return {
        text: 'Your digital resident pass, flat assignment, and verified society membership details are accessible in your Profile section.',
        action: { label: 'Open Profile', href: '/resident/profile' },
      };
    }

    if (/setting|password|name|phone|theme|dark mode/.test(q)) {
      return {
        text: 'You can update your personal contact details and interface theme preferences in Account Settings.',
        action: { label: 'Open Settings', href: '/resident/settings' },
      };
    }

    if (/help|support|contact admin|faq/.test(q)) {
      return {
        text: 'The Resident Help Center provides comprehensive FAQs, guidance on society operations, and support contact details.',
        action: { label: 'Open Help', href: '/resident/help' },
      };
    }
  }

  // ── ADMIN INTENTS ──
  if (role === 'admin') {
    if (/complaint|grievance|ticket|unresolved|pending complaint/.test(q)) {
      return {
        text: 'You can review, prioritize, and assign resident complaints from the Complaints management console.',
        action: { label: 'Open Complaints', href: '/admin/complaints' },
      };
    }

    if (/resident|member|tenant|flat|directory|owner|directory/.test(q)) {
      return {
        text: 'The Residents Directory lists all registered residents, assigned flats, blocks, and active society memberships.',
        action: { label: 'Open Residents Directory', href: '/admin/residents' },
      };
    }

    if (/notice|announcement|circular|broadcast|event|publish|post/.test(q)) {
      return {
        text: 'You can create and publish official notices, circulars, and community events directly from the Notice Board.',
        action: { label: 'Open Notice Board', href: '/admin/notices' },
      };
    }

    if (/analytic|report|stat|metric|collection rate|trend|traffic/.test(q)) {
      return {
        text: 'Society Analytics provides real-time oversight of maintenance collection, complaint resolution percentages, and gate entry statistics.',
        action: { label: 'Open Analytics', href: '/admin/analytics' },
      };
    }

    if (/mainten|collection|due|bill|defaulter|financial/.test(q)) {
      return {
        text: 'The Maintenance Collection console allows you to track monthly dues, collection rates, and payment statuses for all society flats.',
        action: { label: 'Open Maintenance', href: '/admin/maintenance' },
      };
    }

    if (/visitor|gate|entry|security log|audit/.test(q)) {
      return {
        text: 'The Visitor Records page displays all gate entries logged by security, including visitor names, flats visited, and check-in/out times.',
        action: { label: 'Open Visitor Records', href: '/admin/visitors' },
      };
    }

    if (/service|provider|vendor|partner|plumber|electrician/.test(q)) {
      return {
        text: 'You can manage verified service partners, view their service locations, and toggle their marketplace availability in Service Management.',
        action: { label: 'Open Service Management', href: '/admin/services' },
      };
    }

    if (/setting|society info|rate|rule|config|description/.test(q)) {
      return {
        text: 'You can configure society settings, maintenance rates, and the society description in Settings.',
        action: { label: 'Open Society Settings', href: '/admin/settings' },
      };
    }

    if (/help|support|faq/.test(q)) {
      return {
        text: 'The Admin Help center offers administrative workflow guides, society management SOPs, and system documentation.',
        action: { label: 'Open Admin Help', href: '/admin/help' },
      };
    }
  }

  // ── SECURITY INTENTS ──
  if (role === 'security') {
    if (/visitor|guest|verify|check.?in|entry|code|pass|walk.?in/.test(q)) {
      return {
        text: 'Open Visitor Management to verify resident-provided pass codes, log walk-in visitors, and record entry and exit times.',
        action: { label: 'Open Visitor Check-In', href: '/security/visitors' },
      };
    }

    if (/deliver|parcel|package|courier|box/.test(q)) {
      return {
        text: 'The Deliveries console lets you log arriving courier parcels by resident flat and courier company to notify residents.',
        action: { label: 'Open Deliveries', href: '/security/deliveries' },
      };
    }

    if (/emergency|police|fire|ambulance|sos|urgent|escalat/.test(q)) {
      return {
        text: 'Emergency Contacts contains immediate emergency lines for police, fire station, ambulance, and society management supervisors.',
        action: { label: 'Open Emergency Contacts', href: '/security/emergency' },
      };
    }

    if (/setting|profile|guard|gate/.test(q)) {
      return {
        text: 'Update your security staff credentials and gate preferences in Settings.',
        action: { label: 'Open Settings', href: '/security/settings' },
      };
    }

    if (/help|sop|protocol|rule/.test(q)) {
      return {
        text: 'The Security Help page contains gate check-in standard operating procedures and incident escalation protocols.',
        action: { label: 'Open Security Help', href: '/security/help' },
      };
    }
  }

  // ── PROVIDER INTENTS ──
  if (role === 'provider') {
    if (/request|new|lead|incoming|accept|decline/.test(q)) {
      return {
        text: 'You can review and accept or decline incoming resident service bookings in the Requests section.',
        action: { label: 'Open Requests', href: '/provider/requests' },
      };
    }

    if (/schedule|booking|job|today|calendar|confirmed|in.?progress|complete/.test(q)) {
      return {
        text: 'View your daily schedule, customer flat locations, and update booking status in the Bookings section.',
        action: { label: 'Open Bookings', href: '/provider/bookings' },
      };
    }

    if (/earning|payout|income|money|revenue|history|transaction/.test(q)) {
      return {
        text: 'The Earnings section tracks completed jobs, monthly income summaries, and past job transactions.',
        action: { label: 'Open Earnings', href: '/provider/earnings' },
      };
    }

    if (/setting|location|address|coordinate|category|rate|price|fee|available/.test(q)) {
      return {
        text: 'Update your service trade category, visiting charge, service area address, and device coordinates in Settings.',
        action: { label: 'Open Settings', href: '/provider/settings' },
      };
    }

    if (/help|support|faq|settlement/.test(q)) {
      return {
        text: 'The Partner Help section offers FAQs on booking fulfillment, payment timelines, and operational support.',
        action: { label: 'Open Partner Help', href: '/provider/help' },
      };
    }
  }

  // ── STRICT UNKNOWN QUESTION FALLBACK (AS SPECIFIED BY USER) ──
  return {
    text: "I'm currently focused on helping with AavaasIQ's available society features. Try asking about complaints, visitors, deliveries, maintenance, services, events or emergencies.",
    suggestedActions: ROLE_QUICK_ACTIONS[role],
  };
}
