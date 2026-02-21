// AtonixCorp Cloud – TypeScript types for Onboarding Dashboard

// ---- Onboarding ----

export interface OnboardingProgress {
  id: string;
  verify_email: boolean;
  add_ssh_key: boolean;
  create_vm: boolean;
  configure_network: boolean;
  attach_volume: boolean;
  explore_dashboard: boolean;
  completion_pct: number;
  completed_steps: string[];
  updated_at: string;
}

export interface OnboardingStepDef {
  key: keyof Omit<OnboardingProgress, 'id' | 'completion_pct' | 'completed_steps' | 'updated_at'>;
  label: string;
  description: string;
  actionLabel: string;
  actionPath?: string;
}

// ---- Dashboard Stats ----

export interface ComputeStats {
  total_vms: number;
  running: number;
  stopped: number;
}

export interface StorageStats {
  total_volumes: number;
  attached: number;
  detached: number;
}

export interface NetworkingStats {
  vpcs: number;
  security_groups: number;
}

export interface AccountInfo {
  username: string;
  email: string;
  role: string;
  billing_status: string;
  completion_pct: number;
}

export interface DashboardStats {
  compute: ComputeStats;
  storage: StorageStats;
  networking: NetworkingStats;
  account: AccountInfo;
}

// ---- Wizard Options ----

export interface CloudImage {
  image_id: string;
  name: string;
  os_name: string;
  os_type: 'linux' | 'windows' | 'custom';
  os_version: string;
}

export interface CloudFlavor {
  flavor_id: string;
  name: string;
  vcpus: number;
  memory_mb: number;
  disk_gb: number;
  hourly_cost_usd: string;
  is_gpu: boolean;
}

export interface CloudNetwork {
  id: string;
  name: string;
}

export interface WizardOptions {
  images: CloudImage[];
  flavors: CloudFlavor[];
  networks: CloudNetwork[];
}

// ---- Server Create ----

export interface CreateServerPayload {
  name: string;
  image: string;      // image_id
  flavor: string;     // flavor_id
  network?: string;   // VPC id
  key_name?: string;
}
