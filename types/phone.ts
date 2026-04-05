export interface PhoneNotification {
  app: string;
  sender: string;
  preview: string;
  time: string;
}

export interface PhoneScreenConfig {
  time: string;
  date: string;
  carrier: string;
  battery: number;
  wallpaper: string;
  lockState: 'locked' | 'unlocked';
  homeApps: string[];
  dockApps: string[];
  notifications: PhoneNotification[];
}

export interface PhoneAppSectionContent {
  title: string;
  items: string[];
}

export interface PhoneThread {
  name: string;
  time: string;
  unread: boolean;
  preview: string;
  messages?: PhoneThreadMessage[];
}

export interface PhoneThreadMessage {
  id: string;
  sender: 'me' | 'them';
  text: string;
  time?: string;
}

export interface PhonePhoto {
  title: string;
  stamp: string;
}

export interface PhoneMail {
  from: string;
  subject: string;
  snippet: string;
  body?: string[];
  time: string;
  unread: boolean;
}

export interface PhoneVoiceMemo {
  id: string;
  title: string;
  duration: string;
  recordedAt: string;
  src: string;
}

export interface PhoneSafariSearch {
  id: string;
  term: string;
  timestamp: string;
}

export interface PhoneCalendarEvent {
  id: string;
  title: string;
  time: string;
  endTime?: string;
  location?: string;
  color: string;
  isAllDay?: boolean;
}

export interface PhoneCalendarDay {
  date: string;
  dayOfWeek: string;
  events: PhoneCalendarEvent[];
}

export interface PhoneMapSearch {
  id: string;
  name: string;
  address: string;
  timestamp: string;
}

export interface PhoneAppContent {
  note?: string;
  sections?: PhoneAppSectionContent[];
  threads?: PhoneThread[];
  photos?: PhonePhoto[];
  mails?: PhoneMail[];
  voiceMemos?: PhoneVoiceMemo[];
  recentSearches?: PhoneSafariSearch[];
  calendarDays?: PhoneCalendarDay[];
  mapSearches?: PhoneMapSearch[];
}

export interface PhoneApp {
  id: string;
  label: string;
  icon: string;
  theme: string;
  content: PhoneAppContent;
}

export interface MockPhone {
  id: string;
  name: string;
  owner: string;
  device: string;
  screen: PhoneScreenConfig;
  apps: PhoneApp[];
}
