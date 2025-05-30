"use client";
import React from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import useAuthStore from "@/hooks/useAuthStore";
import Link from "next/link";
import { Timer } from "lucide-react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

const Login = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const { setAuth } = useAuthStore();
  const router = useRouter();

  const onSubmit = async (data) => {
    toast.loading("Logging in...");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user/token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nim_nip: data.username,
            password: data.password,
            role: "mahasiswa",
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        toast.dismiss();
        toast.success("Login successful!");

        Cookies.set("access_token", result.access_token);
        Cookies.set("token_type", result.token_type);
        Cookies.set("role", result.role);

        setAuth(result.access_token, result.token_type, result.role);
        router.push(`/${result.role}/dashboard`);
      } else {
        toast.dismiss();
        toast.error(result.detail || "Invalid credentials");
      }
    } catch (error) {
      toast.dismiss();
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="bg-gray-100 flex justify-center items-center h-screen">
      {/* Left: Image */}
      <div className="w-1/2 h-screen hidden lg:block relative">
        <Image
          src="/login.jpg"
          alt="Login Image"
          fill
          style={{ objectFit: "cover" }}
          priority
        />
        <div className="h-full absolute bg-green-800 w-full opacity-30"></div>
      </div>

      {/* Right: Login Form */}
      <div className="lg:p-36 md:p-52 sm:p-20 p-8 w-full lg:w-1/2">
        <Link href="/">
          <h1 className="text-2xl font-bold text-green-700 flex gap-x-2 mb-4">
            <Timer className="self-center" />
            <span>GenPlan</span>
          </h1>
        </Link>

        <h1 className="text-2xl font-semibold mb-4">Login</h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Username Input */}
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-600">
              NIM / NIP
            </label>
            <input
              type="text"
              id="username"
              {...register("username", { required: true })}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
              autoComplete="off"
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">Username is required</p>
            )}
          </div>

          {/* Password Input */}
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-600">
              Password
            </label>
            <input
              type="password"
              id="password"
              {...register("password", { required: true })}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
              autoComplete="off"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">Password is required</p>
            )}
          </div>

          {/* Forgot Password Link */}
          <div className="mb-6 text-blue-500 text-right">
            <a href="#" className="hover:underline text-sm">
              Forgot Password?
            </a>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="bg-green-700 hover:bg-green-400 text-white font-semibold rounded-md py-2 px-4 w-full"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
