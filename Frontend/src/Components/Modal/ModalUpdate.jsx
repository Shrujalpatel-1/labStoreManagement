import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import baseUrl from "../../utils/baseurl";

const ModalUpdate = (props) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({});

  // --- Strict validation ONLY for required fields (Name) ---
  const validateRequired = (value, fieldName) => {
    if (!String(value).trim()) {
      return `${fieldName} is required`;
    }
  };

  // --- Quantity is optional, but if entered, must not be negative ---
  const validateQuantity = (value, fieldName) => {
    // If empty, return true (valid)
    if (!value || String(value).trim() === "") return true;

    // If value exists, check if negative
    if (Number(value) < 0) {
      return `${fieldName} cannot be negative`;
    }
    return true;
  };

  const onSubmit = async (data) => {
    // 1. Create a copy of the data
    const cleanData = { ...data };

    // 2. CLEANUP: If Date of Purchase is empty, delete the key entirely
    if (!cleanData.dateOfPurchase || cleanData.dateOfPurchase.trim() === "") {
      delete cleanData.dateOfPurchase;
    }

    // 3. CLEANUP: If Date of Expiry is empty, delete the key entirely
    if (!cleanData.dateOfExpiry || cleanData.dateOfExpiry.trim() === "") {
      delete cleanData.dateOfExpiry;
    }

    // 4. CLEANUP: If Quantity/Storage are empty, delete them
    if (!cleanData.quantityOrdered) delete cleanData.quantityOrdered;
    if (!cleanData.quantityAvailable) delete cleanData.quantityAvailable;
    if (!cleanData.storageTemp) delete cleanData.storageTemp;

    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    let requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify({
        productId: props.updateObj.pid,
        newdata: cleanData, // Send the cleaned data
      }),
      redirect: "follow",
      credentials: "include",
    };

    try {
      const response = await fetch(
        `${baseUrl}/products/update`,
        requestOptions
      );
      const result = await response.json();
      if (result.status) {
        toast.success("Product updated successfully");
        props.fetchProductsByCategory(props.selectedCategory);
      } else {
        toast.error(result.message || "Something went wrong! try again");
        console.log("Error::Modal Update::result", result.message);
      }
    } catch (error) {
      toast.error("Something went wrong! try again");
      console.log("Error::Modal Update::", error);
    } finally {
      document.getElementById(props.id).close();
    }
  };

  const closeForm = (e) => {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById(props.id).close();
  };

  useEffect(() => {
    // Set default values when updateObj changes
    reset({
      name: props.updateObj.name,
      storageTemp: props.updateObj.storageTemp,
      quantityOrdered: props.updateObj.quantityOrdered,
      quantityAvailable: props.updateObj.quantityAvailable,
      brand: props.updateObj.brand,
      lotNo: props.updateObj.lotNo,
      // Format dates for input type="date"
      dateOfPurchase: props.updateObj.dateOfPurchase
        ? new Date(props.updateObj.dateOfPurchase).toISOString().split("T")[0]
        : "",
      dateOfExpiry: props.updateObj.dateOfExpiry
        ? new Date(props.updateObj.dateOfExpiry).toISOString().split("T")[0]
        : "",
    });
  }, [props.updateObj, reset]);

  const renderCategorySpecificFields = () => {
    switch (props.updateObj.category) {
      case "chemical":
      case "teaching_kit":
        return (
          <>
            {/* --- Only show Storage Temp if category is 'chemical' --- */}
            {props.updateObj.category === "chemical" && (
              <label className="form-control w-full lg:max-w-xs px-2">
                <div className="label">
                  <span className="label-text">Storage Temperature</span>
                </div>
                <input
                  type="text"
                  {...register("storageTemp")}
                  name="storageTemp"
                  placeholder="e.g., 2-8°C"
                  className="input input-bordered w-full lg:max-w-xs"
                />
              </label>
            )}

            <label className="form-control w-full lg:max-w-xs px-2">
              <div className="label">
                <span className="label-text">Brand</span>
              </div>
              <input
                type="text"
                {...register("brand")}
                name="brand"
                placeholder="Type here"
                className="input input-bordered w-full lg:max-w-xs"
              />
            </label>

            <label className="form-control w-full lg:max-w-xs px-2">
              <div className="label">
                <span className="label-text">Lot Number</span>
              </div>
              <input
                type="text"
                {...register("lotNo")}
                name="lotNo"
                placeholder="Type here"
                className="input input-bordered w-full lg:max-w-xs"
              />
            </label>

            <label className="form-control w-full lg:max-w-xs px-2">
              <div className="label">
                <span className="label-text">Date of Purchase</span>
              </div>
              <input
                type="date"
                {...register("dateOfPurchase")}
                name="dateOfPurchase"
                className="input input-bordered w-full lg:max-w-xs"
              />
            </label>

            {/* --- CHANGED: Date of Expiry is now COMPLETELY OPTIONAL --- */}
            <label className="form-control w-full lg:max-w-xs px-2">
              <div className="label">
                <span className="label-text">Date of Expiry</span>
              </div>
              <input
                type="date"
                {...register("dateOfExpiry")} // Removed 'validate' property
                name="dateOfExpiry"
                className="input input-bordered w-full lg:max-w-xs"
              />
            </label>
            {/* Error message removed since it's optional */}
          </>
        );
      case "plasticware":
      case "glassware":
      case "miscellaneous":
        return (
          <>
            <label className="form-control w-full lg:max-w-xs px-2">
              <div className="label">
                <span className="label-text">Brand</span>
              </div>
              <input
                type="text"
                {...register("brand")}
                name="brand"
                placeholder="Type here"
                className="input input-bordered w-full lg:max-w-xs"
              />
            </label>

            <label className="form-control w-full lg:max-w-xs px-2">
              <div className="label">
                <span className="label-text">Lot Number</span>
              </div>
              <input
                type="text"
                {...register("lotNo")}
                name="lotNo"
                placeholder="Type here"
                className="input input-bordered w-full lg:max-w-xs"
              />
            </label>

            <label className="form-control w-full lg:max-w-xs px-2">
              <div className="label">
                <span className="label-text">Date of Purchase</span>
              </div>
              <input
                type="date"
                {...register("dateOfPurchase")}
                name="dateOfPurchase"
                className="input input-bordered w-full lg:max-w-xs"
              />
            </label>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <dialog id={props.id} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">
            Update {props.updateObj.category.replace("_", " ")} Details
          </h3>
          <p className="py-4">Product ID: {props.updateObj.pid}</p>
          <form method="dialog" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="form-control w-full lg:max-w-xs px-2">
                <div className="label">
                  <span className="label-text">Product No</span>
                </div>
                <input
                  type="text"
                  placeholder="Type here"
                  className="input input-bordered w-full lg:max-w-xs"
                  disabled
                  value={props.updateObj.index + 1}
                />
              </label>

              {/* Product Name - Still Required */}
              <label className="form-control w-full lg:max-w-xs px-2">
                <div className="label">
                  <span className="label-text">Product Name *</span>
                </div>
                <input
                  type="text"
                  {...register("name", {
                    validate: (v) => validateRequired(v, "Product Name"),
                  })}
                  name="name"
                  placeholder="Type here"
                  className="input input-bordered w-full lg:max-w-xs"
                />
              </label>
              {errors.name && (
                <p className="text-xs text-red-600 ps-2 mt-1">
                  {errors.name.message}
                </p>
              )}

              {/* Optional Quantity */}
              <label className="form-control w-full lg:max-w-xs px-2">
                <div className="label">
                  <span className="label-text">Quantity Ordered</span>
                </div>
                <input
                  type="text"
                  {...register("quantityOrdered", {
                    validate: (v) => validateQuantity(v, "Quantity Ordered"),
                  })}
                  min={0}
                  name="quantityOrdered"
                  placeholder="Type here"
                  className="input input-bordered w-full lg:max-w-xs"
                />
              </label>
              {errors.quantityOrdered && (
                <p className="text-xs text-red-600 ps-2 mt-1">
                  {errors.quantityOrdered.message}
                </p>
              )}

              {/* Optional Quantity */}
              <label className="form-control w-full lg:max-w-xs px-2">
                <div className="label">
                  <span className="label-text">Quantity Available</span>
                </div>
                <input
                  type="text"
                  {...register("quantityAvailable", {
                    validate: (v) => validateQuantity(v, "Quantity Available"),
                  })}
                  min={0}
                  name="quantityAvailable"
                  placeholder="Type here"
                  className="input input-bordered w-full lg:max-w-xs "
                />
              </label>
              {errors.quantityAvailable && (
                <p className="text-xs text-red-600 ps-2 mt-1">
                  {errors.quantityAvailable.message}
                </p>
              )}

              {renderCategorySpecificFields()}
            </div>
            <div className="modal-action">
              <div>
                <button className="btn mx-2 px-6 btn-sm btn-primary text-white">
                  Update
                </button>
                <button className="btn mx-2 px-6 btn-sm" onClick={closeForm}>
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      </dialog>
      <Toaster />
    </div>
  );
};

export default ModalUpdate;
