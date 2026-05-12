export interface MeetingAttendee {
  name: string;
  avatar: string;
}

export interface MeetingType {
  id: string;
  title: string;
  time: string;
  date: string;
  location: string;
  isOnline: boolean;
  status: "upcoming" | "scheduled" | "pending" | "confirmed";
  isToday: boolean;
  attendees: MeetingAttendee[];
  color: string;
}

export interface MeetingsDataType {
  meetings: MeetingType[];
}











