export type SubscriptionTier = "free" | "pro" | "team";
export type ApplicationStatus =
  | "applied"
  | "screening"
  | "interview"
  | "offer"
  | "rejected"
  | "ghosted";
export type RemoteType = "onsite" | "hybrid" | "remote";
export type ApplicationSource =
  | "linkedin"
  | "indeed"
  | "greenhouse"
  | "lever"
  | "workday"
  | "direct";

export interface Profile {
  id: string;
  fullName: string;
  avatarUrl?: string;
  subscriptionTier: SubscriptionTier;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  createdAt: string;
}

export interface Resume {
  id: string;
  userId: string;
  name: string;
  jsonData: Record<string, unknown>;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  id: string;
  userId: string;
  resumeId?: string;
  companyName: string;
  roleTitle: string;
  jobUrl: string;
  source: ApplicationSource;
  status: ApplicationStatus;
  appliedAt: string;
  notes?: string;
  salaryRange?: string;
  location?: string;
  remoteType?: RemoteType;
  metadata?: Record<string, unknown>;
}

export interface TailoredResume {
  id: string;
  resumeId: string;
  jobDescription: string;
  tailoredJson: Record<string, unknown>;
  aiScore: number;
  createdAt: string;
}
