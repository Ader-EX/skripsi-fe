"use client";

import React, { useEffect, useState } from "react";
import DashboardStats from "./DashboardStats";
import DosenTimetable from "./DosenTimetable";
import DosenTemporaryTimetable from "@/components/global/DosenTemporaryTimetable";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TriangleAlertIcon } from "lucide-react";
import Cookies from "js-cookie";
import { decodeToken } from "@/utils/decoder";
import { useRouter } from "next/navigation";

const DosenDashboard = () => {
  const [hasPreference, setHasPreference] = useState(true);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkPreference = async () => {
      try {
        // Get token from cookies
        const token = Cookies.get("access_token");

        const payload = decodeToken(token);

        // Fetch preference status
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/preference/dosen/${payload.role_id}/has-preference`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch preference status");
        }

        const data = await response.json();
        setHasPreference(data);
      } catch (error) {
        console.error("Error checking preference:", error);
      } finally {
        setLoading(false);
      }
    };

    checkPreference();
  }, []);

  const handleNavigateToPreference = () => {
    router.push("/dosen/preferensi");
  };

  return (
    <div className="p-6 flex w-full flex-col gap-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <DashboardStats />
      {!loading && hasPreference != true && (
        <div className="relative  rounded-lg border border-red-200 bg-red-50 px-6 py-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-red-500"
              >
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-800">Peringatan</h3>
              <p className="mt-1 text-sm text-red-700">
                Anda belum mengisi preferensi mengajar. Silakan isi preferensi
                waktu mengajar Anda di halaman Preferensi Dosen.
              </p>
            </div>
          </div>
          <div className="flex-shrink-0 mt-4">
            <button
              onClick={handleNavigateToPreference}
              className="rounded-md bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-colors"
            >
              Isi Preferensi
            </button>
          </div>
        </div>
      )}
      <DosenTimetable />
      <DosenTemporaryTimetable />
    </div>
  );
};

export default DosenDashboard;
