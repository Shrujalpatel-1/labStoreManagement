// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { Bars3BottomLeftIcon } from "@heroicons/react/24/outline";
// import Aside from "../../Components/Aside/Aside";
// import { useForm } from "react-hook-form";
// import toast, { Toaster } from "react-hot-toast";
// import baseUrl from "../../utils/baseurl";
// import { setProducts } from "../../Redux/products/productSlice";
// import { setIssuedItems } from "../../Redux/issue/issueSlice";

// const IssueProduct = () => {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   //check Islogin
//   const isLogin = useSelector((state) => state.login.loginStatus);
//   useEffect(() => {
//     // check if login:
//     if (!isLogin) {
//       // not login, take to login page:
//       navigate("/login");
//     }
//   }, [isLogin, navigate]); // Added dependencies

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//     reset, // Get reset function from useForm
//   } = useForm();

//   // --- New Student Validation ---
//   const validateStudentName = (name) => {
//     if (!name.trim()) return "Student Name is required!";
//   };
//   const validateRegNo = (regNo) => {
//     if (!regNo.trim()) return "Registration Number is required!";
//   };
//   const validateCourse = (course) => {
//     if (!course.trim()) return "Course is required!";
//   };
//   // --- End of Student Validation ---

//   // --- Simplified State for Single Item Issue (No Stock) ---
//   const [selectedProduct, setSelectedProduct] = useState({
//     productName: "",
//     quantity: 1,
//   });

//   // --- New State for Issue Details ---
//   const [isReturnable, setIsReturnable] = useState(false);
//   const [issueDate, setIssueDate] = useState("");
//   const [expectedReturnDate, setExpectedReturnDate] = useState("");
//   // --- End of New State ---

//   // --- New Handler for Product Name Text Input ---
//   const handleProductNameChange = (e) => {
//     setSelectedProduct((prev) => ({
//       ...prev,
//       productName: e.target.value,
//     }));
//   };

//   const handleSelectQuantityChange = (e) => {
//     const qty = Number(e.target.value);
//     setSelectedProduct((prev) => ({
//       ...prev,
//       quantity: qty,
//     }));
//   };

//   // --- Full Form Reset Function ---
//   const resetAllFields = () => {
//     reset(); // Resets react-hook-form fields (Student Name, Reg No, Course)
//     // Reset local state for item and issue details
//     setSelectedProduct({ productName: "", quantity: 1 });
//     setIsReturnable(false);
//     setIssueDate("");
//     setExpectedReturnDate("");
//   };

//   // --- Updated onSubmit Function ---
//   const onSubmit = async (data) => {
//     // Frontend Validations
//     if (!selectedProduct.productName.trim()) {
//       toast.error("Please enter a product name");
//       return;
//     }
//     if (selectedProduct.quantity <= 0) {
//       toast.error("Quantity must be at least 1");
//       return;
//     }
//     // --- Stock validation removed ---
//     if (isReturnable && !expectedReturnDate) {
//       toast.error(
//         "Please provide an expected return date for returnable items"
//       );
//       return;
//     }

//     // Build the payload for the new controller
//     const payload = {
//       productName: selectedProduct.productName,
//       quantity: selectedProduct.quantity,
//       studentName: data.studentName,
//       registrationNumber: data.registrationNumber,
//       course: data.course,
//       isReturnable: isReturnable,
//     };

//     // Add optional dates only if they are set
//     if (issueDate) {
//       payload.issueDate = issueDate;
//     }
//     if (isReturnable && expectedReturnDate) {
//       payload.expectedReturnDate = expectedReturnDate;
//     }

//     let myHeaders = new Headers();
//     myHeaders.append("Content-Type", "application/json");
//     let requestOptions = {
//       method: "POST",
//       headers: myHeaders,
//       body: JSON.stringify(payload), // Send the new payload
//       redirect: "follow",
//       credentials: "include",
//     };

//     try {
//       // Update endpoint to match new controller
//       const response = await fetch(`${baseUrl}/createissue`, requestOptions);
//       const result = await response.json();
//       if (result.status) {
//         toast.success("Item issued successfully");
//         // to update lists, empty the products slice that will result on automatic fetching of new items.
//         dispatch(setProducts([]));
//         // same as above for issued items slice
//         dispatch(setIssuedItems([])); // Use the correct action
//       } else {
//         toast.error(result.message || "Something went wrong! try again");
//         console.log("Error::issue item::result", result.message);
//       }
//     } catch (error) {
//       toast.error("Something went wrong! try again");
//       console.log("Error::issue item::", error);
//     } finally {
//       // Reset all form fields and state
//       resetAllFields();
//     }
//   };

//   return (
//     <div className="md:w-[80%] md:mx-auto">
//       {/* main */}
//       <div className="drawer lg:drawer-open">
//         <input id="sidebar_drawer" type="checkbox" className="drawer-toggle" />
//         <div className="drawer-content px-4">
//           {/* Page content here */}
//           <div className="">
//             {/* top heading bar */}
//             <div className="flex items-center justify-between my-4">
//               <label
//                 htmlFor="sidebar_drawer"
//                 className="drawer-button lg:hidden"
//               >
//                 <Bars3BottomLeftIcon className="w-6 h-6" />
//               </label>
//               <h2 className="text-xl w-full text-center">Issue New Item</h2>
//             </div>

//             <form onSubmit={handleSubmit(onSubmit)} id="form_issue_product">
//               <h4 className="text-xl capitalize font-bold">Student Details </h4>
//               <div className="form-box flex flex-wrap md:flex-nowrap">
//                 {/* --- Student Name --- */}
//                 <div className="w-full">
//                   <label className="form-control lg:max-w-xs px-2">
//                     <div className="label">
//                       <span className="label-text">Student Name</span>
//                     </div>
//                     <input
//                       type="text"
//                       name="studentName"
//                       {...register("studentName", {
//                         validate: validateStudentName,
//                       })}
//                       placeholder="Type here"
//                       className="input input-bordered w-full lg:max-w-xs "
//                     />
//                   </label>
//                   <div className="label-text text-xs text-error h-8 p-2">
//                     {errors.studentName && <p>{errors.studentName.message}</p>}
//                   </div>
//                 </div>

//                 {/* --- Registration Number --- */}
//                 <div className="w-full">
//                   <label className="form-control w-full lg:max-w-xs px-2">
//                     <div className="label">
//                       <span className="label-text">Registration Number</span>
//                     </div>
//                     <input
//                       type="text"
//                       name="registrationNumber"
//                       {...register("registrationNumber", {
//                         validate: validateRegNo,
//                       })}
//                       placeholder="Type here"
//                       className="input input-bordered w-full lg:max-w-xs "
//                     />
//                   </label>
//                   <div className="label-text text-xs text-error h-8 p-2">
//                     {errors.registrationNumber && (
//                       <p>{errors.registrationNumber.message}</p>
//                     )}
//                   </div>
//                 </div>

//                 {/* --- Course --- */}
//                 <div className="w-full">
//                   <label className="form-control w-full lg:max-w-xs px-2">
//                     <div className="label">
//                       <span className="label-text">Course</span>
//                     </div>
//                     <input
//                       type="text"
//                       name="course"
//                       {...register("course", { validate: validateCourse })}
//                       placeholder="Type here"
//                       className="input input-bordered w-full lg:max-w-xs "
//                     />
//                   </label>
//                   <div className="label-text text-xs text-error h-8 p-2">
//                     {errors.course && <p>{errors.course.message}</p>}
//                   </div>
//                 </div>
//               </div>

//               {/* --- Item details --- */}
//               <h4 className="text-xl mt-3 capitalize font-bold">
//                 Item Details
//               </h4>
//               <div className="form-box flex items-center flex-wrap border-b-2 pb-2">
//                 {/* --- Product Name Text Input --- */}
//                 <label className="form-control w-full lg:max-w-xs px-2">
//                   <div className="label ">
//                     <span className="label-text ">Product Name</span>
//                   </div>
//                   <input
//                     type="text"
//                     name="product_name"
//                     value={selectedProduct.productName}
//                     onChange={handleProductNameChange}
//                     placeholder="Type product name"
//                     className="input input-bordered w-full lg:max-w-xs"
//                   />
//                 </label>

//                 {/* --- Quantity Input --- */}
//                 <label className="form-control px-2">
//                   <div className="label">
//                     <span className="label-text">Enter Quantity</span>
//                   </div>
//                   <input
//                     type="number"
//                     name="select_quantity"
//                     value={selectedProduct.quantity} // Controlled component
//                     min={1}
//                     onChange={handleSelectQuantityChange}
//                     placeholder="Type here"
//                     className="input input-bordered w-24"
//                   />
//                 </label>

//                 {/* --- Stock Input Removed --- */}
//               </div>

//               {/* --- Issue Details --- */}
//               <h4 className="text-xl mt-3 capitalize font-bold">
//                 Issue Details
//               </h4>
//               <div className="form-box flex flex-wrap md:flex-nowrap items-center">
//                 {/* Returnable Checkbox */}
//                 <label className="form-control w-full max-w-xs px-2 cursor-pointer">
//                   <div className="label">
//                     <span className="label-text">Is this item returnable?</span>
//                   </div>
//                   <input
//                     type="checkbox"
//                     checked={isReturnable}
//                     onChange={(e) => setIsReturnable(e.target.checked)}
//                     className="checkbox checkbox-primary"
//                   />
//                 </label>

//                 {/* Issue Date */}
//                 <label className="form-control w-full max-w-xs px-2">
//                   <div className="label">
//                     <span className="label-text">Issue Date (Optional)</span>
//                   </div>
//                   <input
//                     type="date"
//                     value={issueDate}
//                     onChange={(e) => setIssueDate(e.target.value)}
//                     className="input input-bordered w-full max-w-xs"
//                   />
//                 </label>

//                 {/* Expected Return Date (Conditional) */}
//                 {isReturnable && (
//                   <label className="form-control w-full max-w-xs px-2">
//                     <div className="label">
//                       <span className="label-text">Expected Return Date</span>
//                     </div>
//                     <input
//                       type="date"
//                       value={expectedReturnDate}
//                       onChange={(e) => setExpectedReturnDate(e.target.value)}
//                       className="input input-bordered w-full max-w-xs"
//                     />
//                   </label>
//                 )}
//               </div>

//               {/* --- Submit Button --- */}
//               <div className="text-center mt-8">
//                 <button type="submit" className="btn btn-primary btn-wide">
//                   Issue Item
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>

//         {/* sidebar starts */}
//         <div className="drawer-side md:h-[80vh] h-full">
//           <label
//             htmlFor="sidebar_drawer"
//             aria-label="close sidebar"
//             className="drawer-overlay"
//           ></label>

//           <Aside />
//         </div>
//         {/* sidebar ends */}
//       </div>
//       {/* main end */}

//       <Toaster />
//     </div>
//   );
// };

// export default IssueProduct;
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Bars3BottomLeftIcon } from "@heroicons/react/24/outline";
import Aside from "../../Components/Aside/Aside";
import { useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import baseUrl from "../../utils/baseurl";
import { setProducts } from "../../Redux/products/productSlice";
import { setIssuedItems } from "../../Redux/issue/issueSlice";

const IssueProduct = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  //check Islogin
  const isLogin = useSelector((state) => state.login.loginStatus);
  useEffect(() => {
    // check if login:
    if (!isLogin) {
      // not login, take to login page:
      navigate("/login");
    }
  }, [isLogin, navigate]); // Added dependencies

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset, // Get reset function from useForm
  } = useForm();

  // --- New Student Validation ---
  const validateStudentName = (name) => {
    if (!name.trim()) return "Student Name is required!";
  };
  const validateRegNo = (regNo) => {
    if (!regNo.trim()) return "Registration Number is required!";
  };
  const validateCourse = (course) => {
    if (!course.trim()) return "Course is required!";
  };
  // --- End of Student Validation ---

  // --- Simplified State for Single Item Issue (No Stock) ---
  const [selectedProduct, setSelectedProduct] = useState({
    productName: "",
    quantity: "", // CHANGED: String type initialization
  });

  // --- New State for Issue Details ---
  const [isReturnable, setIsReturnable] = useState(false);
  const [issueDate, setIssueDate] = useState("");
  const [expectedReturnDate, setExpectedReturnDate] = useState("");
  // --- End of New State ---

  // --- New Handler for Product Name Text Input ---
  const handleProductNameChange = (e) => {
    setSelectedProduct((prev) => ({
      ...prev,
      productName: e.target.value,
    }));
  };

  const handleSelectQuantityChange = (e) => {
    const qty = e.target.value; // CHANGED: Removed Number() conversion
    setSelectedProduct((prev) => ({
      ...prev,
      quantity: qty,
    }));
  };

  // --- Full Form Reset Function ---
  const resetAllFields = () => {
    reset(); // Resets react-hook-form fields (Student Name, Reg No, Course)
    // Reset local state for item and issue details
    setSelectedProduct({ productName: "", quantity: "" }); // CHANGED: Reset to empty string
    setIsReturnable(false);
    setIssueDate("");
    setExpectedReturnDate("");
  };

  // --- Updated onSubmit Function ---
  const onSubmit = async (data) => {
    // Frontend Validations
    if (!selectedProduct.productName.trim()) {
      toast.error("Please enter a product name");
      return;
    }

    // CHANGED: Validation for string quantity
    if (!selectedProduct.quantity.trim()) {
      toast.error("Please enter a quantity");
      return;
    }

    if (isReturnable && !expectedReturnDate) {
      toast.error(
        "Please provide an expected return date for returnable items"
      );
      return;
    }

    // Build the payload for the new controller
    const payload = {
      productName: selectedProduct.productName,
      quantity: selectedProduct.quantity,
      studentName: data.studentName,
      registrationNumber: data.registrationNumber,
      course: data.course,
      isReturnable: isReturnable,
    };

    // Add optional dates only if they are set
    if (issueDate) {
      payload.issueDate = issueDate;
    }
    if (isReturnable && expectedReturnDate) {
      payload.expectedReturnDate = expectedReturnDate;
    }

    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    let requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify(payload), // Send the new payload
      redirect: "follow",
      credentials: "include",
    };

    try {
      // Update endpoint to match new controller
      const response = await fetch(`${baseUrl}/createissue`, requestOptions);
      const result = await response.json();
      if (result.status) {
        toast.success("Item issued successfully");
        // to update lists, empty the products slice that will result on automatic fetching of new items.
        dispatch(setProducts([]));
        // same as above for issued items slice
        dispatch(setIssuedItems([])); // Use the correct action
      } else {
        toast.error(result.message || "Something went wrong! try again");
        console.log("Error::issue item::result", result.message);
      }
    } catch (error) {
      toast.error("Something went wrong! try again");
      console.log("Error::issue item::", error);
    } finally {
      // Reset all form fields and state
      resetAllFields();
    }
  };

  return (
    <div className="md:w-[80%] md:mx-auto">
      {/* main */}
      <div className="drawer lg:drawer-open">
        <input id="sidebar_drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content px-4">
          {/* Page content here */}
          <div className="">
            {/* top heading bar */}
            <div className="flex items-center justify-between my-4">
              <label
                htmlFor="sidebar_drawer"
                className="drawer-button lg:hidden"
              >
                <Bars3BottomLeftIcon className="w-6 h-6" />
              </label>
              <h2 className="text-xl w-full text-center">Issue New Item</h2>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} id="form_issue_product">
              <h4 className="text-xl capitalize font-bold">Student Details </h4>
              <div className="form-box flex flex-wrap md:flex-nowrap">
                {/* --- Student Name --- */}
                <div className="w-full">
                  <label className="form-control lg:max-w-xs px-2">
                    <div className="label">
                      <span className="label-text">Student Name</span>
                    </div>
                    <input
                      type="text"
                      name="studentName"
                      {...register("studentName", {
                        validate: validateStudentName,
                      })}
                      placeholder="Type here"
                      className="input input-bordered w-full lg:max-w-xs "
                    />
                  </label>
                  <div className="label-text text-xs text-error h-8 p-2">
                    {errors.studentName && <p>{errors.studentName.message}</p>}
                  </div>
                </div>

                {/* --- Registration Number --- */}
                <div className="w-full">
                  <label className="form-control w-full lg:max-w-xs px-2">
                    <div className="label">
                      <span className="label-text">Registration Number</span>
                    </div>
                    <input
                      type="text"
                      name="registrationNumber"
                      {...register("registrationNumber", {
                        validate: validateRegNo,
                      })}
                      placeholder="Type here"
                      className="input input-bordered w-full lg:max-w-xs "
                    />
                  </label>
                  <div className="label-text text-xs text-error h-8 p-2">
                    {errors.registrationNumber && (
                      <p>{errors.registrationNumber.message}</p>
                    )}
                  </div>
                </div>

                {/* --- Course --- */}
                <div className="w-full">
                  <label className="form-control w-full lg:max-w-xs px-2">
                    <div className="label">
                      <span className="label-text">Course</span>
                    </div>
                    <input
                      type="text"
                      name="course"
                      {...register("course", { validate: validateCourse })}
                      placeholder="Type here"
                      className="input input-bordered w-full lg:max-w-xs "
                    />
                  </label>
                  <div className="label-text text-xs text-error h-8 p-2">
                    {errors.course && <p>{errors.course.message}</p>}
                  </div>
                </div>
              </div>

              {/* --- Item details --- */}
              <h4 className="text-xl mt-3 capitalize font-bold">
                Item Details
              </h4>
              <div className="form-box flex items-center flex-wrap border-b-2 pb-2">
                {/* --- Product Name Text Input --- */}
                <label className="form-control w-full lg:max-w-xs px-2">
                  <div className="label ">
                    <span className="label-text ">Product Name</span>
                  </div>
                  <input
                    type="text"
                    name="product_name"
                    value={selectedProduct.productName}
                    onChange={handleProductNameChange}
                    placeholder="Type product name"
                    className="input input-bordered w-full lg:max-w-xs"
                  />
                </label>

                {/* --- Quantity Input (UPDATED) --- */}
                <label className="form-control px-2">
                  <div className="label">
                    <span className="label-text">Enter Quantity</span>
                  </div>
                  <input
                    type="text" // CHANGED: input type to text
                    name="select_quantity"
                    value={selectedProduct.quantity} // Controlled component
                    onChange={handleSelectQuantityChange}
                    placeholder="Type here"
                    className="input input-bordered w-full"
                  />
                </label>
              </div>

              {/* --- Issue Details --- */}
              <h4 className="text-xl mt-3 capitalize font-bold">
                Issue Details
              </h4>
              <div className="form-box flex flex-wrap md:flex-nowrap items-center">
                {/* Returnable Checkbox */}
                <label className="form-control w-full max-w-xs px-2 cursor-pointer">
                  <div className="label">
                    <span className="label-text">Is this item returnable?</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isReturnable}
                    onChange={(e) => setIsReturnable(e.target.checked)}
                    className="checkbox checkbox-primary"
                  />
                </label>

                {/* Issue Date */}
                <label className="form-control w-full max-w-xs px-2">
                  <div className="label">
                    <span className="label-text">Issue Date (Optional)</span>
                  </div>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="input input-bordered w-full max-w-xs"
                  />
                </label>

                {/* Expected Return Date (Conditional) */}
                {isReturnable && (
                  <label className="form-control w-full max-w-xs px-2">
                    <div className="label">
                      <span className="label-text">Expected Return Date</span>
                    </div>
                    <input
                      type="date"
                      value={expectedReturnDate}
                      onChange={(e) => setExpectedReturnDate(e.target.value)}
                      className="input input-bordered w-full max-w-xs"
                    />
                  </label>
                )}
              </div>

              {/* --- Submit Button --- */}
              <div className="text-center mt-8">
                <button type="submit" className="btn btn-primary btn-wide">
                  Issue Item
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* sidebar starts */}
        <div className="drawer-side md:h-[80vh] h-full">
          <label
            htmlFor="sidebar_drawer"
            aria-label="close sidebar"
            className="drawer-overlay"
          ></label>

          <Aside />
        </div>
        {/* sidebar ends */}
      </div>
      {/* main end */}

      <Toaster />
    </div>
  );
};

export default IssueProduct;
