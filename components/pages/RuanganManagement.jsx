"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import RuanganTable from "./RuanganTable";
import RuanganForm from "./RuanganForm";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import { useLoadingOverlay } from "@/app/context/LoadingOverlayContext";

// ✅ Define the base API URL with endpoint prefix
const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/ruangan/`;

const RuanganManagement = () => {
  const [ruangan, setRuangan] = useState([]);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    jenis: "",
    gedung: "",
    group_code: "",
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentRuangan, setCurrentRuangan] = useState(null);
  const token = Cookies.get("access_token");

  // Overlay context for loading state
  const { setIsActive, setOverlayText } = useLoadingOverlay();

  // Fetch ruangan data when filters/page/pageSize change
  useEffect(() => {
    fetchRuangan();
  }, [filters, page, pageSize]);

  // ✅ Fetch ruangan data
  const fetchRuangan = async () => {
    try {
      setOverlayText("Memuat data ruangan...");
      setIsActive(true);

      const queryParams = new URLSearchParams({
        page: page,
        page_size: pageSize,
        ...filters,
      });

      const response = await fetch(`${API_URL}?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch ruangan");

      const data = await response.json();
      setRuangan(data.data || []);
      setTotal(data.total || 0);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching ruangan:", error);
      toast.error("Gagal memuat data ruangan");
      setLoading(false);
    } finally {
      setIsActive(false);
    }
  };

  // ✅ Handle edit action
  const handleEdit = (room) => {
    setCurrentRuangan(room);
    setIsEdit(true);
    setIsDialogOpen(true);
  };

  // ✅ Handle delete action
  const handleDelete = async (kode_ruangan) => {
    try {
      const response = await fetch(`${API_URL}${kode_ruangan}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to delete ruangan");
      }

      toast.success("Ruangan berhasil dihapus");
      fetchRuangan();
    } catch (error) {
      console.error("Error deleting ruangan:", error);
      toast.error("Gagal menghapus ruangan");
    }
  };

  // ✅ Open form for add/edit ruangan
  const handleOpenForm = () => {
    setIsEdit(false);
    setCurrentRuangan(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="flex w-full">
      <Card className="flex w-full flex-col">
        <CardHeader className="bg-primary/5">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              <span>Manajemen Ruangan</span>
            </div>
            <Button
              onClick={handleOpenForm}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Tambah Ruangan
            </Button>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <RuanganTable
            ruangan={ruangan}
            total={total}
            loading={loading}
            filters={filters}
            setFilters={setFilters}
            page={page}
            setPage={setPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
          />

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
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
          </div>
        </CardContent>
      </Card>

      {/* Form Modal for Add/Edit */}
      <RuanganForm
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        isEdit={isEdit}
        ruangan={currentRuangan}
        fetchRuangan={fetchRuangan}
      />
    </div>
  );
};

export default RuanganManagement;
