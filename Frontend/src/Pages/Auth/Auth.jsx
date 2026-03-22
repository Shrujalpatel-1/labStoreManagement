import React, { useState } from "react";
import { setLoginData } from "../../Redux/login/isLogin";
import { useDispatch } from "react-redux";
import baseurl from "../../utils/baseurl";
import logo from "../../Images/logo.jpeg";
import { useForm } from "react-hook-form";
import {
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
  KeyIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const Auth = () => {
  const [isLoginPage, setisLoginPage] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [eyePassword, seteyePassword] = useState(false);
  const [eyeConfirmPassword, seteyeConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const MNNIT_LOGO = logo;

  // --- Validation Helpers ---
  const validateEmail = (email) => {
    if (!email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
      return "Invalid email format";
    }
  };

  const validatePassword = (password) => {
    let regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{};':",.<>/?])(?!.*\s).{8,}$/;
    if (!password.match(regex)) {
      return "Password must meet complexity requirements";
    }
  };

  const loginUser = async (obj) => {
    const loadingToast = toast.loading("Signing in...");
    try {
      const response = await fetch(`${baseurl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(obj),
        credentials: "include",
      });
      const result = await response.json();
      toast.dismiss(loadingToast);

      if (result.status) {
        // --- CHANGE START: Set 2-Day Persistence ---
        const twoDaysInMs = 2 * 24 * 60 * 60 * 1000;
        const expiryTime = Date.now() + twoDaysInMs;

        const storageData = {
          role: result.data.role,
          expiry: expiryTime,
        };

        // Save to Local Storage
        localStorage.setItem("mnnit_auth_data", JSON.stringify(storageData));
        // --- CHANGE END ---

        dispatch(
          setLoginData({
            status: true,
            role: result.data.role,
          })
        );

        toast.success("Welcome back!");
        setTimeout(() => navigate("/"), 1000);
      } else {
        toast.error(result.message || "Invalid credentials");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Connection error. Please try again.");
      console.error("Auth Error:", error);
    }
  };

  const registerUser = async (obj) => {
    const loadingToast = toast.loading("Creating account...");
    try {
      const response = await fetch(`${baseurl}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(obj),
        credentials: "include",
      });
      const result = await response.json();
      toast.dismiss(loadingToast);

      if (result.status) {
        toast.success("Registration successful! Please log in.");
        setisLoginPage(true);
        reset();
      } else {
        toast.error(result.message || "Registration failed");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Connection error. Please try again.");
      console.error("Auth Error:", error);
    }
  };

  const onSubmit = (data) => {
    if (!isLoginPage) {
      if (data.password !== data.cpassword) {
        toast.error("Passwords do not match");
        return;
      }
      const { cpassword, ...registerData } = data;
      registerUser(registerData);
    } else {
      loginUser(data);
    }
  };

  // --- Styles ---
  // Updated for Navy Blue theme with Dark Mode support
  const inputContainerClass =
    "flex items-center px-3 py-2.5 border rounded-xl transition-all duration-200 ease-in-out " +
    // Light Mode
    "bg-slate-50 border-slate-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-900/20 focus-within:border-blue-900 " +
    // Dark Mode
    "dark:bg-slate-900/50 dark:border-slate-700 dark:focus-within:bg-slate-900 dark:focus-within:ring-blue-500/30 dark:focus-within:border-blue-500";

  const inputErrorClass =
    // Light Mode
    "!border-red-300 !bg-red-50/50 focus-within:!ring-red-500/30 focus-within:!border-red-500 " +
    // Dark Mode
    "dark:!bg-red-900/10 dark:!border-red-800/50";

  const labelClass =
    "block text-sm font-medium mb-1.5 ml-1 text-slate-700 dark:text-slate-300";
  const iconClass = (hasError) =>
    `h-5 w-5 mr-3 ${
      hasError ? "text-red-400" : "text-slate-400 dark:text-slate-500"
    }`;

  return (
    <main className="min-h-screen flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8 transition-colors duration-300 bg-slate-100 dark:bg-[#0B1120]">
      {/* --- HEADER --- */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8 flex flex-col items-center">
        {/* Optional: Add a white background circle to logo if it's transparent and hard to see in dark mode */}
        <div className="p-2 rounded-full">
          <img
            className="h-40 w-auto drop-shadow-sm transition-transform hover:scale-105 duration-300"
            src={MNNIT_LOGO}
            alt="MNNIT Logo"
          />
        </div>

        <h2 className="mt-6 text-3xl font-bold tracking-tight text-blue-950 dark:text-slate-100">
          MNNIT Allahabad
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
          Biotechnology Department
        </p>
      </div>

      {/* --- MAIN CARD --- */}
      <div className="sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="py-10 px-6 shadow-xl sm:rounded-2xl sm:px-12 border transition-colors duration-300 bg-white border-slate-200 shadow-slate-200/50 dark:bg-slate-800 dark:border-slate-700 dark:shadow-black/30">
          <div className="mb-8">
            <h3 className="text-2xl font-semibold text-blue-950 dark:text-white">
              {isLoginPage ? "Welcome back" : "Create an account"}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {isLoginPage
                ? "Please enter your details to sign in."
                : "Fill in the details below to get started."}
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
            autoComplete="off"
            noValidate
          >
            {/* Email Field */}
            <div>
              <label className={labelClass}>Email Address</label>
              <div
                className={`${inputContainerClass} ${
                  errors.email ? inputErrorClass : ""
                }`}
              >
                <EnvelopeIcon className={iconClass(errors.email)} />
                <input
                  type="email"
                  className="flex-1 bg-transparent outline-none text-sm text-blue-950 placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
                  placeholder="you@mnnit.ac.in"
                  {...register("email", { validate: validateEmail })}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 ml-1 text-xs text-red-600 dark:text-red-400 font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className={labelClass}>Password</label>
              <div
                className={`${inputContainerClass} ${
                  errors.password ? inputErrorClass : ""
                }`}
              >
                <KeyIcon className={iconClass(errors.password)} />
                <input
                  type={eyePassword ? "text" : "password"}
                  className="flex-1 bg-transparent outline-none text-sm text-blue-950 placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
                  placeholder="••••••••"
                  {...register("password", { validate: validatePassword })}
                />
                <button
                  type="button"
                  onClick={() => seteyePassword(!eyePassword)}
                  className="ml-2 text-slate-400 hover:text-blue-900 dark:hover:text-slate-200 focus:outline-none transition-colors"
                  tabIndex="-1"
                >
                  {eyePassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password ? (
                <p className="mt-1.5 ml-1 text-xs text-red-600 dark:text-red-400 font-medium">
                  {errors.password.message}
                </p>
              ) : (
                !isLoginPage && (
                  <p className="mt-1.5 ml-1 text-xs text-slate-500 dark:text-slate-400">
                    Min 8 chars, 1 uppercase, 1 number, 1 special.
                  </p>
                )
              )}
            </div>

            {/* Role Selection Field (Only for Registration) */}
            {!isLoginPage && (
              <div className="animate-fadeIn">
                <label className={labelClass}>Register As</label>
                <div className={`${inputContainerClass} pl-1`}>
                  <select
                    className="flex-1 bg-transparent outline-none text-sm text-blue-950 dark:text-slate-100 p-1 cursor-pointer"
                    {...register("role")}
                    defaultValue="faculty"
                  >
                    <option value="faculty" className="text-black">Faculty</option>
                    <option value="storekeeper" className="text-black">Storekeeper</option>
                  </select>
                </div>
              </div>
            )}

            {/* Confirm Password Field */}
            {!isLoginPage && (
              <div className="animate-fadeIn">
                <label className={labelClass}>Confirm Password</label>
                <div
                  className={`${inputContainerClass} ${
                    errors.cpassword ? inputErrorClass : ""
                  }`}
                >
                  <KeyIcon className={iconClass(errors.cpassword)} />
                  <input
                    type={eyeConfirmPassword ? "text" : "password"}
                    className="flex-1 bg-transparent outline-none text-sm text-blue-950 placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
                    placeholder="••••••••"
                    {...register("cpassword", {
                      validate: (val, formValues) =>
                        val === formValues.password || "Passwords do not match",
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => seteyeConfirmPassword(!eyeConfirmPassword)}
                    className="ml-2 text-slate-400 hover:text-blue-900 dark:hover:text-slate-200 focus:outline-none transition-colors"
                    tabIndex="-1"
                  >
                    {eyeConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.cpassword && (
                  <p className="mt-1.5 ml-1 text-xs text-red-600 dark:text-red-400 font-medium">
                    {errors.cpassword.message}
                  </p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 bg-blue-950 hover:bg-blue-900 focus:ring-blue-950 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-500 dark:ring-offset-slate-800"
              >
                {isLoginPage ? "Sign In" : "Create Account"}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors duration-300">
                  or
                </span>
              </div>
            </div>
          </div>

          {/* Toggle Login/Register */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {isLoginPage
                ? "New to the portal? "
                : "Already have an account? "}
              <button
                onClick={() => {
                  setisLoginPage(!isLoginPage);
                  reset();
                  seteyePassword(false);
                  seteyeConfirmPassword(false);
                }}
                className="font-bold text-blue-950 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors focus:outline-none focus:underline"
              >
                {isLoginPage ? "Create an account" : "Sign in here"}
              </button>
            </p>
          </div>
        </div>

        {/* --- FOOTER --- */}
        <div className="mt-8 text-center animate-fadeIn">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
            Developed by Team
          </p>
          <div className="flex flex-wrap justify-center items-center gap-3 text-sm text-slate-600 dark:text-slate-400 font-medium">
            <span className="hover:text-blue-900 dark:hover:text-blue-400 transition-colors cursor-default">
              Vaishnavi Srivastava
            </span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="hover:text-blue-900 dark:hover:text-blue-400 transition-colors cursor-default">
              Shrujal Patel
            </span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="hover:text-blue-900 dark:hover:text-blue-400 transition-colors cursor-default">
              Alankrit Gond
            </span>
          </div>
        </div>
      </div>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#334155", // dark slate for better neutrality in both modes
            color: "#fff",
          },
        }}
      />
    </main>
  );
};

export default Auth;