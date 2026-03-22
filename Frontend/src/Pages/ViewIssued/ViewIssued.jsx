import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Bars3BottomLeftIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import Aside from "../../Components/Aside/Aside";
import baseUrl from "../../utils/baseurl";
import toast, { Toaster } from "react-hot-toast";
import { setIssuedItems } from "../../Redux/issue/issueSlice"; // Correct import

// Renamed component
const ViewIssuedItems = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isLogin = useSelector((state) => state.login.loginStatus);

  // Updated to use the issueSlice
  const issuedItemsList = useSelector((state) => state.issue.issuedItems);

  // State for delete confirmation modal
  const [itemToDelete, setItemToDelete] = useState(null);

  // --- 1. ADD STATE FOR SEARCH ---
  const [searchQuery, setSearchQuery] = useState("");

  // Renamed function to get issued items
  const getIssuedItems = async () => {
    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    let requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
      credentials: "include",
    };

    try {
      // Updated endpoint
      const response = await fetch(`${baseUrl}/getissue`, requestOptions);

      // Added response.ok check for better error handling
      if (!response.ok) {
        const errData = await response.json();
        toast.error(errData.message || "Failed to fetch items");
        console.log("Error::get items::result", errData.message);
        if (response.status === 401) {
          navigate("/login"); // Redirect if not authorized
        }
        return;
      }

      const result = await response.json();
      if (result.status) {
        // Updated to use setIssuedItems
        dispatch(setIssuedItems(result.data));
      } else {
        toast.error(result.message || "Could not load items");
        console.log("Error::get items::result", result.message);
      }
    } catch (error) {
      toast.error("An error occurred");
      console.log("Error::get items::", error);
    }
  };

  // Function to open the delete confirmation modal
  const openDeleteModal = (issueId) => {
    setItemToDelete(issueId);
    const modal = document.getElementById("delete_modal");
    if (modal) {
      modal.showModal();
    }
  };

  // Function to handle the actual deletion after confirmation
  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    let requestOptions = {
      method: "POST",
      body: JSON.stringify({ issueId: itemToDelete }),
      headers: myHeaders,
      redirect: "follow",
      credentials: "include",
    };

    try {
      // Updated endpoint
      const response = await fetch(`${baseUrl}/deleteissue`, requestOptions);

      if (!response.ok) {
        let errorMsg = "Delete failed. Server error.";
        try {
          const errData = await response.json();
          errorMsg = errData.message || `Error: ${response.status}`;
        } catch (e) {
          errorMsg = `Error: ${response.status} ${response.statusText}`;
        }

        toast.error(errorMsg);
        console.log("Error::delete issue::response not ok", errorMsg);

        if (response.status === 401) {
          navigate("/login"); // Redirect if not authorized
        }
        return; // Stop execution (finally will still run)
      }

      const result = await response.json();

      if (result.status) {
        toast.success("Item deleted successfully");
        getIssuedItems(); // Refresh the list
      } else {
        toast.error(result.message || "Something went wrong! try again");
        console.log("Error::delete issue::result", result.message);
      }
    } catch (error) {
      toast.error("An error occurred during deletion");
      console.log("Error::delete issue::", error);
    } finally {
      setItemToDelete(null); // Reset the state
      const modal = document.getElementById("delete_modal");
      if (modal) {
        modal.close(); // Close the modal
      }
    }
  };

  useEffect(() => {
    if (!isLogin) {
      navigate("/login");
    } else {
      if (issuedItemsList.length <= 0) {
        getIssuedItems();
      }
    }
  }, [isLogin, issuedItemsList.length, navigate, dispatch]);

  // Helper to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // --- 2. CREATE THE FILTERED LIST ---
  // Filters by Student Name or Product Name, case-insensitive
  const filteredItems = issuedItemsList.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.studentName.toLowerCase().includes(query) ||
      item.productName.toLowerCase().includes(query)
    );
  });

  return (
    <div className="md:w-[80%] md:mx-auto">
      {/* main */}
      <div className="drawer lg:drawer-open">
        <input id="sidebar_drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content px-4">
          <div className="flex items-center justify-between ">
            <label htmlFor="sidebar_drawer" className="drawer-button lg:hidden">
              <Bars3BottomLeftIcon className="w-6 h-6" />
            </label>
            <h2 className="text-xl w-full text-center md:text-start">
              View Issued Items
            </h2>

            {/* --- 3. MODIFIED DESKTOP SEARCH --- */}
            <div className="hidden md:flex items-center w-1/2">
              <input
                type="text"
                placeholder="Search by Student or Product"
                className="input input-bordered rounded-full h-10 lg:w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="p-2 bg-blue-500 text-white rounded-md ms-2">
                <MagnifyingGlassIcon className="w-6 h-6" />
              </span>
            </div>
          </div>

          {/* --- 4. MODIFIED MOBILE SEARCH --- */}
          <div className="flex md:hidden items-center w-full mt-4">
            <input
              type="text"
              placeholder="Search by Student or Product Name"
              className="input input-bordered rounded-full h-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="p-2 bg-blue-500 text-white rounded-md ms-2">
              <MagnifyingGlassIcon className="w-6 h-6" />
            </span>
          </div>

          {/* table start */}
          {/* --- 5. USE FILTERED LIST FOR CHECKS AND MAP --- */}
          {filteredItems.length <= 0 ? (
            <div className="text-sm px-2 text-center mt-4">
              {/* Show dynamic "not found" message */}
              {searchQuery
                ? "No items match your search."
                : "No Issued Items Found"}
            </div>
          ) : (
            <div className="overflow-auto mt-4">
              <table className="table">
                {/* head */}
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Student Name</th>
                    <th>Reg. Number</th>
                    <th>Product Name</th>
                    <th>Qty</th>
                    <th>Course</th>
                    <th>Returnable</th>
                    <th>Issue Date</th>
                    <th>Return Date</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {/* Map over the filtered list */}
                  {filteredItems.reverse().map((elem, inx) => {
                    let rowClassName = "hover"; // Default class
                    const isOverdue =
                      elem.isReturnable &&
                      elem.returnDate &&
                      new Date(elem.returnDate) < today;

                    if (isOverdue) {
                      rowClassName = "hover bg-error/20"; // Apply light red background
                    }

                    return (
                      <tr className={rowClassName} key={elem._id}>
                        <th>{inx + 1}</th>
                        <td>{elem.studentName}</td>
                        <td>{elem.registrationNumber}</td>
                        <td>{elem.productName}</td>
                        <td>{elem.quantity}</td>
                        <td>{elem.course}</td>
                        <td>{elem.isReturnable ? "Yes" : "No"}</td>
                        <td>{formatDate(elem.issueDate)}</td>
                        <td>
                          {elem.isReturnable
                            ? formatDate(elem.returnDate)
                            : "N/A"}
                        </td>
                        <td>
                          <button
                            onClick={() => {
                              openDeleteModal(elem._id);
                            }}
                            className="btn btn-sm btn-error ms-2"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {/* table end */}
        </div>

        <div className="drawer-side md:h-[80vh] h-full">
          <label
            htmlFor="sidebar_drawer"
            aria-label="close sidebar"
            className="drawer-overlay"
          ></label>
          <Aside />
        </div>
      </div>
      {/* main end */}

      {/* Delete Confirmation Modal */}
      <dialog id="delete_modal" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Confirm Deletion</h3>
          <p className="py-4">
            Are you sure you want to delete this issued item? This action cannot
            be undone.
          </p>
          <div className="modal-action">
            <div className="flex gap-2">
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setItemToDelete(null);
                  document.getElementById("delete_modal").close();
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-error"
                onClick={handleDeleteConfirm}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={() => setItemToDelete(null)}>close</button>
        </form>
      </dialog>
      <Toaster />
    </div>
  );
};

export default ViewIssuedItems;
