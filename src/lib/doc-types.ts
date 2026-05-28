export type DocCategory = "HR" | "Business" | "Legal" | "Education" | "Corporate";

export interface DocType {
  id: string;
  name: string;
  category: DocCategory;
  description: string;
  samplePrompt: string;
}

export const DOC_TYPES: DocType[] = [
  { id: "offer_letter", name: "Offer Letter", category: "HR", description: "Formal employment offer", samplePrompt: "Generate an offer letter for a Senior Engineer at Acme Inc, salary $140,000, start date June 1." },
  { id: "internship_letter", name: "Internship Letter", category: "HR", description: "Internship offer", samplePrompt: "Generate a 6-month internship offer letter for a Product Design intern." },
  { id: "appointment_letter", name: "Appointment Letter", category: "HR", description: "Formal appointment", samplePrompt: "Generate an appointment letter for a Marketing Manager." },
  { id: "experience_letter", name: "Experience Letter", category: "HR", description: "Service confirmation", samplePrompt: "Generate an experience letter for a 3-year tenure as Backend Engineer." },
  { id: "warning_letter", name: "Warning Letter", category: "HR", description: "Formal warning", samplePrompt: "Generate a formal warning letter regarding repeated tardiness." },
  { id: "quotation", name: "Quotation", category: "Business", description: "Price quote", samplePrompt: "Generate a quotation for ERP software implementation, 3 modules, 6-month rollout." },
  { id: "invoice", name: "Invoice", category: "Business", description: "Billing invoice", samplePrompt: "Generate a modern invoice for design services rendered in Q4, total $12,400." },
  { id: "proposal", name: "Business Proposal", category: "Business", description: "Sales proposal", samplePrompt: "Generate an enterprise business proposal for a SaaS analytics platform." },
  { id: "purchase_order", name: "Purchase Order", category: "Business", description: "PO document", samplePrompt: "Generate a purchase order for 50 ergonomic chairs at $320 each." },
  { id: "nda", name: "NDA", category: "Legal", description: "Non-disclosure agreement", samplePrompt: "Generate a mutual NDA between two SaaS companies exploring a partnership." },
  { id: "service_agreement", name: "Service Agreement", category: "Legal", description: "Service contract", samplePrompt: "Generate a service agreement for monthly SEO consulting, $4,000/mo." },
  { id: "legal_notice", name: "Legal Notice", category: "Legal", description: "Formal notice", samplePrompt: "Generate a legal notice for unpaid invoices totaling $25,000." },
  { id: "certificate", name: "Certificate", category: "Education", description: "Certificate of completion", samplePrompt: "Generate a certificate of completion for a Data Science bootcamp." },
  { id: "bonafide", name: "Bonafide Certificate", category: "Education", description: "Student verification", samplePrompt: "Generate a bonafide certificate for a Grade 11 student." },
  { id: "letterhead", name: "Company Letterhead", category: "Corporate", description: "Branded letterhead", samplePrompt: "Generate a company letterhead for a fintech startup announcing a Series A." },
  { id: "meeting_notes", name: "Meeting Notes", category: "Corporate", description: "Meeting minutes", samplePrompt: "Generate meeting notes for a Q3 strategy review covering growth, hiring and product." },
  { id: "general", name: "General Document", category: "Corporate", description: "Free-form", samplePrompt: "Draft a one-page memo on remote-work policy updates." },
];

export const DOC_TYPE_MAP: Record<string, DocType> = Object.fromEntries(DOC_TYPES.map(d => [d.id, d]));
