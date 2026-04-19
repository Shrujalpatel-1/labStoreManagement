import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import baseUrl from "../../utils/baseurl";
import { setLastUpdated } from "../../Redux/products/productSlice";

const ModalAdd = (props) => {
  const dispatch = useDispatch();
  
  // 1. Fetch categories from Redux (with fallback to defaults just in case)
  const categoriesList = useSelector((state) => state.product.categoriesList || [
    "chemical",
    "teaching_kit",
    "plasticware",
    "glassware",
    "miscellaneous"
  ]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm();

  // 2. Track the selected dropdown category so the specific fields update instantly
  const currentCategory = watch("category", props.selectedCategory);

  // 3. Keep the dropdown in sync with the Sidebar selection when the modal opens
  useEffect(() => {
    reset({ category: props.selectedCategory });
  }, [props.selectedCategory, reset]);

  // --- Strict validation ONLY for required fields (Name) ---
  const validateRequired = (value, fieldName) => {
    if (!String(value).trim()) {
      return `${fieldName} is required`;
    }
  };

  // --- Quantity is optional, but if entered, must not be negative ---
  const validateQuantity = (value, fieldName) => {
    if (!value || String(value).trim() === "") return true;
    if (currentCategory === "chemical") return true; // Allow any string for chemicals
    if (Number(value) < 0) {
      return `${fieldName} cannot be negative`;
    }
    return true;
  };

  const onSubmit = async (data) => {
    const cleanData = { ...data };

    // CLEANUP: If Date of Purchase is empty, delete the key entirely
    if (!cleanData.dateOfPurchase || cleanData.dateOfPurchase.trim() === "") {
      delete cleanData.dateOfPurchase;
    }

    // CLEANUP: If Date of Expiry is empty, delete the key entirely
    if (!cleanData.dateOfExpiry || cleanData.dateOfExpiry.trim() === "") {
      delete cleanData.dateOfExpiry;
    }

    // CLEANUP: If Quantity fields are empty, delete them
    if (!cleanData.quantityOrdered) delete cleanData.quantityOrdered;
    if (!cleanData.quantityAvailable) delete cleanData.quantityAvailable;

    // Convert non-chemical quantities to Numbers
    if (currentCategory !== "chemical") {
      if (cleanData.quantityOrdered) cleanData.quantityOrdered = Number(cleanData.quantityOrdered);
      if (cleanData.quantityAvailable) cleanData.quantityAvailable = Number(cleanData.quantityAvailable);
    }

    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    let requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify(cleanData),
      redirect: "follow",
      credentials: "include",
    };

    try {
      const response = await fetch(
        `${baseUrl}/products/insert`,
        requestOptions
      );
      const result = await response.json();

      if (result.status) {
        toast.success("Product added successfully");
        props.fetchProductsByCategory(currentCategory);
        dispatch(setLastUpdated(new Date().toISOString()));
      } else {
        toast.error(result.message || "Something went wrong! try again");
        console.log("Error::Modal Add::result", result.message);
      }
    } catch (error) {
      toast.error("Something went wrong! try again");
      console.log("Error::Modal Add::", error);
    } finally {
      reset();
      document.getElementById(props.id).close();
    }
  };

  const clearForm = (e) => {
    e.preventDefault();
    e.stopPropagation();
    reset();
    document.getElementById(props.id).close();
  };

  const renderCategorySpecificFields = () => {
    switch (currentCategory) {
      case "chemical":
      case "teaching_kit":
        return (
          <>
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

            <label className="form-control w-full lg:max-w-xs px-2">
              <div className="label">
                <span className="label-text">Date of Expiry</span>
              </div>
              <input
                type="date"
                {...register("dateOfExpiry")}
                name="dateOfExpiry"
                className="input input-bordered w-full lg:max-w-xs"
              />
            </label>
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
          <h3 className="font-bold text-lg capitalize">
            Add {currentCategory?.replace(/_/g, " ")} Product
          </h3>

          <form
            method="dialog"
            onSubmit={handleSubmit(onSubmit)}
            id="addFormModal"
          >
            <div>
              <label className="form-control w-full lg:max-w-xs px-2">
                <div className="label">
                  <span className="label-text">Category *</span>
                </div>
                <select
                  {...register("category", { required: "Category is required" })}
                  className="select select-bordered w-full lg:max-w-xs capitalize"
                >
                  <option value="" disabled>-- Select Category --</option>
                  {categoriesList.map((cat) => (
                    <option key={cat} value={cat} className="capitalize">
                      {cat.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-xs text-red-600 ps-2 mt-1">
                    {errors.category.message}
                  </p>
                )}
              </label>

              {/* --- Product Name (STILL REQUIRED) --- */}
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

              {/* --- Quantity Ordered (OPTIONAL) --- */}
              <label className="form-control w-full lg:max-w-xs px-2">
                <div className="label">
                  <span className="label-text">Quantity Ordered</span>
                </div>
                <input
                  type={currentCategory === "chemical" ? "text" : "number"}
                  {...register("quantityOrdered", {
                    validate: (v) => validateQuantity(v, "Quantity Ordered"),
                  })}
                  min={currentCategory === "chemical" ? undefined : 0}
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

              {/* --- Quantity Available (OPTIONAL) --- */}
              <label className="form-control w-full lg:max-w-xs px-2">
                <div className="label">
                  <span className="label-text">Quantity Available</span>
                </div>
                {currentCategory === "chemical" ? (
                  <select
                    {...register("quantityAvailable")}
                    className="select select-bordered w-full lg:max-w-xs"
                  >
                    <option value="yes">Yes (Available)</option>
                    <option value="no">No (Not Available)</option>
                  </select>
                ) : (
                  <input
                    type="number"
                    {...register("quantityAvailable", {
                      validate: (v) => validateQuantity(v, "Quantity Available"),
                    })}
                    min={0}
                    name="quantityAvailable"
                    placeholder="Type here"
                    className="input input-bordered w-full lg:max-w-xs "
                  />
                )}
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
                <button type="submit" className="btn mx-2 px-6 btn-sm btn-primary text-white">
                  Add
                </button>
                <button type="button" className="btn mx-2 px-6 btn-sm" onClick={clearForm}>
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

export default ModalAdd;