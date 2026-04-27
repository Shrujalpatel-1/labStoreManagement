import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { 
  Bars3BottomLeftIcon, 
  ClockIcon, 
  MagnifyingGlassIcon, 
  ArrowDownTrayIcon,
  ChevronLeftIcon,
  ArrowPathIcon,
  ChevronRightIcon 
} from "@heroicons/react/24/outline";
import Aside from "../../Components/Aside/Aside";
import baseUrl from "../../utils/baseurl";
import toast, { Toaster } from "react-hot-toast";

const ActivityLog = () => {
  const navigate = useNavigate();
  const isLogin = useSelector((state) => state.login.loginStatus);
  
  // State for logs and pagination
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalLogs] = useState(0);

  const fetchLogs = useCallback(async (page = 1, searchQuery = "") => {
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/logs?page=${page}&limit=50&search=${searchQuery}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const result = await response.json();
      if (result.status) {
        setLogs(result.data);
        setTotalPages(result.totalPages);
        setCurrentPage(result.currentPage);
        setTotalLogs(result.total);
      } else {
        toast.error("Failed to load activity logs");
      }
    } catch (error) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLogin) {
      navigate("/login");
      return;
    }
    fetchLogs(currentPage, search);
  }, [isLogin, navigate, fetchLogs, currentPage]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchLogs(1, search);
  };

  const resetSearch = () => {
    setSearch("");
    setCurrentPage(1);
    fetchLogs(1, "");
  };

  const downloadCSV = () => {
    if (logs.length === 0) return toast.error("No data to download");

    const headers = ["Time", "Product", "Category", "Action", "Details", "Performed By"];
    const rows = logs.map(log => [
      new Date(log.createdAt).toLocaleString(),
      `"${log.productName}"`,
      `"${log.category}"`,
      log.action,
      `"${log.details.replace(/"/g, '""')}"`,
      log.performedBy
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `activity_log_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActionColor = (action) => {
    switch (action) {
      case "Added": return "badge-success";
      case "Updated": return "badge-info";
      case "Issued": return "badge-warning";
      case "Returned": return "badge-primary";
      case "Deleted": return "badge-error";
      default: return "badge-ghost";
    }
  };

  const formatCategory = (text) => {
    if (!text) return "N/A";
    return text
      .replace(/_/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="md:w-[90%] mt-3 md:mx-auto">
      <div className="drawer lg:drawer-open">
        <input id="sidebar_drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content px-4">
          
          {/* --- HEADER & TOOLBAR --- */}
          <div className="flex flex-col gap-4 my-4 border-b pb-4">
            <div className="flex items-center justify-between">
              <label htmlFor="sidebar_drawer" className="drawer-button lg:hidden">
                <Bars3BottomLeftIcon className="w-6 h-6" />
              </label>
              <div className="flex items-center gap-2">
                <ClockIcon className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">Activity Log</h2>
              </div>
              <button onClick={downloadCSV} className="btn btn-outline btn-sm btn-primary gap-2">
                <ArrowDownTrayIcon className="w-4 h-4" />
                Export CSV
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <form onSubmit={handleSearch} className="flex-1 min-w-[300px] relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
                <input 
                  type="text" 
                  placeholder="Search by product name..." 
                  className="input input-bordered w-full pl-10 pr-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                   <button 
                    type="button" 
                    onClick={resetSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 btn btn-ghost btn-circle btn-xs"
                   >
                     ✕
                   </button>
                )}
              </form>
              <div className="text-sm opacity-70 font-medium">
                Showing <span className="text-primary">{logs.length}</span> of {totalCount} logs (Last 6 Months)
              </div>
            </div>
          </div>

          {/* --- LOG TABLE --- */}
          <div className="overflow-x-auto max-h-[65vh] border rounded-xl shadow-inner">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-20 gap-4">
                <span className="loading loading-spinner loading-lg text-primary"></span>
                <p className="text-sm italic opacity-50 animate-pulse">Fetching latest activities...</p>
              </div>
            ) : (
              <table className="table table-zebra w-full table-pin-rows">
                <thead className="bg-base-200">
                  <tr>
                    <th className="w-[12%]">Time</th>
                    <th className="w-[12%]">Product</th>
                    <th className="w-[12%]">Category</th>
                    <th className="w-[10%] text-center">Action</th>
                    <th className="w-[39%]">Details</th>
                    <th className="w-[15%]">Performed By</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length > 0 ? (
                    logs.map((log) => (
                      <tr key={log._id} className="hover align-top group">
                        <td className="text-[10px] md:text-xs whitespace-normal py-4">
                          <div className="font-bold">{new Date(log.createdAt).toLocaleDateString()}</div>
                          <div className="opacity-50">{new Date(log.createdAt).toLocaleTimeString()}</div>
                        </td>
                        <td className="font-semibold py-4 group-hover:text-primary transition-colors">{log.productName}</td>
                        <td className="py-4 text-xs italic opacity-80">{formatCategory(log.category)}</td>
                        <td className="text-center py-4">
                          <span className={`badge ${getActionColor(log.action)} text-white font-bold badge-sm`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="text-xs md:text-sm py-4 break-words leading-relaxed bg-base-200/20 group-hover:bg-base-200/50 rounded-lg transition-colors px-3">
                          {log.details}
                        </td>
                        <td className="text-[10px] md:text-xs italic py-4 opacity-70">
                          {log.performedBy}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center p-20">
                        <div className="flex flex-col items-center gap-2 opacity-30">
                          <ArrowPathIcon className="w-12 h-12" />
                          <p className="text-xl font-bold italic">No matching activities found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* --- PAGINATION --- */}
          {!loading && totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <div className="join shadow-md">
                <button 
                  className="join-item btn btn-sm" 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                </button>
                <button className="join-item btn btn-sm no-animation bg-base-200">
                  Page {currentPage} of {totalPages}
                </button>
                <button 
                  className="join-item btn btn-sm" 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>
        <div className="drawer-side md:h-[88vh]">
          <label htmlFor="sidebar_drawer" aria-label="close sidebar" className="drawer-overlay"></label>
          <Aside />
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default ActivityLog;
