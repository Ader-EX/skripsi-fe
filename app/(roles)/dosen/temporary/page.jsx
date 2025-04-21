/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RuanganSelectionDialog from "@/components/global/RuanganSelectionDialog";
import TimeslotSelectionTable from "../../admin/data-manajemen/edit/TimeslotSelectionTable";
import toast from "react-hot-toast";
import { Label } from "@/components/ui/label";
import { Pencil } from "lucide-react";
import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const AddTemporarySchedule = () => {
  const router = useRouter();
  const searchParams = window !== "undefined" ? useSearchParams() : null;
  const timetableId = searchParams ? searchParams.get("id") : null;

  const [selectedOpenedClass, setSelectedOpenedClass] = useState(null);
  const [selectedRuangan, setSelectedRuangan] = useState(null);
  const [selectedTimeslots, setSelectedTimeslots] = useState([]);
  const [availableTimeslots, setAvailableTimeslots] = useState([]);
  const [isRuanganDialogOpen, setIsRuanganDialogOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [academicPeriodId, setAcademicPeriodId] = useState(null);

  const [timetableTimeslots, setTimetableTimeslots] = useState([]);
  const [alasan, setAlasan] = useState("");

  const token = Cookies.get("access_token");

  useEffect(() => {
    setIsMounted(true);
    fetchActiveAcademicPeriod();
    if (timetableId) {
      fetchTimetableDetails(timetableId);
    }
  }, [timetableId]);

  const fetchTimetableDetails = async (id) => {
    try {
      const response = await fetch(`${API_URL}/timetable/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch timetable details");

      const data = await response.json();
      setSelectedOpenedClass({
        id: data.opened_class_id,
        nama_mk: data.mata_kuliah_nama,
        kelas: data.kelas,
        sks: data.sks,
      });
      setSelectedRuangan({
        id: data.ruangan_id,
        nama_ruang: data.ruangan_nama,
      });

      if (data.timeslot_ids) {
        setTimetableTimeslots(data.timeslot_ids);
        setSelectedTimeslots(data.timeslot_ids);
      }

      fetchRuanganDetails(data.ruangan_id);
    } catch (error) {
      console.error("Error fetching timetable:", error);
    }
  };

  const fetchRuanganDetails = async (ruanganId) => {
    try {
      const response = await fetch(
        `${API_URL}/ruangan/timeslots/availability?ruangan_id=${ruanganId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch room timeslots");

      const data = await response.json();
      setAvailableTimeslots(data);
    } catch (error) {
      console.error("Error fetching room timeslots:", error);
    }
  };

  const handleOpenedClassSelect = (openedClass) => {
    setSelectedOpenedClass({
      id: openedClass.id,
      nama_mk: openedClass.mata_kuliah.nama,
      kelas: openedClass.kelas,
      sks: openedClass.sks,
    });
  };

  const handleRuanganSelect = (ruangan) => {
    setSelectedRuangan({
      id: ruangan.id,
      nama_ruang: ruangan.nama_ruang,
    });
    fetchRuanganDetails(ruangan.id);
  };

  const fetchActiveAcademicPeriod = async () => {
    try {
      const response = await fetch(`${API_URL}/academic-period/active`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch academic period");

      const data = await response.json();
      setAcademicPeriodId(data.id);
    } catch (error) {
      console.error("Error fetching academic period:", error);
      toast.error("Gagal mendapatkan semester aktif");
    }
  };

  const handleTimeslotToggle = (timeslotId) => {
    setSelectedTimeslots((prevSelected) =>
      prevSelected.includes(timeslotId)
        ? prevSelected.filter((id) => id !== timeslotId)
        : [...prevSelected, timeslotId]
    );
  };
  const handleSubmit = async () => {
    if (
      !selectedOpenedClass ||
      !selectedRuangan ||
      selectedTimeslots.length === 0
    ) {
      toast.error(
        "Pilih kelas yang tersedia, ruangan, dan minimal satu waktu."
      );
      return;
    }

    try {
      const response = await fetch(`${API_URL}/temporary-timetable/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          timetable_id: parseInt(timetableId),
          new_ruangan_id: selectedRuangan.id,
          new_timeslot_ids: selectedTimeslots,
          new_day: null,
          change_reason: alasan,
          start_date: new Date().toISOString(),
          academic_period_id: academicPeriodId,
          end_date: new Date(
            new Date().setDate(new Date().getDate() + 7)
          ).toISOString(),
          created_by: "dosen",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || "Failed to save temporary timetable"
        );
      }

      toast.success("Kelas pengganti berhasil disimpan!");
      router.back();
    } catch (error) {
      toast.error(error.message || "Error saving temporary timetable");
    }
  };

  if (!isMounted) return null;

  return (
    <div className="p-8 flex flex-col w-full gap-y-6">
      <Card>
        <CardHeader>
          <div
            onClick={() => router.back()}
            className="mb-4 text-blue-500 text-sm cursor-pointer"
          >
            &larr; Kembali ke halaman sebelumnya
          </div>
          <CardTitle className="flex gap-x-2 text-blue-500 items-center ">
            <Pencil className="w-4 " />
            Temporary Timetable Editor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Label>Kelas Yang Dibuka</Label>
          <Input
            value={selectedOpenedClass ? `${selectedOpenedClass.nama_mk}` : ""}
            readOnly
          />
          <br />

          <Label className="mt-4">Ruangan Baru (Temporary)</Label>
          <Input
            value={selectedRuangan ? `${selectedRuangan.nama_ruang}` : ""}
            readOnly
            onClick={() => setIsRuanganDialogOpen(true)}
            className="cursor-pointer"
          />

          <Label className="mt-4">Alasan</Label>
          <Input value={alasan} onChange={(e) => setAlasan(e.target.value)} />
        </CardContent>
      </Card>

      {availableTimeslots.length > 0 && (
        <TimeslotSelectionTable
          availableTimeslots={availableTimeslots}
          selectedTimeslots={selectedTimeslots}
          onTimeslotToggle={handleTimeslotToggle}
          timetableTimeslots={timetableTimeslots || []}
        />
      )}

      <Button onClick={handleSubmit} className="mt-6 bg-primary">
        Save Temporary Timetable
      </Button>

      <RuanganSelectionDialog
        isOpen={isRuanganDialogOpen}
        onClose={() => setIsRuanganDialogOpen(false)}
        onSelect={handleRuanganSelect}
      />
    </div>
  );
};

export default AddTemporarySchedule;
