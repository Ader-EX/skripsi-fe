/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, Timer } from "lucide-react";
import useAuthStore from "@/hooks/useAuthStore";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

export default function Navbar() {
  const [state, setState] = React.useState(false);
  const [role, setRole] = React.useState("guest");
  const { token, logout } = useAuthStore();
  const router = useRouter();

  React.useEffect(() => {
    const hasil = Cookies.get("access_token");
    if (hasil) {
      try {
        const decoded = jwtDecode(hasil);
        const now = Math.floor(Date.now() / 1000);

        if (decoded.exp && decoded.exp < now) {
          logout();
          Cookies.remove("access_token");
          router.replace("/login");
          return;
        }
        setRole(decoded.role || "guest");
      } catch (error) {
        console.error("JWT Decode Error:", error);
      }
    }
  }, []);

  const dashboardUrl =
    role === "mahasiswa"
      ? "/mahasiswa/dashboard"
      : role === "dosen"
      ? "/dosen/dashboard"
      : role === "admin"
      ? "/admin/dashboard"
      : "/";

  const handleLogout = () => {
    logout();
    Cookies.remove("access_token");
    router.replace("/login");
  };

  return (
    <nav className="bg-white w-full border-b md:border-1">
      <div className="items-center px-4 max-w-screen-xl mx-auto md:flex md:px-8">
        <div className="flex items-center justify-between py-3 md:py-5 md:block">
          <Link href="/">
            <h1 className="text-2xl font-bold text-green-700 flex gap-x-2">
              <Timer className="self-center" />
              <span>GenPlan</span>
            </h1>
          </Link>
          <div className="md:hidden">
            <button
              className="text-gray-700 outline-none p-2 rounded-md focus:border-gray-400 focus:border"
              onClick={() => setState(!state)}
            >
              <Menu />
            </button>
          </div>
        </div>

        {/* Navbar Menu */}
        <div
          className={`flex-1 justify-self-center pb-3 mt-8 md:block md:pb-0 md:mt-0 ${
            state ? "hidden" : "block"
          }`}
        >
          <ul className="flex flex-col sm:flex-row justify-end items-center space-y-4 sm:space-y-0 sm:space-x-6">
            {role !== "guest" ? (
              <>
                {/* Dashboard Button */}
                <Link href={dashboardUrl}>
                  <button className="bg-green-700 text-white py-2 px-4 rounded-md hover:bg-green-400 transition">
                    Go to Dashboard
                  </button>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="text-red-500 hover:underline"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login">
                <button className="bg-green-700 text-white py-2 px-4 rounded-md">
                  Login
                </button>
              </Link>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
