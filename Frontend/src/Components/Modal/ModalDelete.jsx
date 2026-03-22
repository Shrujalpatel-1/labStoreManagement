import React from "react";
import { useDispatch } from "react-redux";
import baseUrl from "../../utils/baseurl";
import toast, { Toaster } from "react-hot-toast";

const Modal = (props) => {
  const handleDelete = async () => {
    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    let requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify({
        productId: props.pid,
      }),
      redirect: "follow",
      credentials: "include", //!important
    };

    try {
      const response = await fetch(
        `${baseUrl}/products/delete`,
        requestOptions
      ); // Updated API endpoint
      const result = await response.json();
      if (result.status) {
        toast.success("Product deleted successfully");
        // to refresh,
        props.fetchProductsByCategory(props.selectedCategory); // Pass category to refetch
      } else {
        toast.error("Something went wrong! try again");
        console.log("Error::Modal Delete::result", result.message);
      }
    } catch (error) {
      console.log("error", error);
    }
  };
  return (
    <div>
      <dialog id={props.id} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">{props.title}</h3>
          <p className="py-4">Product ID: {props.pid}</p>
          <div className="modal-action">
            <form method="dialog">
              <button
                className="btn mx-2 px-6 btn-sm bg-red-700 text-white"
                onClick={handleDelete}
              >
                yes
              </button>
              <button className="btn mx-2 px-6 btn-sm">No</button>
            </form>
          </div>
        </div>
      </dialog>
      <Toaster />
    </div>
  );
};

export default Modal;
