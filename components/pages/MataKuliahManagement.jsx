"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import MataKuliahTable from "./MataKuliahTable";
import MataKuliahForm from "./MataKuliahForm";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import { useLoadingOverlay } from "@/app/context/LoadingOverlayContext";

// ✅ Directly define the API URL with the endpoint
const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/matakuliah/`;
const PROGRAM_STUDI_URL = `${process.env.NEXT_PUBLIC_API_URL}/program-studi/`;

const MataKuliahManagement = () => {
  const [matakuliah, setMatakuliah] = useState([]);
  const [programStudi, setProgramStudi] = useState([]);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    semester: "",
    kurikulum: "",
    status_mk: "",
    have_kelas_besar: "",
    search: "",
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentMataKuliah, setCurrentMataKuliah] = useState(null);
  const token = Cookies.get("access_token");

  const { setIsActive, setOverlayText } = useLoadingOverlay();

  useEffect(() => {
    fetchMataKuliah();
  }, [filters, page, pageSize]);

  useEffect(() => {
    fetchProgramStudi();
  }, []);

  // ✅ Fetch MataKuliah data
  const fetchMataKuliah = async () => {
    try {
      setOverlayText("Memuat data mata kuliah...");
      setIsActive(true);

      const queryParams = new URLSearchParams({
        page: page,
        page_size: pageSize,
      });

      // Only append filters if they have valid values
      if (filters.semester && filters.semester !== "Semua") {
        queryParams.append("semester", filters.semester);
      }
      if (filters.kurikulum) {
        queryParams.append("kurikulum", filters.kurikulum);
      }
      if (filters.status_mk && filters.status_mk !== "Semua") {
        queryParams.append("status_mk", filters.status_mk);
      }
      if (filters.have_kelas_besar && filters.have_kelas_besar !== "Semua") {
        queryParams.append("have_kelas_besar", filters.have_kelas_besar);
      }
      if (filters.search) {
        queryParams.append("search", filters.search);
      }

      const response = await fetch(`${API_URL}?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch Mata Kuliah");

      const data = await response.json();
      setMatakuliah(data.data || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error("Error fetching Mata Kuliah:", error);
      toast.error("Gagal memuat data mata kuliah");
    } finally {
      setIsActive(false);
    }
  };

  // ✅ Fetch Program Studi data
  const fetchProgramStudi = async () => {
    try {
      setOverlayText("Memuat data program studi...");
      setIsActive(true);

      const response = await fetch(PROGRAM_STUDI_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch Program Studi");

      const data = await response.json();
      setProgramStudi(data || []);
    } catch (error) {
      console.error("Error fetching Program Studi:", error);
      toast.error("Gagal memuat data program studi");
    } finally {
      setIsActive(false);
    }
  };

  // ✅ Delete Mata Kuliah by kode
  const handleDeleteConfirm = async (kodemk) => {
    try {
      const response = await fetch(`${API_URL}/${kodemk}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to delete Mata Kuliah");
      }

      toast.success("Mata Kuliah berhasil dihapus");
      fetchMataKuliah();
    } catch (error) {
      console.error("Error deleting Mata Kuliah:", error);
      toast.error("Gagal menghapus mata kuliah");
    }
  };

  // ✅ Open form for add/edit
  const handleOpenForm = (matakuliah = null) => {
    setCurrentMataKuliah(matakuliah);
    setIsEdit(!!matakuliah);
    setIsDialogOpen(true);
  };

  return (
    <div className="flex w-full">
      <Card className="flex flex-col w-full">
        <CardHeader className="bg-primary/5">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Book className="h-6 w-6 text-primary" />
              <span>Manajemen Mata Kuliah</span>
            </div>
            <Button
              onClick={() => handleOpenForm(null)}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Tambah Mata Kuliah
            </Button>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <MataKuliahTable
            matakuliah={matakuliah}
            total={total}
            filters={filters}
            setFilters={setFilters}
            page={page}
            setPage={setPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            handleDelete={handleDeleteConfirm}
            handleEdit={handleOpenForm}
            fetchMataKuliah={fetchMataKuliah}
          />

          {/* Optional Pagination Buttons */}
          {/* <div className="flex justify-between items-center mt-4">
            <Button
              disabled={page === 1}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              className="flex items-center"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Sebelumnya
            </Button>
            <span className="text-sm">
              Halaman {page} dari {Math.ceil(total / pageSize) || 1}
            </span>
            <Button
              disabled={page >= Math.ceil(total / pageSize)}
              onClick={() =>
                setPage((prev) =>
                  Math.min(prev + 1, Math.ceil(total / pageSize))
                )
              }
              className="flex items-center"
            >
              Selanjutnya
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div> */}
        </CardContent>
      </Card>

      {/* Form Modal */}
      <MataKuliahForm
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        isEdit={isEdit}
        matakuliah={currentMataKuliah}
        fetchMataKuliah={fetchMataKuliah}
        programStudi={programStudi}
      />
    </div>
  );
};

export default MataKuliahManagement;
