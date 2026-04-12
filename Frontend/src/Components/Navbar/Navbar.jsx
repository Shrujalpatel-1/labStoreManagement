import {
  BuildingStorefrontIcon,
  MoonIcon,
  SunIcon,
  ClockIcon
} from "@heroicons/react/24/outline";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setLastUpdated } from "../../Redux/products/productSlice";
import baseUrl from "../../utils/baseurl";

const Navbar = () => {
  const dispatch = useDispatch();
  
  // Get authentication status and last updated timestamp
  const isLogin = useSelector((state) => state.login.loginStatus);
  const lastUpdated = useSelector((state) => state.product.lastUpdated);

  useEffect(() => {
    // Only fetch if logged in
    if (isLogin) {
      const fetchLastUpdated = async () => {
        try {
          const response = await fetch(`${baseUrl}/system/last-updated`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          });
          const result = await response.json();
          if (result.status && result.data.lastUpdated) {
            dispatch(setLastUpdated(result.data.lastUpdated));
          }
        } catch (error) {
          console.error("Failed to fetch system timestamp");
        }
      };
      fetchLastUpdated();
    }
  }, [isLogin, dispatch]);

  const toggleDarkMode = () => {
    const mode = document.body.parentElement.getAttribute("data-theme");
    if (mode === "dark") {
      document.body.parentElement.setAttribute("data-theme", "cupcake");
      localStorage.setItem("isDarkMode", "false");
    } else {
      document.body.parentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("isDarkMode", "true");
    }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return "Updating...";
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  return (
    <div className="sticky top-0 z-50 navbar h-10 rounded-md shadow-md bg-base-100/90 backdrop-blur-md transition-colors duration-300">
      <div className="md:w-[90%] md:mx-auto flex justify-between items-center w-full px-2">
        <div className="flex items-center">
          <div className="icon mx-2 text-primary">
            <BuildingStorefrontIcon className="w-6 h-6" />
          </div>
          <a className="text-xl font-bold hidden sm:block">Lab Inventory Management</a>
        </div>
        <div className="flex items-center gap-4">
          {/* --- NEW: LAST UPDATED BADGE --- */}
          {isLogin && lastUpdated && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700">
              <ClockIcon className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Updated: {formatTimeAgo(lastUpdated)}
              </span>
            </div>
          )}

          <div className="flex items-center px-2 cursor-pointer hover:text-primary transition-colors">
            <SunIcon onClick={toggleDarkMode} className="dark:hidden h-6 w-6" />
            <MoonIcon onClick={toggleDarkMode} className="hidden dark:block h-6 w-6" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
