import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ModalDelete from "../../Components/Modal/ModalDelete";
import ModalUpdate from "../../Components/Modal/ModalUpdate";

import { useSelector, useDispatch } from "react-redux";
import {
  Bars3BottomLeftIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import ModalAdd from "../../Components/Modal/ModalAdd";
import baseUrl from "../../utils/baseurl";
import {
  setProducts,
  setSelectedCategory,
} from "../../Redux/products/productSlice";
import Aside from "../../Components/Aside/Aside";

const Dashboard = () => {
  // 1. --- GET ROLE FROM REDUX ---
  // Destructure loginStatus and role from the login slice
  const { loginStatus: isLogin, role } = useSelector((state) => state.login);

  const navigate = useNavigate();

  // 2. --- CHECK IF USER IS STOREKEEPER ---
  const isStoreKeeper = role === "storekeeper";

  const products = useSelector((state) => state.product.products);
  const selectedCategory = useSelector(
    (state) => state.product.selectedCategory
  );
  const [isFetchFinished, setisFetchFinished] = useState(false);
  const dispatch = useDispatch();

  const [searchQuery, setSearchQuery] = useState("");

  const productCategories = [
    "chemical",
    "teaching_kit",
    "plasticware",
    "glassware",
    "miscellaneous",
  ];

  const fetchProductsByCategory = async (category) => {
    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    let requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
      credentials: "include",
    };

    try {
      const response = await fetch(
        `${baseUrl}/products/${category}`,
        requestOptions
      );
      const result = await response.json();
      if (result.status) {
        dispatch(setProducts(result.data));
      } else {
        if (response.status === 401) {
          alert("Your session has expired. Please log in again.");
          navigate("/login");
        } else {
          alert("Something went wrong! try again");
        }
        console.log("Error::Dashboard::result", result.message);
        dispatch(setProducts([]));
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      alert("Could not connect to the server. Please check your connection.");
    } finally {
      setisFetchFinished(true);
    }
  };

  useEffect(() => {
    if (!isLogin) {
      navigate("/login");
    } else {
      setisFetchFinished(false);
      fetchProductsByCategory(selectedCategory);
      setSearchQuery("");
    }
  }, [isLogin, selectedCategory]);

  const showAdd = () => {
    document.getElementById("add_modal").showModal();
  };

  const [updateObj, setupdateObj] = useState({
    pid: "",
    index: "",
    category: "",
    name: "",
    storageTemp: "",
    quantityOrdered: "",
    quantityAvailable: "",
    brand: "",
    lotNo: "",
    dateOfPurchase: "",
    dateOfExpiry: "",
  });

  const showUpdate = (product, index) => {
    setupdateObj({
      pid: product._id,
      index,
      ...product,
    });
    document.getElementById("update_modal").showModal();
  };

  const [pid, setpid] = useState("");
  const showDelete = (id) => {
    setpid(id);
    document.getElementById("delete_modal").showModal();
  };

  const downloadAllProducts = () => {
    const headers = ["Product Name", "Brand Name"];

    const rows = products.map((p) => {
      const name = `"${p.name.replace(/"/g, '""')}"`;
      const brand = `"${p.brand ? p.brand.replace(/"/g, '""') : "N/A"}"`;
      return [name, brand].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const today = new Date().toISOString().slice(0, 10);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `all-products-${selectedCategory}-${today}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadLowStockProducts = () => {
    const lowStockProducts = products.filter((p) => {
      if (p.quantityOrdered <= 0) return false;
      return (p.quantityAvailable / p.quantityOrdered) * 100 < 30;
    });

    if (lowStockProducts.length === 0) {
      alert(`No low-stock products found in this category.`);
      return;
    }

    const headers = ["Product Name", "Brand Name"];

    const rows = lowStockProducts.map((p) => {
      const name = `"${p.name.replace(/"/g, '""')}"`;
      const brand = `"${p.brand ? p.brand.replace(/"/g, '""') : "N/A"}"`;
      return [name, brand].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const today = new Date().toISOString().slice(0, 10);

    link.setAttribute("href", url);
    link.setAttribute("download", `low-stock-${selectedCategory}-${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadExpiredProducts = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiredProducts = products.filter((p) => {
      if (!p.dateOfExpiry) return false;
      return new Date(p.dateOfExpiry) < today;
    });

    if (expiredProducts.length === 0) {
      alert(`No expired products in this category.`);
      return;
    }

    const headers = ["Product Name", "Brand Name", "Expiry Date"];

    const rows = expiredProducts.map((p) => {
      const name = `"${p.name.replace(/"/g, '""')}"`;
      const brand = `"${p.brand ? p.brand.replace(/"/g, '""') : "N/A"}"`;
      const exp = new Date(p.dateOfExpiry).toLocaleDateString();
      return [name, brand, exp].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const todayStr = new Date().toISOString().slice(0, 10);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `expired-products-${selectedCategory}-${todayStr}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- 3. UPDATED TABLE HEADERS TO CHECK ROLE & CATEGORY ---
  const renderTableHeaders = () => {
    switch (selectedCategory) {
      case "chemical":
      case "teaching_kit":
        return (
          <tr>
            <th>S.No</th>
            <th>Name</th>
            {/* --- CHANGED: Only show Storage Temp if category is chemical --- */}
            {selectedCategory === "chemical" && <th>Storage Temp</th>}
            <th>Qty Ordered</th>
            <th>Qty Available</th>
            <th>Brand</th>
            <th>Lot No</th>
            <th>Purchase Date</th>
            <th>Expiry Date</th>
            {isStoreKeeper && <th>Action</th>}
          </tr>
        );
      case "plasticware":
      case "glassware":
      case "miscellaneous":
        return (
          <tr>
            <th>S.No</th>
            <th>Name</th>
            <th>Qty Ordered</th>
            <th>Qty Available</th>
            <th>Brand</th>
            <th>Lot No</th>
            <th>Purchase Date</th>
            {isStoreKeeper && <th>Action</th>}
          </tr>
        );
      default:
        return (
          <tr>
            <th>S.No</th>
            <th>Name</th>
            {isStoreKeeper && <th>Action</th>}
          </tr>
        );
    }
  };

  // --- 4. HELPER TO RENDER ACTION BUTTONS ---
  const renderActionButtons = (elem, i) => (
    <td className="flex">
      <button
        className="btn btn-primary btn-sm text-white"
        onClick={() => showUpdate(elem, i)}
      >
        Update
      </button>
      <button
        className="btn btn-error btn-sm mx-2"
        onClick={() => showDelete(elem._id)}
      >
        Delete
      </button>
    </td>
  );

  const renderTableRow = (elem, i) => {
    const stockPercentage =
      elem.quantityOrdered > 0
        ? (elem.quantityAvailable / elem.quantityOrdered) * 100
        : 100;
    const lowStockIndicator =
      stockPercentage < 30 ? (
        <span className="w-3 h-3 bg-red-600 rounded-full shadow-lg shadow-green-400/50 mr-2 animate-pulse"></span>
      ) : null;
    let rowClassName = "hover";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (elem.dateOfExpiry && new Date(elem.dateOfExpiry) < today) {
      rowClassName += " text-error";
    }
    const commonFields = (
      <>
        <td>{elem.name}</td>
        <td>{elem.quantityOrdered}</td>
        <td>{elem.quantityAvailable}</td>
        <td>{elem.brand}</td>
        <td>{elem.lotNo}</td>
        <td>{new Date(elem.dateOfPurchase).toLocaleDateString()}</td>
      </>
    );

    // --- 5. UPDATED TABLE ROWS TO CHECK ROLE & CATEGORY ---
    switch (elem.category) {
      case "chemical":
      case "teaching_kit":
        return (
          <tr className={rowClassName} key={elem._id}>
            <th>
              <div className="flex items-center">
                {lowStockIndicator}
                {i + 1}
              </div>
            </th>
            <td>{elem.name}</td>
            {/* --- CHANGED: Only render Storage Temp cell if category is chemical --- */}
            {elem.category === "chemical" && <td>{elem.storageTemp}</td>}
            <td>{elem.quantityOrdered}</td>
            <td>{elem.quantityAvailable}</td>
            <td>{elem.brand}</td>
            <td>{elem.lotNo}</td>
            <td>{new Date(elem.dateOfPurchase).toLocaleDateString()}</td>
            <td>
              {elem.dateOfExpiry
                ? new Date(elem.dateOfExpiry).toLocaleDateString()
                : "N/A"}
            </td>
            {isStoreKeeper && renderActionButtons(elem, i)}
          </tr>
        );
      case "plasticware":
      case "glassware":
      case "miscellaneous":
        return (
          <tr className={rowClassName} key={elem._id}>
            <th>
              <div className="flex items-center">
                {lowStockIndicator}
                {i + 1}
              </div>
            </th>
            {commonFields}
            {isStoreKeeper && renderActionButtons(elem, i)}
          </tr>
        );
      default:
        return (
          <tr className="hover" key={elem._id}>
            <th>{i + 1}</th>
            <td>{elem.name}</td>
            {isStoreKeeper && renderActionButtons(elem, i)}
          </tr>
        );
    }
  };

  const filteredProducts = products.filter((product) => {
    const query = searchQuery.toLowerCase();
    const productName = product.name ? product.name.toLowerCase() : "";
    const brandName = product.brand ? product.brand.toLowerCase() : "";

    return productName.includes(query) || brandName.includes(query);
  });

  const formatCategory = (text) => {
    return text
      .replace("_", " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    isLogin && (
      <div className="md:w-[80%] md:mx-auto">
        <div className="drawer lg:drawer-open">
          <input
            id="sidebar_drawer"
            type="checkbox"
            className="drawer-toggle"
          />
          <div className="drawer-content px-4">
            <div className="flex items-center justify-between ">
              <label
                htmlFor="sidebar_drawer"
                className="drawer-button lg:hidden"
              >
                <Bars3BottomLeftIcon className="w-6 h-6" />
              </label>
              <h2 className="text-xl capitalize">
                {formatCategory(selectedCategory)} Products
              </h2>

              <div className="hidden md:flex items-center w-1/2">
                <input
                  type="text"
                  placeholder={`Search ${selectedCategory.replace(
                    "_",
                    " "
                  )} by name or brand`}
                  className="input input-bordered rounded-full h-10 lg:w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <span className="p-2 bg-blue-500 text-white rounded-md ms-2">
                  <MagnifyingGlassIcon className="w-6 h-6" />
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <div className="dropdown dropdown-end">
                  <label
                    tabIndex={0}
                    className="btn btn-secondary btn-sm text-white"
                  >
                    <ArrowDownTrayIcon className="w-5 h-5" />
                    Report
                  </label>

                  <ul
                    tabIndex={0}
                    className="dropdown-content z-50  menu p-2 shadow bg-gray-900 dark:bg-gray-900 
             text-white rounded-box w-52 !bg-opacity-100 backdrop-blur-none 
             glass-none"
                  >
                    <li>
                      <button onClick={downloadAllProducts}>
                        All Products
                      </button>
                    </li>
                    <li>
                      <button onClick={downloadLowStockProducts}>
                        Low Stock{" "}
                      </button>
                    </li>
                    <li>
                      <button onClick={downloadExpiredProducts}>
                        Expired Products
                      </button>
                    </li>
                  </ul>
                </div>

                {/* --- 6. HIDE ADD BUTTON IF NOT STOREKEEPER --- */}
                {isStoreKeeper && (
                  <button
                    onClick={showAdd}
                    className="btn btn-primary btn-sm text-white"
                  >
                    <PlusCircleIcon className="w-5 h-5" />
                    Add Product
                  </button>
                )}
              </div>
            </div>

            <div role="tablist" className="tabs tabs-boxed my-4">
              {productCategories.map((category) => (
                <a
                  key={category}
                  role="tab"
                  className={`tab ${
                    selectedCategory === category ? "tab-active" : ""
                  }`}
                  onClick={() => dispatch(setSelectedCategory(category))}
                >
                  {formatCategory(category)}
                </a>
              ))}
            </div>

            <div className="overflow-auto max-h-[80vh]">
              <table className="table table-zebra w-full">
                <thead>{renderTableHeaders()}</thead>
                <tbody>
                  {filteredProducts &&
                    filteredProducts.length > 0 &&
                    [...filteredProducts]
                      .reverse()
                      .map((elem, i) => renderTableRow(elem, i))}
                </tbody>
              </table>
            </div>

            {isFetchFinished && filteredProducts.length <= 0 && (
              <div className="text-sm px-2 text-center mt-4">
                {products.length > 0 ? (
                  `No products match your search for "${searchQuery}".`
                ) : (
                  <>
                    No Items Found in {formatCategory(selectedCategory)}!
                    <br />
                    Click on plus to Get Started!
                  </>
                )}
              </div>
            )}
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

        <ModalAdd
          id="add_modal"
          title="Add Product"
          fetchProductsByCategory={fetchProductsByCategory}
          selectedCategory={selectedCategory}
        />
        <ModalDelete
          id="delete_modal"
          pid={pid}
          title="Are u sure to delete?"
          fetchProductsByCategory={fetchProductsByCategory}
          selectedCategory={selectedCategory}
        />
        <ModalUpdate
          id="update_modal"
          title="Update Details"
          updateObj={updateObj}
          fetchProductsByCategory={fetchProductsByCategory}
          selectedCategory={selectedCategory}
        />
      </div>
    )
  );
};

export default Dashboard;
