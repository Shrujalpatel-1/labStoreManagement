import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setLoginData } from "../../Redux/login/isLogin";
import baseurl from "../../utils/baseurl";
import logo from "../../Images/logo.jpeg";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";

const Auth = () => {
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const MNNIT_LOGO = logo;

  useEffect(() => {
    const checkSetup = async () => {
      try {
        const res = await fetch(`${baseurl}/auth/setup-status`);
        const data = await res.json();
        if (data.status && !data.isSetup) {
          setIsSetupMode(true);
        }
      } catch (err) {
        toast.error("Cannot connect to server");
      } finally {
        setLoadingStatus(false);
      }
    };

    checkSetup();
  }, []);

  const onSubmit = async (data) => {
    const endpoint = isSetupMode ? "/auth/setup" : "/login";
    const loadingToast = toast.loading(
      isSetupMode ? "Initializing system..." : "Signing in..."
    );

    try {
      const response = await fetch(`${baseurl}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      const result = await response.json();
      toast.dismiss(loadingToast);

      if (result.status) {
        if (isSetupMode) {
          toast.success("Initial setup complete. Please sign in.");
          setIsSetupMode(false);
          reset();
          return;
        }

        const storageData = {
          role: result.data.role,
          expiry: Date.now() + 2 * 24 * 60 * 60 * 1000,
        };

        localStorage.setItem("mnnit_auth_data", JSON.stringify(storageData));
        dispatch(setLoginData({ status: true, role: result.data.role }));
        toast.success("Welcome back!");
        navigate("/");
      } else {
        toast.error(result.message || "Invalid credentials");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Network error");
      console.error("Auth Error:", error);
    }
  };

  if (loadingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-[#0B1120] text-slate-600 dark:text-slate-300">
        Loading...
      </div>
    );
  }

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
      <div className="sm:mx-auto sm:w-full sm:max-w-[500px]">
        <div className="py-10 px-6 shadow-xl sm:rounded-2xl sm:px-12 border transition-colors duration-300 bg-white border-slate-200 shadow-slate-200/50 dark:bg-slate-800 dark:border-slate-700 dark:shadow-black/30">
          <div className="mb-8">
            <h3 className="text-2xl font-semibold text-blue-950 dark:text-white">
              {isSetupMode ? "System Initialization" : "Portal Login"}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {isSetupMode
                ? "Create the first Lab Coordinator account to activate the system."
                : "Please enter your details to sign in."}
            </p>
          </div>

          {isSetupMode && (
            <p className="text-sm text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md mb-5 border border-amber-200 dark:border-amber-700/40 text-center">
              No users detected. First account will be used for initial setup.
            </p>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            autoComplete="off"
            noValidate
          >
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                Email
              </label>
              <input 
                type="email" 
                placeholder="username@mnnit.ac.in" 
                {...register("email", { 
                  required: "Email is required",
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@mnnit\.ac\.in$/,
                    message: "Only @mnnit.ac.in domains are allowed"
                  }
                })} 
                className="input input-bordered w-full" 
              />
              
              {errors.email && (
                 <span className="text-xs text-error mt-1 block px-1">{errors.email.message}</span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                Password
              </label>
              <input
                type="password"
                {...register("password")}
                className="w-full p-2.5 border rounded-md bg-white dark:bg-slate-900/50 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-900/20 dark:focus:ring-blue-500/30"
                placeholder="********"
                required
              />
            </div>

            {isSetupMode && (
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                  Role
                </label>
                
                {/* Hidden input to securely send the exact role value to the backend */}
                <input 
                  type="hidden" 
                  value="lab_coordinator" 
                  {...register("role")} 
                />
                
                {/* Visible disabled input for UX confirmation */}
                <input
                  type="text"
                  value="Lab Coordinator"
                  disabled
                  className="w-full p-2.5 border rounded-md bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed outline-none"
                />
                <p className="text-xs mt-1 text-slate-500 dark:text-slate-400 font-medium">
                  The initial setup account is strictly assigned as a Lab Coordinator.
                </p>
              </div>
            )}

            <div className="pt-4">
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 bg-blue-950 hover:bg-blue-900 focus:ring-blue-950 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-500 dark:ring-offset-slate-800"
              >
                {isSetupMode ? "Initialize System" : "Sign In"}
              </button>
            </div>
          </form>
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
            background: "#334155",
            color: "#fff",
          },
        }}
      />
    </main>
  );
};

export default Auth;
