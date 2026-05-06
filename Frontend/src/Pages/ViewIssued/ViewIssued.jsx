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
import { setIssuedItems } from "../../Redux/issue/issueSlice";
import { setProducts, setLastUpdated } from "../../Redux/products/productSlice";

const ViewIssuedItems = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loginStatus: isLogin, role } = useSelector((state) => state.login);
  const issuedItemsList = useSelector((state) => state.issue.issuedItems);

  // Modal States
  const [itemToDelete, setItemToDelete] = useState(null);
  const [itemToReturn, setItemToReturn] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const getIssuedItems = async () => {
    try {
      const response = await fetch(`${baseUrl}/getissue`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) navigate("/login");
        return toast.error("Failed to fetch items");
      }

      const result = await response.json();
      if (result.status) {
        dispatch(setIssuedItems(result.data));
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  useEffect(() => {
    if (!isLogin) {
      navigate("/login");
    } else if (role === "faculty") {
      toast.error("Unauthorized");
      navigate("/");
     } else if (issuedItemsList.length <= 0) {
      getIssuedItems();
    }
  }, [isLogin, role, issuedItemsList.length, navigate, dispatch]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  // --- DELETE LOGIC ---
  const openDeleteModal = (issueId) => {
    setItemToDelete(issueId);
    document.getElementById("delete_modal").showModal();
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    try {
      const response = await fetch(`${baseUrl}/deleteissue`, {
        method: "POST",
        body: JSON.stringify({ issueId: itemToDelete }),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const result = await response.json();

      if (result.status) {
        toast.success("Item deleted successfully");
        getIssuedItems();
        dispatch(setLastUpdated(new Date().toISOString()));
      } else {
        toast.error(result.message || "Something went wrong!");
      }
    } catch (error) {
      toast.error("An error occurred during deletion");
    } finally {
      setItemToDelete(null);
      document.getElementById("delete_modal").close();
    }
  };

  // --- RETURN LOGIC ---
  const openReturnModal = (issueId) => {
    setItemToReturn(issueId);
    document.getElementById("return_modal").showModal();
  };

  const handleReturnConfirm = async () => {
    if (!itemToReturn) return;
    try {
      const response = await fetch(`${baseUrl}/returnissue`, {
        method: "POST",
        body: JSON.stringify({ issueId: itemToReturn }),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const result = await response.json();

      if (result.status) {
        toast.success("Item returned & stock updated!");
        getIssuedItems(); 
        dispatch(setProducts([])); // Clear product cache so dashboard fetches fresh stock
        dispatch(setLastUpdated(new Date().toISOString()));
      } else {
        toast.error(result.message || "Failed to return item");
      }
    } catch (error) {
      toast.error("An error occurred during return");
    } finally {
      setItemToReturn(null);
      document.getElementById("return_modal").close();
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filteredItems = issuedItemsList.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.studentName.toLowerCase().includes(query) ||
      item.productName.toLowerCase().includes(query)
    );
  });

  return (
    <div className="md:w-[90%] md:mx-auto">
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
            <div className="overflow-auto mt-4 pb-20">
              <table className="table">
                {/* head */}
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Student Name</th>
                    <th>Reg. No</th>
                    <th>Product Name</th>
                    <th>Qty</th>
                    <th>Course</th>
                    <th>Status</th>
                    <th>Issue Date</th>
                    <th>Return Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.slice().reverse().map((elem, inx) => {
                    let rowClassName = "hover";
                    
                    // Highlight red if overdue AND not yet returned
                    const isOverdue = elem.isReturnable && !elem.isReturned && elem.returnDate && new Date(elem.returnDate) < today;
                    
                    // Highlight green if returned successfully
                    if (elem.isReturned) rowClassName = "hover bg-success/10";
                    else if (isOverdue) rowClassName = "hover bg-error/20";

                    return (
                      <tr className={rowClassName} key={elem._id}>
                        <th>{inx + 1}</th>
                        <td>{elem.studentName}</td>
                        <td>{elem.registrationNumber}</td>
                        <td>{elem.productName}</td>
                        <td>{elem.quantity}</td>
                        <td>{elem.course}</td>
                        <td>
                          {!elem.isReturnable ? (
                            <span className="badge badge-ghost badge-sm p-4">Non-Returnable</span>
                          ) : elem.isReturned ? (
                            <span className="badge badge-success badge-sm text-white p-4">Returned<br/> {formatDate(elem.actualReturnDate)}</span>
                          ) : (
                            <span className={`badge badge-sm text-white p-4 ${isOverdue ? 'badge-error' : 'badge-warning'}`}>
                              Pending
                            </span>
                          )}
                        </td>
                        <td>{formatDate(elem.issueDate)}</td>
                        <td>{elem.isReturnable ? formatDate(elem.returnDate) : "N/A"}</td>
                        <td>
                          <div className="flex gap-2">
                            {elem.isReturnable && !elem.isReturned && (
                              <button
                                onClick={() => openReturnModal(elem._id)}
                                className="btn btn-sm btn-success text-white"
                              >
                                Return
                              </button>
                            )}
                            <button
                              onClick={() => openDeleteModal(elem._id)}
                              className="btn btn-sm btn-error text-white"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="drawer-side md:h-[88vh]">
          <label htmlFor="sidebar_drawer" aria-label="close sidebar" className="drawer-overlay"></label>
          <Aside />
        </div>
      </div>

      {/* --- RETURN CONFIRMATION MODAL --- */}
      <dialog id="return_modal" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg text-success">Confirm Return</h3>
          <p className="py-4">
            Are you sure this item has been returned? Confirming will restore the quantity back to the main inventory.
          </p>
          <div className="modal-action">
            <div className="flex gap-2">
              <button className="btn btn-ghost" onClick={() => document.getElementById("return_modal").close()}>Cancel</button>
              <button type="button" className="btn btn-success text-white" onClick={handleReturnConfirm}>Confirm Return</button>
            </div>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={() => setItemToReturn(null)}>close</button>
        </form>
      </dialog>

      {/* --- DELETE CONFIRMATION MODAL --- */}
      <dialog id="delete_modal" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg text-error">Confirm Deletion</h3>
          <p className="py-4">
            Are you sure you want to delete this issued item record? This action cannot be undone. 
            <br/><span className="text-sm font-semibold text-warning mt-2 block">Note: Deleting a record will NOT restore inventory stock. Use "Return" if the item was brought back.</span>
          </p>
          <div className="modal-action">
            <div className="flex gap-2">
              <button className="btn btn-ghost" onClick={() => document.getElementById("delete_modal").close()}>Cancel</button>
              <button type="button" className="btn btn-error text-white" onClick={handleDeleteConfirm}>Delete Record</button>
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