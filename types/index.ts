import { User } from "@supabase/supabase-js";

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
  user: User;
  userSettings: UserSettings;
  contactSettings: EventSettings;
  clinicSettings: EventSettings;
}

export interface UserSettingsProps {
  isnotification: boolean;
  setIsnotification: (isnotification: boolean) => void;
  clinicNotifyBeforeDays: number;
  setClinicNotifyBeforeDays: (clinicNotifyBeforeDays: number) => void;
  contactNotifyBeforeDays: number;
  setContactNotifyBeforeDays: (contactNotifyBeforeDays: number) => void;
}

export interface UpdateContactSettingsProps {
  contactCycle: number;
}

export interface UpdateClinicSettingsProps {
  clinicCycle: number;
}

export interface ContactClinicSettingsProps {
  contactCycle: number;
  setContactCycle: (contactCycle: number) => void;
  clinicCycle: number;
  setClinicCycle: (eyeCareCycle: number) => void;
}

export interface LogoutDialogProps {
  handleLogout: () => void;
  isLoading: boolean;
}

export interface DateDisplayProps {
  eventId?: number;
  eventType?: string;
  occurredAt?: string | null;
  next?: string | null;
}

export interface UpdateNotifySettingsProps {
  notifyEnabled: boolean;
}

export interface UpdateNotifyBeforeDaysProps {
  contactNotifyBeforeDays: number;
  clinicNotifyBeforeDays: number;
}
