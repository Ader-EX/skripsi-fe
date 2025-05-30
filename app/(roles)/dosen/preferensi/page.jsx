"use client";
import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { Label } from "@/components/ui/label";
import Cookies from "js-cookie";
import { decodeToken } from "@/utils/decoder";
import toast from "react-hot-toast";
import PreferenceDialog from "./PreferenceDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const DosenPreferensi = () => {
  const [timeSlots, setTimeSlots] = useState([]);
  const [preferences, setPreferences] = useState([]);
  const [selectedDay, setSelectedDay] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPreference, setSelectedPreference] = useState(null);
  const [isSpecialNeeds, setIsSpecialNeeds] = useState(false);
  const [userId, setUserId] = useState(null);
  const [academicPeriod, setAcademicPeriod] = useState(null);
  const [isWithinResponsePeriod, setIsWithinResponsePeriod] = useState(false);

  const token = Cookies.get("access_token");

  useEffect(() => {
    const token = Cookies.get("access_token");
    if (token) {
      const payload = decodeToken(token);
      if (payload) {
        setUserId(payload.role_id);
      }
    }
    getActiveAcademicPeriod();
  }, []);

  const getActiveAcademicPeriod = async () => {
    try {
      const data = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/academic-period/active`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!data.ok) {
        throw new Error("Failed to fetch active academic period");
      }
      const response = await data.json();
      setAcademicPeriod(response);

      // Check if current date is within the response period
      const currentDate = new Date();
      const startDate = new Date(response.week_start);
      const endDate = new Date(response.week_end);

      setIsWithinResponsePeriod(
        currentDate >= startDate && currentDate <= endDate
      );
    } catch (error) {
      console.error("Error fetching academic period:", error);
      setError("Failed to fetch academic period");
    }
  };

  useEffect(() => {
    if (userId) {
      Promise.all([fetchTimeSlots(), fetchPreferences()]);
    }
  }, [selectedDay, userId]);

  const fetchTimeSlots = async () => {
    try {
      const url =
        selectedDay === "all"
          ? `${process.env.NEXT_PUBLIC_API_URL}/timeslot/`
          : `${process.env.NEXT_PUBLIC_API_URL}/timeslot/?day=${selectedDay}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setTimeSlots(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching time slots:", error);
      setError("Failed to load time slots");
    }
  };

  const confirmSpecialNeedsChange = async () => {
    await updateSpecialNeeds(true);
    setIsDialogOpen(false);
  };

  const updateSpecialNeeds = async (checked) => {
    if (!isWithinResponsePeriod) {
      toast.error("Periode pengisian preferensi telah berakhir");
      return;
    }

    setIsSpecialNeeds(checked);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/preference/set-special-needs/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok)
        throw new Error("Failed to update special needs status");

      toast.success("Preferensi khusus berhasil diperbarui");
      await fetchPreferences();
    } catch (error) {
      console.error("Error updating special needs status:", error);
      toast.error("Gagal memperbarui preferensi khusus");
    }
  };

  const fetchPreferences = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/preference/dosen/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();

      setPreferences(Array.isArray(data) ? data : []);

      const hasSpecialNeeds = data.some(
        (pref) => pref.is_special_needs === true
      );
      setIsSpecialNeeds(hasSpecialNeeds);
    } catch (error) {
      console.error("Error fetching preferences:", error);
      setError("Failed to load preferences");
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceClick = (timeSlotId, isChecked) => {
    if (!isWithinResponsePeriod) {
      toast.error("Periode pengisian preferensi telah berakhir");
      return;
    }

    const existingPref = preferences.find((p) => p.timeslot_id === timeSlotId);

    if (isChecked) {
      setSelectedPreference(existingPref || { timeslot_id: timeSlotId });
      setIsModalOpen(true);
    } else if (existingPref) {
      handlePreferenceChange(timeSlotId, { delete: true });
    }
  };

  const handlePreferenceChange = async (timeSlotId, prefData = {}) => {
    if (!isWithinResponsePeriod) {
      toast.error("Periode pengisian preferensi telah berakhir");
      return;
    }

    try {
      const existingPref = preferences.find(
        (p) => p.timeslot_id === timeSlotId
      );

      if (prefData.delete) {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/preference/${existingPref.id}`,
          { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || "Failed to delete preference");
        }

        setPreferences(preferences.filter((p) => p.id !== existingPref.id));
        toast.success("Preferensi berhasil dihapus");
      } else if (existingPref) {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/preference/${existingPref.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              ...existingPref,
              ...prefData,
              dosen_id: userId,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || "Failed to update preference");
        }

        const updatedPref = await response.json();
        setPreferences(
          preferences.map((p) => (p.id === updatedPref.id ? updatedPref : p))
        );
        toast.success("Preferensi berhasil diperbarui");
      } else {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/preference/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              dosen_id: userId,
              timeslot_id: timeSlotId,
              is_special_needs: false,
              is_high_priority: false,
              ...prefData,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || "Failed to create preference");
        }

        const newPref = await response.json();
        toast.success("Preferensi Berhasil Ditambahkan");
        setPreferences([...preferences, newPref]);
      }
    } catch (error) {
      toast.error(
        error.message || "Terjadi kesalahan saat memperbarui preferensi"
      );
      setError(error.message);
    }
  };

  const handleSpecialNeedsChange = async (checked) => {
    if (!isWithinResponsePeriod) {
      toast.error("Periode pengisian preferensi telah berakhir");
      return;
    }

    if (checked) {
      setIsDialogOpen(true);
    } else {
      await updateSpecialNeeds(false);
    }
  };

  const formatTime = (timeString) => {
    return timeString.slice(0, 5);
  };

  const isTimeSlotEnabled = (id, day) => {
    // Only check the regular pattern, ignore the response period status for display
    if (day === "Jumat") {
      return (id - 161) % 2 === 0;
    }

    return (id - 113) % 3 === 0;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Preferensi Jadwal Mengajar</h1>

      {!isWithinResponsePeriod && academicPeriod && (
        <Alert className="mb-4 bg-yellow-50 border-yellow-200">
          <AlertDescription className="text-yellow-800">
            Periode pengisian preferensi jadwal telah berakhir atau belum
            dimulai. Pengisian preferensi hanya tersedia pada tanggal{" "}
            {formatDate(academicPeriod.week_start)} hingga{" "}
            {formatDate(academicPeriod.week_end)}.
          </AlertDescription>
        </Alert>
      )}

      <p className="text-gray-600 mb-6">
        Silakan atur preferensi jadwal mengajar Anda untuk semester ini. Anda
        dapat memilih waktu yang tersedia dan memberikan alasan jika diperlukan.
        <br />
        <span className="text-blue-600 font-medium">
          Catatan: Hanya slot waktu tertentu yang dapat dipilih (setiap 3 slot).
        </span>
      </p>

      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="special-needs"
                checked={isSpecialNeeds}
                onCheckedChange={handleSpecialNeedsChange}
                disabled={!isWithinResponsePeriod}
              />
              <Label
                htmlFor="special-needs"
                className={!isWithinResponsePeriod ? "text-gray-500" : ""}
              >
                Apakah Anda memiliki kondisi khusus yang memerlukan penempatan
                ruangan dekat dengan ruang dosen?
              </Label>
            </div>
          </div>
          <CardTitle className="flex items-center justify-between">
            <span>Pilih Hari dan Waktu</span>
            <Select
              value={selectedDay}
              onValueChange={setSelectedDay}
              disabled={!isWithinResponsePeriod}
            >
              <SelectTrigger
                className={`w-[180px] ${
                  !isWithinResponsePeriod ? "bg-gray-100" : "bg-white"
                }`}
              >
                <SelectValue placeholder="Pilih hari" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Hari</SelectItem>
                {Array.from(new Set(timeSlots.map((slot) => slot.day))).map(
                  (day) => (
                    <SelectItem key={day} value={day}>
                      {day}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Waktu</TableHead>
                  {Array.from(new Set(timeSlots.map((slot) => slot.day))).map(
                    (day) => (
                      <TableHead key={day} className="text-center">
                        {day}
                      </TableHead>
                    )
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={timeSlots.length + 1}
                      className="text-center h-32"
                    >
                      <div className="flex items-center justify-center">
                        Loading...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  Object.values(
                    timeSlots.reduce((acc, slot) => {
                      if (!acc[slot.start_time]) acc[slot.start_time] = {};
                      acc[slot.start_time][slot.day] = slot;
                      return acc;
                    }, {})
                  ).map((timeSlotGroup, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {formatTime(Object.values(timeSlotGroup)[0].start_time)}{" "}
                        - {formatTime(Object.values(timeSlotGroup)[0].end_time)}
                      </TableCell>

                      {Array.from(
                        new Set(timeSlots.map((slot) => slot.day))
                      ).map((day) => {
                        const timeSlot = timeSlotGroup[day];

                        if (!timeSlot) {
                          return <TableCell key={`${day}-${index}`} />;
                        }

                        const preference = preferences.find(
                          (p) => p.timeslot_id === timeSlot.id
                        );

                        const isEnabled = isTimeSlotEnabled(
                          timeSlot.id,
                          timeSlot.day
                        );

                        return (
                          <TableCell
                            key={`${day}-${timeSlot.id}`}
                            className="text-center"
                          >
                            <div className="flex items-center justify-center">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <input
                                    type="checkbox"
                                    checked={!!preference}
                                    onChange={(e) =>
                                      isEnabled &&
                                      isWithinResponsePeriod &&
                                      handlePreferenceClick(
                                        timeSlot.id,
                                        e.target.checked
                                      )
                                    }
                                    disabled={
                                      !isEnabled || !isWithinResponsePeriod
                                    }
                                    className={`cursor-pointer h-5 w-5 border-2 rounded-md appearance-none transition-all duration-200 
        focus:ring-0 focus:outline-none
        ${
          !isEnabled
            ? "bg-gray-200 border-gray-300 cursor-not-allowed opacity-50"
            : !isWithinResponsePeriod && preference
            ? preference.is_high_priority
              ? "bg-red-500 border-red-600 opacity-90 cursor-not-allowed"
              : "bg-blue-500 border-blue-600 opacity-90 cursor-not-allowed"
            : preference
            ? preference.is_high_priority
              ? "bg-red-500 border-red-600 hover:bg-red-600"
              : "bg-blue-500 border-blue-600 hover:bg-blue-600"
            : "bg-white border-gray-400 hover:border-gray-600"
        }`}
                                  />
                                </TooltipTrigger>

                                {preference && (
                                  <TooltipContent>
                                    {preference.reason
                                      ? preference.reason
                                      : "Preferensi Anda"}
                                  </TooltipContent>
                                )}
                                {!isEnabled && (
                                  <TooltipContent>
                                    Slot waktu ini tidak tersedia untuk dipilih
                                  </TooltipContent>
                                )}
                                {isEnabled && !isWithinResponsePeriod && (
                                  <TooltipContent>
                                    Periode pengisian preferensi telah berakhir
                                  </TooltipContent>
                                )}
                              </Tooltip>
                            </div>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        <PreferenceDialog
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          selectedPreference={selectedPreference}
          onPreferenceChange={(newPref) => setSelectedPreference(newPref)}
          onSave={() => {
            handlePreferenceChange(selectedPreference.timeslot_id, {
              is_high_priority: selectedPreference.is_high_priority,
              reason: selectedPreference.reason,
            });
            setIsModalOpen(false);
          }}
        />

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Konfirmasi Perubahan</DialogTitle>
            </DialogHeader>
            <p>
              Jika Anda mencentang, maka seluruh preferensi Anda dianggap
              khusus.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={confirmSpecialNeedsChange}>Setujui</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  );
};

export default DosenPreferensi;
