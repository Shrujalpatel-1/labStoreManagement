import {
  ArchiveBoxIcon,
  ArrowLeftEndOnRectangleIcon,
  ChartBarIcon,
  ClockIcon,
  PlusCircleIcon,
  UserCircleIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import baseUrl from "../../utils/baseurl";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedCategory } from "../../Redux/products/productSlice";
import { logout } from "../../Redux/login/isLogin";

const Aside = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // --- 1. GET ROLE FROM REDUX ---
  const { role } = useSelector((state) => state.login);
  const selectedCategory = useSelector(
    (state) => state.product.selectedCategory
  );

  // --- 2. CHECK PERMISSION ---
  const isStoreKeeper = role === "storekeeper";
  const isLabOC = role === "lab_oc" || role === "hod" || role === "lab_coordinator";

  const productCategories = [
    "chemical",
    "teaching_kit",
    "plasticware",
    "glassware",
    "miscellaneous",
  ];

  const isActivePath = (path) => {
    return location.pathname === path ? "active" : "";
  };

  // Checks if we are on the Home dashboard AND the category matches Redux
  const isCategoryActive = (category) => {
    return location.pathname === "/" && selectedCategory === category ? "active" : "";
  };

  const showAdd = () => {
    document.getElementById("add_modal").showModal();
  };

  const logoutUser = async () => {
    try {
      const response = await fetch(`${baseUrl}/logout`, {
        method: "GET", 
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Ensures cookies are sent/cleared if your backend uses them
      });
      const result = await response.json();

      if (result.status) {
        console.log("Logout Success");

        // The logout reducer in isLogin.js already handles localStorage removal,
        // but strictly calling it here ensures safety:
        localStorage.removeItem("mnnit_auth_data");

        dispatch(logout());
        navigate("/login");
      } else {
        alert("Something went wrong! try again");
      }
    } catch (error) {
      console.error("Logout failed:", error);
      // Force logout on error
      localStorage.removeItem("mnnit_auth_data");
      dispatch(logout());
      navigate("/login");
    }
  };
  const formatCategory = (text) => {
    return text
      .replace("_", " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };
  return (
    <ul className="menu bg-base-200 text-base-content w-72 p-4 lg:sticky top-0 rounded-md shadow-md">
      <div className="text-xl pb-2 border-b-2 border-primary">
        Product Categories
      </div>
      {/* Category Links (Visible to everyone) */}
      {productCategories.map((category) => (
        <li key={category} className="mt-2">
          <Link
            to={"/"}
            className={isCategoryActive(category)}
            onClick={() => dispatch(setSelectedCategory(category))}
          >
            <ArchiveBoxIcon className="h-6 w-6" />
            {formatCategory(category)}
          </Link>
        </li>
      ))}
      <li className="mt-2">
        <Link to={"/activity-log"} className={isActivePath("/activity-log")}>
          <ClockIcon className="h-6 w-6" />
          Activity Log
        </Link>
      </li>

      {/* --- ADD PRODUCT BTN: Visible only on Home Page AND if Storekeeper --- */}

      {isStoreKeeper && (
        <>
          <div className="text-xl pb-2 border-b-2 border-primary mt-4">
            Issued Products
          </div>
          <li className="mt-2">
            <Link to={"/issue-product"} className={isActivePath("/issue-product")}>
              <PlusCircleIcon className="h-6 w-6" />
              Issue the Product
            </Link>
          </li>
          <li className="mb-4 mt-2">
            <Link to={"/view-issued"} className={isActivePath("/view-issued")}>
              <ChartBarIcon className="h-6 w-6" />
              List
            </Link>
          </li>
        </>
      )}

      {/* --- ADMINISTRATION SECTION: Visible only if Lab OC or HOD --- */}
      {isLabOC && (
        <>
          <div className="text-xl pb-2 border-b-2 border-primary mt-4">
            Administration
          </div>
          <li className="mt-2 mb-4">
            <Link to={"/users"} className={isActivePath("/users")}> {/* <-- Standardized active check */}
              <UsersIcon className="h-6 w-6" />
              User Management
            </Link>
          </li>
        </>
      )}

      <div className="text-xl pb-2 border-b-2 border-primary mt-4">
        Manage Account
      </div>
      <li className="mt-2">
        <Link to={"/profile"} className={isActivePath("/profile")}> {/* <-- Added active check */}
          <UserCircleIcon className="h-6 w-6" />
          Profile
        </Link>
      </li>
      <li className="mb-4 mt-2">
        <button onClick={logoutUser}>
          <ArrowLeftEndOnRectangleIcon className="h-6 w-6" />
          Logout
        </button>
      </li>
    </ul>
  );
};

export default Aside;
