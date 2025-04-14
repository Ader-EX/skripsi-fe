"use client";
import React, { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Pencil } from "lucide-react";

const TimeTableView = ({
  schedules,
  rooms,
  timeSlots,
  filters,
  role = "admin",
  selectedDay,
  onDayChange = () => {},
}) => {
  // Use available days from filters; fallback if not provided.
  const [DAYS, setDAYS] = useState(filters?.available_days || ["Senin"]);
  const [selectedBuilding, setSelectedBuilding] = useState("all");
  const [selectedConflict, setSelectedConflict] = useState(null);

  useEffect(() => {
    if (filters?.available_days && filters.available_days.length > 0) {
      setDAYS(filters.available_days);
      if (!selectedDay) {
        onDayChange(filters.available_days[0]);
      }
    }
  }, [filters, onDayChange, selectedDay]);

  const uniqueTimeSlots = useMemo(() => {
    return timeSlots
      .filter((slot) => slot.day === selectedDay)
      .filter(
        (slot, index, self) =>
          index ===
          self.findIndex(
            (s) =>
              s.start_time === slot.start_time && s.end_time === slot.end_time
          )
      )
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  }, [timeSlots, selectedDay]);

  const roomsByBuilding = useMemo(() => {
    const grouped = rooms.reduce((acc, room) => {
      if (!acc[room.building]) {
        acc[room.building] = [];
      }
      acc[room.building].push(room);
      return acc;
    }, {});
    if (selectedBuilding !== "all") {
      return { [selectedBuilding]: grouped[selectedBuilding] || [] };
    }
    return grouped;
  }, [rooms, selectedBuilding]);

  const buildings = useMemo(() => {
    return [...new Set(rooms.map((room) => room.building))];
  }, [rooms]);

  const scheduleMap = useMemo(() => {
    const map = {};
    schedules.forEach((schedule) => {
      const roomId = schedule.room_id;
      if (!map[roomId]) {
        map[roomId] = {};
      }
      schedule.time_slots?.forEach((ts) => {
        const tsId = Number(ts.id);
        if (!map[roomId][tsId]) {
          map[roomId][tsId] = [];
        }
        map[roomId][tsId].push(schedule);
      });
    });
    return map;
  }, [schedules]);

  const getScheduleForSlot = (timeSlot, roomId) => {
    const tsId = Number(timeSlot.id);
    return scheduleMap[roomId] && scheduleMap[roomId][tsId]
      ? scheduleMap[roomId][tsId].filter((schedule) =>
          schedule.time_slots?.some(
            (ts) =>
              Number(ts.id) === tsId &&
              Number(ts.day_index) === Number(timeSlot.day_index)
          )
        )
      : [];
  };

  const renderScheduleCard = (scheduleList, timeSlot, roomId) => {
    if (!scheduleList.length) return null;

    const schedule = scheduleList[0];

    let containerClass = "bg-green-100";

    if (schedule.type === 1) {
      containerClass = "bg-purple-200";
    } else if (schedule.is_conflicted) {
      containerClass = schedule.reason ? "bg-red-100" : "bg-yellow-100";
    }

    return (
      <div
        className={`h-full w-full p-2 flex flex-row gap-2 ${containerClass}`}
        style={{ whiteSpace: "nowrap", overflow: "hidden" }}
      >
        {scheduleList.map(renderSingleSchedule)}
      </div>
    );
  };

  const renderSingleSchedule = (schedule) => {
    const subject = schedule.subject || {};
    const subjectName = subject.name || "-";
    const subjectCode = subject.code || "-";
    const kelas = subject.kelas || "-";

    const room = schedule.room_id || "-";

    // Buat schedule string dari time_slots
    const timeslots = schedule.time_slots || [];
    const day = timeslots.length > 0 ? timeslots[0].day : "-";
    const startTime = timeslots.length > 0 ? timeslots[0].start_time : "-";
    const endTime =
      timeslots.length > 0 ? timeslots[timeslots.length - 1].end_time : "-";
    const scheduleTime = `${day} ${startTime} - ${endTime}`;

    return (
      <TooltipProvider key={schedule.id}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className="flex-1 p-2 rounded cursor-pointer overflow-hidden"
              style={{ minWidth: 0 }}
              onClick={() =>
                schedule.is_conflicted &&
                schedule.reason &&
                setSelectedConflict(schedule)
              }
            >
              <div className="font-semibold truncate">{subjectName}</div>
              <div className="text-xs truncate">
                {subjectCode} - {kelas}
              </div>
              <div className="text-xs truncate">{scheduleTime}</div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {schedule.type === 1 && (
              <p className="text-white font-bold text-md">
                Kelas Pengganti: {schedule.start_date} - {schedule.end_date}
              </p>
            )}
            <p>{subjectName}</p>
            <p>
              {subjectCode} - {kelas}
            </p>
            <p>Room: {room}</p>
            <p>Schedule: {scheduleTime}</p>
            {schedule.is_conflicted && schedule.reason && (
              <p className="text-red-500">{schedule.reason}</p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const renderConflictModal = () => {
    if (!selectedConflict) return null;
    return (
      <Dialog open={true} onOpenChange={() => setSelectedConflict(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conflict Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-red-600 font-semibold">
              {selectedConflict.reason}
            </p>
            <p>
              Severity:{" "}
              <strong>{selectedConflict.severity || "Unknown"}</strong>
            </p>
            <p>Room: {selectedConflict.room_id}</p>
            <p>Timeslot: {selectedConflict.timeslot_id}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedConflict(null)}>
              Close
            </Button>
            <Button
              className="bg-red-500 hover:bg-red-600"
              onClick={() => (window.location.href = "/admin/data-manajemen")}
            >
              Resolve Conflict
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <Card className="flex flex-col h-full w-full p-2">
      {/* Top Controls */}
      <div className="flex p-4 border-b gap-x-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-between">
          <div className="flex gap-x-4">
            {/* Day Selector */}
            <Select value={selectedDay} onValueChange={onDayChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent>
                {DAYS.map((day) => (
                  <SelectItem key={day} value={day}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Building Selector */}
            <Select
              value={selectedBuilding}
              onValueChange={setSelectedBuilding}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select building" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Buildings</SelectItem>
                {buildings.map((building, index) => (
                  <SelectItem key={`${building}-${index}`} value={building}>
                    {building}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {role === "admin" && (
            <Button>
              <Link href="data-manajemen" className="flex items-center gap-2">
                <Pencil /> Edit Timetable
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="flex-1 relative">
        <div className="absolute inset-0 overflow-auto">
          <div className="inline-block min-w-full">
            <div
              className="grid"
              style={{
                gridTemplateColumns: `150px repeat(${
                  Object.values(roomsByBuilding).flat().length
                }, minmax(200px, 1fr))`,
              }}
            >
              <div className="sticky top-0 left-0 z-30 bg-gray-100 p-2 font-bold border-b border-r">
                Time
              </div>
              {Object.entries(roomsByBuilding).flatMap(([, buildingRooms]) =>
                buildingRooms.map((room, index) => (
                  <div
                    key={`${room.id}-${index}`}
                    className="sticky top-0 z-20 p-2 font-bold text-center bg-gray-100 border-b truncate"
                  >
                    {room.id}
                  </div>
                ))
              )}

              {uniqueTimeSlots.map((timeSlot) => (
                <React.Fragment key={timeSlot.id}>
                  <div className="sticky left-0 z-10 bg-white p-2 font-bold border">
                    {timeSlot.start_time} - {timeSlot.end_time}
                  </div>
                  {Object.entries(roomsByBuilding).flatMap(
                    ([, buildingRooms]) =>
                      buildingRooms.map((room, index) => (
                        <div
                          key={`${room.id}-${timeSlot.id}-${index}`}
                          className="relative h-24 border"
                        >
                          {renderScheduleCard(
                            getScheduleForSlot(timeSlot, room.id),
                            timeSlot,
                            room.id
                          )}
                        </div>
                      ))
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 p-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-300 rounded"></div>
          <span className="text-sm">Kelas Pengganti</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-300 rounded"></div>
          <span className="text-sm">Tidak Ada Kendala</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span className="text-sm">Warning</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-300 rounded"></div>
          <span className="text-sm">Kelas Bentrok</span>
        </div>
      </div>
      {renderConflictModal()}
    </Card>
  );
};

export default TimeTableView;
