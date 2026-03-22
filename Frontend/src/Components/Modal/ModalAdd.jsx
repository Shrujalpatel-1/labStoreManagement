// import React from "react";
// import { useSelector } from "react-redux";
// import { useForm } from "react-hook-form";
// import toast, { Toaster } from "react-hot-toast";
// import baseUrl from "../../utils/baseurl";

// const ModalAdd = (props) => {
//   const products = useSelector((state) => state.product.products);
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//     reset,
//   } = useForm({});

//   // --- CHANGED: Strict validation ONLY for required fields (Name) ---
//   const validateRequired = (value, fieldName) => {
//     if (!String(value).trim()) {
//       return `${fieldName} is required`;
//     }
//   };

//   // --- CHANGED: Quantity is optional, but if entered, must not be negative ---
//   const validateQuantity = (value, fieldName) => {
//     // If empty, return true (valid)
//     if (!value || String(value).trim() === "") return true;

//     // If value exists, check if negative
//     if (Number(value) < 0) {
//       return `${fieldName} cannot be negative`;
//     }
//     return true;
//   };

//   const onSubmit = async (data) => {
//     // 1. Create a copy of the data so we can modify it
//     const cleanData = { ...data };

//     // 2. CLEANUP: If Date of Purchase is empty, delete the key entirely
//     if (!cleanData.dateOfPurchase || cleanData.dateOfPurchase.trim() === "") {
//       delete cleanData.dateOfPurchase;
//     }

//     // 3. CLEANUP: If Date of Expiry is empty, delete the key entirely
//     if (!cleanData.dateOfExpiry || cleanData.dateOfExpiry.trim() === "") {
//       delete cleanData.dateOfExpiry;
//     }

//     // 4. CLEANUP: If Quantity fields are empty, delete them (optional cleanup)
//     if (!cleanData.quantityOrdered) delete cleanData.quantityOrdered;
//     if (!cleanData.quantityAvailable) delete cleanData.quantityAvailable;

//     // 5. Merge with category and send
//     const productData = { ...cleanData, category: props.selectedCategory };

//     let myHeaders = new Headers();
//     myHeaders.append("Content-Type", "application/json");
//     let requestOptions = {
//       method: "POST",
//       headers: myHeaders,
//       body: JSON.stringify(productData), // Now sends data without the empty date keys
//       redirect: "follow",
//       credentials: "include",
//     };

//     try {
//       const response = await fetch(
//         `${baseUrl}/products/insert`,
//         requestOptions
//       );
//       const result = await response.json();

//       if (result.status) {
//         toast.success("Product added successfully");
//         props.fetchProductsByCategory(props.selectedCategory);
//       } else {
//         toast.error(result.message || "Something went wrong! try again");
//         console.log("Error::Modal Add::result", result.message);
//       }
//     } catch (error) {
//       toast.error("Something went wrong! try again");
//       console.log("Error::Modal Add::", error);
//     } finally {
//       reset();
//       document.getElementById(props.id).close();
//     }
//   };

//   const clearForm = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     reset();
//     document.getElementById(props.id).close();
//   };

//   const renderCategorySpecificFields = () => {
//     // Note: Removed validation props from all fields below to make them optional
//     switch (props.selectedCategory) {
//       case "chemical":
//       case "teaching_kit":
//         return (
//           <>
//             <label className="form-control w-full lg:max-w-xs px-2">
//               <div className="label">
//                 <span className="label-text">Storage Temperature</span>
//               </div>
//               <input
//                 type="text"
//                 {...register("storageTemp")} // Removed validation
//                 name="storageTemp"
//                 placeholder="e.g., 2-8°C"
//                 className="input input-bordered w-full lg:max-w-xs"
//               />
//             </label>

//             <label className="form-control w-full lg:max-w-xs px-2">
//               <div className="label">
//                 <span className="label-text">Brand</span>
//               </div>
//               <input
//                 type="text"
//                 {...register("brand")} // Removed validation
//                 name="brand"
//                 placeholder="Type here"
//                 className="input input-bordered w-full lg:max-w-xs"
//               />
//             </label>

//             <label className="form-control w-full lg:max-w-xs px-2">
//               <div className="label">
//                 <span className="label-text">Lot Number</span>
//               </div>
//               <input
//                 type="text"
//                 {...register("lotNo")} // Removed validation
//                 name="lotNo"
//                 placeholder="Type here"
//                 className="input input-bordered w-full lg:max-w-xs"
//               />
//             </label>

//             <label className="form-control w-full lg:max-w-xs px-2">
//               <div className="label">
//                 <span className="label-text">Date of Purchase</span>
//               </div>
//               <input
//                 type="date"
//                 {...register("dateOfPurchase")} // Removed validation
//                 name="dateOfPurchase"
//                 className="input input-bordered w-full lg:max-w-xs"
//               />
//             </label>

//             <label className="form-control w-full lg:max-w-xs px-2">
//               <div className="label">
//                 <span className="label-text">Date of Expiry</span>
//               </div>
//               <input
//                 type="date"
//                 {...register("dateOfExpiry")} // Removed validation
//                 name="dateOfExpiry"
//                 className="input input-bordered w-full lg:max-w-xs"
//               />
//             </label>
//           </>
//         );
//       case "plasticware":
//       case "glassware":
//       case "miscellaneous":
//         return (
//           <>
//             <label className="form-control w-full lg:max-w-xs px-2">
//               <div className="label">
//                 <span className="label-text">Brand</span>
//               </div>
//               <input
//                 type="text"
//                 {...register("brand")} // Removed validation
//                 name="brand"
//                 placeholder="Type here"
//                 className="input input-bordered w-full lg:max-w-xs"
//               />
//             </label>

//             <label className="form-control w-full lg:max-w-xs px-2">
//               <div className="label">
//                 <span className="label-text">Lot Number</span>
//               </div>
//               <input
//                 type="text"
//                 {...register("lotNo")} // Removed validation
//                 name="lotNo"
//                 placeholder="Type here"
//                 className="input input-bordered w-full lg:max-w-xs"
//               />
//             </label>

//             <label className="form-control w-full lg:max-w-xs px-2">
//               <div className="label">
//                 <span className="label-text">Date of Purchase</span>
//               </div>
//               <input
//                 type="date"
//                 {...register("dateOfPurchase")} // Removed validation
//                 name="dateOfPurchase"
//                 className="input input-bordered w-full lg:max-w-xs"
//               />
//             </label>
//           </>
//         );
//       default:
//         return null;
//     }
//   };

//   return (
//     <div>
//       <dialog id={props.id} className="modal">
//         <div className="modal-box">
//           <h3 className="font-bold text-lg">
//             Add {props.selectedCategory.replace("_", " ")} Product
//           </h3>

//           <form
//             method="dialog"
//             onSubmit={handleSubmit(onSubmit)}
//             id="addFormModal"
//           >
//             <div>
//               <label className="form-control w-full lg:max-w-xs px-2">
//                 <div className="label">
//                   <span className="label-text">Category</span>
//                 </div>
//                 <input
//                   type="text"
//                   placeholder="Type here"
//                   className="input input-bordered w-full lg:max-w-xs capitalize"
//                   disabled
//                   value={props.selectedCategory.replace("_", " ")}
//                 />
//               </label>

//               {/* --- Product Name (STILL REQUIRED) --- */}
//               <label className="form-control w-full lg:max-w-xs px-2">
//                 <div className="label">
//                   <span className="label-text">Product Name *</span>
//                 </div>
//                 <input
//                   type="text"
//                   {...register("name", {
//                     validate: (v) => validateRequired(v, "Product Name"),
//                   })}
//                   name="name"
//                   placeholder="Type here"
//                   className="input input-bordered w-full lg:max-w-xs"
//                 />
//               </label>
//               {errors.name && (
//                 <p className="text-xs text-red-600 ps-2 mt-1">
//                   {errors.name.message}
//                 </p>
//               )}

//               {/* --- Quantity Ordered (OPTIONAL) --- */}
//               <label className="form-control w-full lg:max-w-xs px-2">
//                 <div className="label">
//                   <span className="label-text">Quantity Ordered</span>
//                 </div>
//                 <input
//                   type="text"
//                   {...register("quantityOrdered", {
//                     validate: (v) => validateQuantity(v, "Quantity Ordered"),
//                   })}
//                   min={0}
//                   name="quantityOrdered"
//                   placeholder="Type here"
//                   className="input input-bordered w-full lg:max-w-xs"
//                 />
//               </label>
//               {errors.quantityOrdered && (
//                 <p className="text-xs text-red-600 ps-2 mt-1">
//                   {errors.quantityOrdered.message}
//                 </p>
//               )}

//               {/* --- Quantity Available (OPTIONAL) --- */}
//               <label className="form-control w-full lg:max-w-xs px-2">
//                 <div className="label">
//                   <span className="label-text">Quantity Available</span>
//                 </div>
//                 <input
//                   type="text"
//                   {...register("quantityAvailable", {
//                     validate: (v) => validateQuantity(v, "Quantity Available"),
//                   })}
//                   min={0}
//                   name="quantityAvailable"
//                   placeholder="Type here"
//                   className="input input-bordered w-full lg:max-w-xs "
//                 />
//               </label>
//               {errors.quantityAvailable && (
//                 <p className="text-xs text-red-600 ps-2 mt-1">
//                   {errors.quantityAvailable.message}
//                 </p>
//               )}

//               {renderCategorySpecificFields()}
//             </div>
//             <div className="modal-action">
//               <div>
//                 <button className="btn mx-2 px-6 btn-sm btn-primary text-white">
//                   Add
//                 </button>
//                 <button className="btn mx-2 px-6 btn-sm" onClick={clearForm}>
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           </form>
//         </div>
//       </dialog>

//       <Toaster />
//     </div>
//   );
// };

// export default ModalAdd;
import React from "react";
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import baseUrl from "../../utils/baseurl";

const ModalAdd = (props) => {
  const products = useSelector((state) => state.product.products);
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
    if (!value || String(value).trim() === "") return true;
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

    // Merge with category and send
    const productData = { ...cleanData, category: props.selectedCategory };

    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    let requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify(productData),
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
        props.fetchProductsByCategory(props.selectedCategory);
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
    switch (props.selectedCategory) {
      case "chemical":
      case "teaching_kit":
        return (
          <>
            {/* --- CHANGED: Only show Storage Temp if category is 'chemical' --- */}
            {props.selectedCategory === "chemical" && (
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
          <h3 className="font-bold text-lg">
            Add {props.selectedCategory.replace("_", " ")} Product
          </h3>

          <form
            method="dialog"
            onSubmit={handleSubmit(onSubmit)}
            id="addFormModal"
          >
            <div>
              <label className="form-control w-full lg:max-w-xs px-2">
                <div className="label">
                  <span className="label-text">Category</span>
                </div>
                <input
                  type="text"
                  placeholder="Type here"
                  className="input input-bordered w-full lg:max-w-xs capitalize"
                  disabled
                  value={props.selectedCategory.replace("_", " ")}
                />
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

              {/* --- Quantity Available (OPTIONAL) --- */}
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
                  Add
                </button>
                <button className="btn mx-2 px-6 btn-sm" onClick={clearForm}>
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
