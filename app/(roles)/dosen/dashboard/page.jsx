import React from "react";
import DashboardStats from "./DashboardStats";
import DosenTimetable from "./DosenTimetable";
import DosenTemporaryTimetable from "@/components/global/DosenTemporaryTimetable";

const DosenDashboard = () => {
  return (
    <div className="p-6 flex w-full flex-col gap-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <DashboardStats />
      <DosenTimetable />
      <DosenTemporaryTimetable />
    </div>
  );
};

export default DosenDashboard;
