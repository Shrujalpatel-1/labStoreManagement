import {
  ArchiveBoxIcon,
  ArrowLeftEndOnRectangleIcon,
  ChartBarIcon,
  PlusCircleIcon,
  UserCircleIcon,
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

  const productCategories = [
    "chemical",
    "teaching_kit",
    "plasticware",
    "glassware",
    "miscellaneous",
  ];

  const showAdd = () => {
    document.getElementById("add_modal").showModal();
  };

  const logoutUser = async () => {
    if (window.confirm("Are you sure to logout?")) {
      // ... headers setup ...

      try {
        const response = await fetch(`${baseUrl}/logout`, requestOptions);
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
    <ul className="menu bg-base-200 text-base-content min-h-full w-72 p-4">
      <div className="text-xl pb-2 border-b-2 border-primary">
        Product Categories
      </div>
      {/* Category Links (Visible to everyone) */}
      {productCategories.map((category) => (
        <li key={category} className="mt-2">
          <Link
            to={"/"}
            className={selectedCategory === category ? "active" : ""}
            onClick={() => dispatch(setSelectedCategory(category))}
          >
            <ArchiveBoxIcon className="h-6 w-6" />
            {formatCategory(category)}
          </Link>
        </li>
      ))}

      {/* --- 3. ADD PRODUCT BTN: Visible only on Home Page AND if Storekeeper --- */}
      {location.pathname === "/" && isStoreKeeper && (
        <li className="mt-2">
          <button onClick={showAdd}>
            <PlusCircleIcon className="h-6 w-6" />
            Add Product
          </button>
        </li>
      )}

      {/* --- 4. ISSUED PRODUCTS SECTION: Visible only if Storekeeper --- */}
      {isStoreKeeper && (
        <>
          <div className="text-xl pb-2 border-b-2 border-primary mt-4">
            Issued Products
          </div>
          <li className="mt-2">
            <Link to={"/issue-product"}>
              <PlusCircleIcon className="h-6 w-6" />
              Issue the Product
            </Link>
          </li>
          <li className="mb-4 mt-2">
            <Link to={"/view-issued"}>
              <ChartBarIcon className="h-6 w-6" />
              List
            </Link>
          </li>
        </>
      )}

      <div className="text-xl pb-2 border-b-2 border-primary mt-4">
        Manage Account
      </div>
      <li className="mt-2">
        <Link to={"/profile"}>
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
