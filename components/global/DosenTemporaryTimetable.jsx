"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import { decodeToken } from "@/utils/decoder";
import { Trash } from "lucide-react";

const DosenTemporaryTimetable = () => {
  const router = useRouter();
  const [temporaryData, setTemporaryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [filter, setFilter] = useState("");

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = Cookies.get("access_token");
        const decodedToken = decodeToken(token);
        setUserId(decodedToken.role_id);

        await fetchTemporaryTimetable(decodedToken.role_id);
      } catch (error) {
        toast.error("Gagal mengambil data dosen");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [page, filter]);

  const fetchTemporaryTimetable = async (dosenId) => {
    try {
      setLoading(true);
      const token = Cookies.get("access_token");

      const response = await fetch(
        `${BASE_URL}/temporary-timetable/dosen/${dosenId}?page=${page}&page_size=${limit}&filter=${filter}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Gagal mengambil jadwal sementara");

      const res = await response.json();
      setTemporaryData(res.data || []);
      setTotalPages(res.total_pages || 1);
    } catch (error) {
      toast.error("Gagal mengambil jadwal sementara");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchClick = () => {
    setFilter(searchInput);
    setPage(1);
  };

  const handleDelete = async (id) => {
    try {
      const token = Cookies.get("access_token");

      const response = await fetch(`${BASE_URL}/temporary-timetable/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Gagal menghapus kelas pengganti");

      toast.success("Kelas pengganti berhasil dihapus!");

      await fetchTemporaryTimetable(userId);
    } catch (error) {
      toast.error(error.message || "Gagal menghapus kelas pengganti");
    }
  };

  return (
    <div className="w-full flex flex-col gap-y-4 mx-auto p-4">
      <div className="w-full flex justify-between">
        <h1 className="text-green-700 font-bold text-2xl">
          Jadwal Sementara Dosen
        </h1>
      </div>

      <Card className="bg-surface border-border">
        <CardHeader className="bg-green-700 text-white  p-4">
          <h2 className="text-lg font-semibold">Jadwal Kelas Pengganti</h2>
          <p className="text-sm opacity-90">
            Menampilkan daftar kelas pengganti sementara
          </p>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Cari berdasarkan nama atau kode mata kuliah"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full"
            />
            <Button
              onClick={handleSearchClick}
              className="bg-green-700 text-white"
            >
              <Search /> Cari
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-green-700" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="w-full border-collapse">
                <TableHeader>
                  <TableRow className="bg-green-700/5">
                    {/* Fix: Remove whitespace */}
                    <TableHead>Kode MK</TableHead>
                    <TableHead>Mata Kuliah</TableHead>
                    <TableHead>Dosen</TableHead>
                    <TableHead>Ruangan</TableHead>
                    <TableHead>Jadwal</TableHead>
                    <TableHead>Tanggal Mulai</TableHead>
                    <TableHead>Tanggal Berakhir</TableHead>
                    <TableHead>Alasan</TableHead>
                    <TableHead>Aksi</TableHead>
                    {/* Fix: Remove whitespace */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {temporaryData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan="9" className="p-8 text-center">
                        Belum ada jadwal sementara.
                      </TableCell>
                    </TableRow>
                  ) : (
                    temporaryData.map((temp) => (
                      <TableRow key={temp.temporary_timetable_id}>
                        <TableCell>{temp.kodemk}</TableCell>
                        <TableCell>{temp.matakuliah}</TableCell>
                        <TableCell>{temp.dosen}</TableCell>
                        <TableCell>{temp.ruangan}</TableCell>
                        <TableCell>{temp.schedule.split(".").pop()}</TableCell>
                        <TableCell>
                          {new Date(temp.start_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {new Date(temp.end_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{temp.change_reason}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            className="text-red-500 hover:bg-red-100"
                            onClick={() =>
                              handleDelete(temp.temporary_timetable_id)
                            }
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="mr-2" /> Previous
            </Button>
            <span>
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage((prev) => prev + 1)}
              disabled={page === totalPages}
            >
              Next <ChevronRight className="ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DosenTemporaryTimetable;
