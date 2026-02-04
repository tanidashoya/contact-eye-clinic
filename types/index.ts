export interface EventSettings {
  user_id: string;
  event_type: string;
  cycle_days: number;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  user_id: string;
  notify_enabled: boolean;
  clinic_notify_before_days: number;
  contact_notify_before_days: number;
  timezone: string;
}

export interface SettingSheetClientProps {
  userId?: string;
  userSettings?: UserSettings;
  contactSettings?: EventSettings;
  clinicSettings?: EventSettings;
}

export interface UserSettingsProps {
  isnotification: boolean;
  setIsnotification: (isnotification: boolean) => void;
  clinicNotifyBeforeDays: number;
  setClinicNotifyBeforeDays: (clinicNotifyBeforeDays: number) => void;
  contactNotifyBeforeDays: number;
  setContactNotifyBeforeDays: (contactNotifyBeforeDays: number) => void;
}
