import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Aside from "../../Components/Aside/Aside";
import { useSelector } from "react-redux";
import {
  UserCircleIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  IdentificationIcon,
} from "@heroicons/react/24/solid"; // Using solid icons for better visual weight
import baseUrl from "../../utils/baseurl";

const Profile = () => {
  // Get Redux state
  const { loginStatus: isLogin, role: reduxRole } = useSelector(
    (state) => state.login
  );
  const navigate = useNavigate();

  const [user, setUser] = useState({
    email: "",
    role: reduxRole || "", // Initialize with Redux role while fetching
    _id: "Loading...",
    createdAt: null,
  });

  const [isLoading, setIsLoading] = useState(true);

  const getUser = async () => {
    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    let requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
      credentials: "include",
    };

    try {
      const response = await fetch(`${baseUrl}/getUser`, requestOptions);
      const result = await response.json();

      if (result.status) {
        setUser(result.data);
      } else {
        console.log("Error::profile::result", result.message);
      }
    } catch (error) {
      console.error("Failed to fetch user details", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isLogin) {
      navigate("/login");
    } else {
      getUser();
    }
  }, [isLogin, navigate]);

  // Helper to determine role badge color
  const getRoleBadgeStyle = (roleName) => {
    if (roleName === "storekeeper") {
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    }
    return "bg-blue-100 text-blue-800 border-blue-200";
  };

  return (
    <div className="md:w-[80%] md:mx-auto">
      <div className="drawer lg:drawer-open">
        <input id="sidebar_drawer" type="checkbox" className="drawer-toggle" />

        {/* --- MAIN CONTENT --- */}
        <div className="drawer-content px-4 bg-gray-50 min-h-screen">
          {/* Header Title */}
          <div className="py-6">
            <h3 className="font-bold text-2xl text-gray-800">My Profile</h3>
            <p className="text-gray-500 text-sm">
              Manage your account information
            </p>
          </div>

          <div className="mb-20">
            {/* --- PROFILE CARD --- */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden max-w-4xl mx-auto border border-gray-100">
              {/* 1. Gradient Banner */}
              <div className="h-40 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
              </div>

              {/* 2. Avatar & Main Info */}
              <div className="px-8 pb-8 relative">
                <div className="relative -mt-16 mb-6 flex flex-col sm:flex-row items-center sm:items-end gap-6">
                  {/* Avatar Circle */}
                  <div className="relative p-1 bg-white rounded-full shadow-lg">
                    <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      <UserCircleIcon className="w-full h-full text-gray-400 bg-gray-100" />
                    </div>
                    {/* Active Status Dot */}
                    <div className="absolute bottom-2 right-4 w-5 h-5 bg-green-500 border-4 border-white rounded-full"></div>
                  </div>

                  {/* Name & Role */}
                  <div className="text-center sm:text-left mb-2 flex-1">
                    <h2 className="text-3xl font-bold text-gray-800">
                      {user.email ? user.email.split("@")[0] : "User"}
                    </h2>

                    <div className="flex items-center justify-center sm:justify-start gap-3 mt-2">
                      {/* Role Badge */}
                      <span
                        className={`px-4 py-1 rounded-full text-sm font-semibold border ${getRoleBadgeStyle(
                          user.role || reduxRole
                        )} capitalize flex items-center gap-1`}
                      >
                        <ShieldCheckIcon className="w-4 h-4" />
                        {user.role || reduxRole || "Faculty"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Detailed Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  {/* Email Card */}
                  <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-2 text-gray-500">
                      <EnvelopeIcon className="w-5 h-5 text-blue-500" />
                      <span className="text-sm font-medium uppercase tracking-wider">
                        Email Address
                      </span>
                    </div>
                    <div className="text-lg font-semibold text-gray-800 break-all">
                      {isLoading ? "Loading..." : user.email}
                    </div>
                  </div>

                  {/* User ID / Account Type Card */}
                  {/* <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-2 text-gray-500">
                      <IdentificationIcon className="w-5 h-5 text-purple-500" />
                      <span className="text-sm font-medium uppercase tracking-wider">
                        User ID
                      </span>
                    </div>
                    <div className="text-lg font-mono font-semibold text-gray-800">
                      {isLoading ? "..." : user._id}
                    </div>
                  </div> */}
                </div>

                {/* 4. Bottom Info / Stats Placeholder */}
                <div className="mt-8 border-t pt-6">
                  <h4 className="text-gray-800 font-semibold mb-4">
                    Account Status
                  </h4>
                  <div className="flex flex-wrap gap-4">
                    <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      Account Active
                    </div>
                    <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      Verified Member
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- SIDEBAR --- */}
        <div className="drawer-side md:h-[80vh] h-full">
          <label
            htmlFor="sidebar_drawer"
            aria-label="close sidebar"
            className="drawer-overlay"
          ></label>
          <Aside />
        </div>
      </div>
    </div>
  );
};

export default Profile;
