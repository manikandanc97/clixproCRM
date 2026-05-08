"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  Clock,
  Video,
  MoreHorizontal,
  Users,
  MapPin,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const meetings = [
  {
    id: 1,
    title: "Quarterly Review with Acme Corp",
    time: "10:00 AM - 11:30 AM",
    location: "Zoom",
    isOnline: true,
    status: "upcoming",
    attendees: [
      { name: "Sarah", avatar: "SJ" },
      { name: "John", avatar: "JD" },
      { name: "Emily", avatar: "EW" },
      { name: "Mike", avatar: "MC" },
    ],
    color: "emerald",
    isToday: true,
  },
  {
    id: 2,
    title: "Product Demo: TechFlow Inc",
    time: "1:00 PM - 2:00 PM",
    location: "Google Meet",
    isOnline: true,
    status: "pending",
    attendees: [
      { name: "Alex", avatar: "AR" },
      { name: "Jordan", avatar: "JL" },
    ],
    color: "blue",
    isToday: true,
  },
  {
    id: 3,
    title: "Project Sync: Design Team",
    time: "3:30 PM - 4:00 PM",
    location: "Meeting Room A",
    isOnline: false,
    status: "confirmed",
    attendees: [
      { name: "Taylor", avatar: "TS" },
      { name: "Chris", avatar: "CP" },
      { name: "Sam", avatar: "SD" },
    ],
    color: "indigo",
    isToday: false,
  },
];

export default function UpcomingMeetings() {
  const hasMeetings = meetings.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="w-full"
    >
      <Card className="border-none shadow-premium bg-gradient-to-br from-card to-background/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-info/10 text-info rounded-2xl shadow-sm border border-info/20">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <CardTitle>Upcoming Meetings</CardTitle>
              <p className="text-muted-foreground text-sm font-medium">
                You have {meetings.filter((m) => m.isToday).length} meetings
                scheduled for today
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="hidden sm:flex rounded-xl border-border bg-background/50 backdrop-blur-md h-10 font-bold text-xs uppercase tracking-wider"
            >
              View Calendar
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl hover:bg-muted h-10 w-10"
            >
              <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 lg:p-8 pt-2">
          {!hasMeetings ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4 border border-dashed border-border">
                <Calendar className="w-8 h-8 text-muted-foreground/30" />
              </div>
              <h4 className="font-bold text-foreground text-lg">
                No upcoming meetings
              </h4>
              <p className="text-muted-foreground text-sm max-w-[240px] mt-1">
                Your schedule is clear. Use this time to focus on your leads!
              </p>
              <Button className="mt-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 shadow-lg shadow-primary/20">
                Schedule Meeting
              </Button>
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {meetings.map((meeting, index) => (
                <motion.div
                  key={meeting.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                  className={`group relative flex flex-col sm:flex-row items-center sm:items-stretch gap-4 sm:gap-6 p-4 sm:p-5 rounded-[1.5rem] sm:rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden
                    ${
                      meeting.isToday
                        ? "bg-card border-info/20 shadow-md hover:shadow-lg"
                        : "bg-muted/30 border-transparent hover:border-border"
                    }`}
                >
                  {/* Today Highlight Ribbon */}
                  {meeting.isToday && (
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-info" />
                  )}

                  {/* Time Block */}
                  <div className="flex flex-row sm:flex-col items-center justify-center min-w-full sm:min-w-[100px] py-2 px-4 bg-muted rounded-xl sm:rounded-2xl border border-border shadow-inner group-hover:bg-info/10 transition-colors">
                    <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none mr-2 sm:mr-0 sm:mb-1">
                      Starts
                    </span>
                    <span className="font-black text-foreground text-base sm:text-lg tracking-tighter whitespace-nowrap">
                      {meeting.time.split(" - ")[0]}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-2 mb-1.5">
                      <h4 className="font-bold text-foreground text-base sm:text-lg tracking-tight group-hover:text-info transition-colors leading-tight">
                        {meeting.title}
                      </h4>
                      {meeting.isToday && (
                        <Badge className="bg-info/10 text-info hover:bg-info/20 border-none px-2 py-0 h-5 text-[9px] font-black uppercase tracking-tighter">
                          Today
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2 text-[11px] sm:text-xs font-semibold text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        {meeting.time.split(" - ")[1]} duration
                      </span>
                      <span className="flex items-center gap-1.5">
                        {meeting.isOnline ? (
                          <Video className="w-4 h-4 text-info" />
                        ) : (
                          <MapPin className="w-4 h-4 text-warning" />
                        )}
                        {meeting.location}
                      </span>
                    </div>
                  </div>

                  {/* Attendees & Actions */}
                  <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-none pt-4 sm:pt-0 border-border">
                    <div className="flex -space-x-3 sm:-space-x-4">
                      <TooltipProvider>
                        {meeting.attendees.map((person, i) => (
                          <Tooltip key={i}>
                            <TooltipTrigger asChild>
                              <div className="w-10 h-10 rounded-full border-4 border-background bg-muted flex items-center justify-center text-[11px] font-bold text-muted-foreground shadow-sm transition-transform hover:scale-110 hover:z-20 relative ring-1 ring-border">
                                {person.avatar}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="bg-foreground text-background border-none rounded-lg font-bold">
                              {person.name}
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </TooltipProvider>
                    </div>

                    <div className="flex items-center gap-2">
                      {meeting.isOnline && meeting.isToday && (
                        <Button className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-11 px-6 shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center gap-2 border-none">
                          Join <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                      {!meeting.isToday && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-xl hover:bg-muted w-11 h-11"
                        >
                          <ArrowRight className="w-5 h-5 text-muted-foreground" />
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
