import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Bars3BottomLeftIcon } from "@heroicons/react/24/outline";
import Aside from "../../Components/Aside/Aside";
import { useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import baseUrl from "../../utils/baseurl";
import { setProducts, setLastUpdated } from "../../Redux/products/productSlice";
import { setIssuedItems } from "../../Redux/issue/issueSlice";

const IssueProduct = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  //check Islogin
  const isLogin = useSelector((state) => state.login.loginStatus);
  
  // State for the dropdown list
  const [allProducts, setAllProducts] = useState([]);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const [selectedProduct, setSelectedProduct] = useState({
    productId: "",
    productName: "",
    quantity: 1,
    availableStock: 0,
    category: "",
    isAvailableAfterIssue: "yes" // Default for chemicals
  });

  const [isReturnable, setIsReturnable] = useState(false);
  const [issueDate, setIssueDate] = useState("");
  const [expectedReturnDate, setExpectedReturnDate] = useState("");

  // Fetch all products for the dropdown on component mount
  useEffect(() => {
    if (!isLogin) {
      navigate("/login");
      return;
    }

    const fetchAllProducts = async () => {
      try {
        const response = await fetch(`${baseUrl}/products/all/list`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        const result = await response.json();
        if (result.status) {
          // Filter out products with 0 stock OR "no" for chemicals
          setAllProducts(result.data.filter(p => {
            if (p.category === "chemical") {
              // Handle both: new "no" string AND old 0 number
              return p.quantityAvailable !== "no" && p.quantityAvailable !== 0 && p.quantityAvailable !== "0";
            }
            // For others, ensure it's a number > 0
            return Number(p.quantityAvailable) > 0;
          }));
        }
      } catch (error) {
        toast.error("Failed to load products list");
      }
    };
    fetchAllProducts();
  }, [isLogin, navigate]);

  const handleProductSelect = (e) => {
    const selectedId = e.target.value;
    const product = allProducts.find(p => p._id === selectedId);
    
    if (product) {
      setSelectedProduct({
        productId: product._id,
        productName: product.name,
        quantity: 1,
        availableStock: product.quantityAvailable,
        category: product.category,
        isAvailableAfterIssue: "yes"
      });
    } else {
      setSelectedProduct({ productId: "", productName: "", quantity: 1, availableStock: 0, category: "", isAvailableAfterIssue: "yes" });
    }
  };

  const handleQuantityChange = (e) => {
    const val = e.target.value;
    if (selectedProduct.category === "chemical") {
      setSelectedProduct((prev) => ({ ...prev, isAvailableAfterIssue: val }));
    } else {
      setSelectedProduct((prev) => ({ ...prev, quantity: val }));
    }
  };

  const resetAllFields = () => {
    reset();
    setSelectedProduct({ productId: "", productName: "", quantity: 1, availableStock: 0, category: "", isAvailableAfterIssue: "yes" });
    setIsReturnable(false);
    setIssueDate("");
    setExpectedReturnDate("");
  };

  const onSubmit = async (data) => {
    if (!selectedProduct.productId) {
      return toast.error("Please select a product");
    }

    if (selectedProduct.category !== "chemical") {
      const numQty = Number(selectedProduct.quantity);
      if (numQty < 1) {
        return toast.error("Quantity must be at least 1");
      }
      if (numQty > Number(selectedProduct.availableStock)) {
        return toast.error(`Only ${selectedProduct.availableStock} items available in stock!`);
      }
    }

    if (isReturnable && !expectedReturnDate) {
      return toast.error("Please provide an expected return date");
    }

    const payload = {
      productId: selectedProduct.productId,
      productName: selectedProduct.productName,
      quantity: selectedProduct.category === "chemical" ? 1 : Number(selectedProduct.quantity),
      studentName: data.studentName,
      registrationNumber: data.registrationNumber,
      course: data.course,
      isReturnable,
      ...(issueDate && { issueDate }),
      ...(isReturnable && expectedReturnDate && { expectedReturnDate }),
      ...(selectedProduct.category === "chemical" && { isAvailableAfterIssue: selectedProduct.isAvailableAfterIssue })
    };

    try {
      const response = await fetch(`${baseUrl}/createissue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      const result = await response.json();
      
      if (result.status) {
        toast.success("Item issued & stock updated");
        dispatch(setProducts([])); // Force dashboard refresh
        dispatch(setIssuedItems([])); // Force lists refresh
        dispatch(setLastUpdated(new Date().toISOString()));

        resetAllFields();
        navigate("/view-issued");
      } else {
        toast.error(result.message || "Failed to issue item");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    }
  };

  return (
    <div className="md:w-[90%] mt-3 md:mx-auto">
      <div className="drawer lg:drawer-open">
        <input id="sidebar_drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content px-4">
          <div className="flex items-center justify-between my-4">
            <label htmlFor="sidebar_drawer" className="drawer-button lg:hidden">
              <Bars3BottomLeftIcon className="w-6 h-6" />
            </label>
            <h2 className="text-xl w-full text-center">Issue New Item</h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <h4 className="text-xl capitalize font-bold border-b-2 pb-2">Details</h4>
            <div className="flex flex-wrap gap-4">
              <label className="form-control flex-1 min-w-[250px]">
                <div className="label"><span className="label-text">Name</span></div>
                <input type="text" {...register("studentName", { required: "Name required" })} className="input input-bordered w-full" />
                <span className="text-xs text-error mt-1">{errors.studentName?.message}</span>
              </label>

              <label className="form-control flex-1 min-w-[250px]">
                <div className="label"><span className="label-text">Registration Number</span></div>
                <input type="text" {...register("registrationNumber", { required: "Reg No required" })} className="input input-bordered w-full" />
                <span className="text-xs text-error mt-1">{errors.registrationNumber?.message}</span>
              </label>

              <label className="form-control flex-1 min-w-[250px]">
                <div className="label"><span className="label-text">Course</span></div>
                <input type="text" {...register("course", { required: "Course required" })} className="input input-bordered w-full" />
                <span className="text-xs text-error mt-1">{errors.course?.message}</span>
              </label>
            </div>

            <h4 className="text-xl capitalize font-bold border-b-2 pb-2">Item Details</h4>
            <div className="flex flex-wrap gap-4 items-end">
              
              {/* --- NEW DROPDOWN COMPONENT --- */}
              <label className="form-control flex-[2] min-w-[300px]">
                <div className="label"><span className="label-text">Select Product</span></div>
                <select 
                  className="select select-bordered w-full"
                  value={selectedProduct.productId}
                  onChange={handleProductSelect}
                >
                  <option value="" disabled>-- Choose Available Product --</option>
                  {allProducts.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} - {p.brand ? `(${p.brand})` : ''} [In Stock: {p.quantityAvailable}]
                    </option>
                  ))}
                </select>
              </label>

              <label className="form-control flex-[1] min-w-[150px]">
                <div className="label">
                  <span className="label-text">
                    {selectedProduct.category === "chemical" ? "Is Still Available?" : "Quantity"}
                  </span>
                </div>
                {selectedProduct.category === "chemical" ? (
                  <select
                    className="select select-bordered w-full font-bold text-primary"
                    value={selectedProduct.isAvailableAfterIssue}
                    onChange={handleQuantityChange}
                  >
                    <option value="yes">YES (Still Present)</option>
                    <option value="no">NO (Empty/Gone)</option>
                  </select>
                ) : (
                  <input
                    type="number"
                    min="1"
                    max={selectedProduct.availableStock || 1}
                    value={selectedProduct.quantity}
                    onChange={handleQuantityChange}
                    disabled={!selectedProduct.productId}
                    className="input input-bordered w-full"
                  />
                )}
              </label>
            </div>

            <h4 className="text-xl capitalize font-bold border-b-2 pb-2">Issue Parameters</h4>
            <div className="flex flex-wrap gap-4 items-center">
              <label className="form-control w-full max-w-xs cursor-pointer flex-row items-center gap-3">
                <input type="checkbox" checked={isReturnable} onChange={(e) => setIsReturnable(e.target.checked)} className="checkbox checkbox-primary" />
                <span className="label-text font-medium">Is this item returnable?</span>
              </label>

              <label className="form-control flex-1 min-w-[200px]">
                <div className="label"><span className="label-text">Issue Date</span></div>
                <input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} className="input input-bordered w-full" />
              </label>

              {isReturnable && (
                <label className="form-control flex-1 min-w-[200px]">
                  <div className="label"><span className="label-text">Expected Return Date</span></div>
                  <input type="date" value={expectedReturnDate} onChange={(e) => setExpectedReturnDate(e.target.value)} className="input input-bordered w-full" />
                </label>
              )}
            </div>

            <div className="text-center pt-6">
              <button type="submit" className="btn btn-primary btn-wide text-white" disabled={!selectedProduct.productId}>
                Confirm Issue
              </button>
            </div>
          </form>
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

export default IssueProduct;