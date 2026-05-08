"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Info } from "lucide-react";

const ActivityHeatmap = () => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hours = ["9am", "11am", "1pm", "3pm", "5pm", "7pm"];
  
  // Mock data: 7 days x 12 intervals (9am to 9pm)
  const data = Array.from({ length: 7 * 12 }, () => Math.floor(Math.random() * 10));

  const getColor = (value: number) => {
    if (value === 0) return "bg-slate-50";
    if (value < 3) return "bg-blue-100";
    if (value < 6) return "bg-blue-300";
    if (value < 8) return "bg-blue-500";
    return "bg-blue-700";
  };

  return (
    <Card className="bg-white rounded-xl border-slate-200/60 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
      <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
        <CardTitle className="font-bold text-slate-900 text-xl tracking-tight">Sales Activity</CardTitle>
        <Info className="w-4 h-4 text-slate-300" />
      </CardHeader>
      <CardContent className="p-8 pt-4">
        <div className="flex flex-col gap-2">
          {days.map((day, dayIdx) => (
            <div key={day} className="flex items-center gap-3">
              <span className="text-[10px] font-black text-slate-400 uppercase w-8 tracking-wider">{day}</span>
              <div className="flex-1 flex gap-1.5">
                {Array.from({ length: 12 }).map((_, hourIdx) => {
                  const val = data[dayIdx * 12 + hourIdx];
                  return (
                    <motion.div
                      key={hourIdx}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: (dayIdx * 12 + hourIdx) * 0.005 }}
                      className={`h-6 flex-1 rounded-sm ${getColor(val)} transition-all hover:scale-125 cursor-pointer shadow-sm`}
                      title={`${val} activities at ${day} ${9 + hourIdx}:00`}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Less</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-sm bg-slate-100" />
                <div className="w-3 h-3 rounded-sm bg-blue-100" />
                <div className="w-3 h-3 rounded-sm bg-blue-300" />
                <div className="w-3 h-3 rounded-sm bg-blue-500" />
                <div className="w-3 h-3 rounded-sm bg-blue-700" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">More</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {hours.map(hour => (
              <span key={hour} className="text-[9px] font-bold text-slate-300 uppercase">{hour}</span>
            ))}
          </div>
        </div>

        <div className="mt-8 p-6 bg-blue-50/50 rounded-3xl border border-blue-100/50">
          <p className="text-xs text-blue-700 leading-relaxed font-medium">
            <span className="font-bold">Pro Tip:</span> Your team is most active on <span className="font-bold">Wednesdays between 1pm - 3pm</span>. This is a great time for team syncs!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityHeatmap;
