import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Aside from "../../Components/Aside/Aside";
import toast, { Toaster } from "react-hot-toast";
import baseUrl from "../../utils/baseurl";
import { useForm } from "react-hook-form";

const UserManagement = () => {
  const { loginStatus, role } = useSelector((state) => state.login);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const { register, handleSubmit, reset } = useForm();

  // Redirect if not Authorized
  useEffect(() => {
    if (!loginStatus) navigate("/login");
    else if (role !== "hod" && role !== "lab_oc" ) {
      toast.error("Unauthorized");
      navigate("/");
    } else {
      fetchUsers();
    }
  }, [loginStatus, role, navigate]);

  const fetchUsers = async () => {
    const res = await fetch(`${baseUrl}/users/list`, { credentials: "include" });
    const result = await res.json();
    if (result.status) setUsers(result.data);
  };

  const hodCount = users.filter(u => u.role === "hod").length;
  const ocCount = users.filter(u => u.role === "lab_oc").length;
  const storeCount = users.filter(u => u.role === "storekeeper").length;

  const onAddUser = async (data) => {
    const res = await fetch(`${baseUrl}/users/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });
    const result = await res.json();
    if (result.status) {
      toast.success("User added!");
      reset();
      fetchUsers();
      document.getElementById("add_user_modal").close();
    } else toast.error(result.message);
  };

  const onDelete = async (userId) => {
    if (!window.confirm("Are you sure?")) return;
    const res = await fetch(`${baseUrl}/users/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
      credentials: "include",
    });
    const result = await res.json();
    if (result.status) {
      toast.success("User deleted!");
      fetchUsers();
    } else toast.error(result.message);
  };

  return (
    <div className="md:w-[90%] mt-3 md:mx-auto">
      <div className="drawer lg:drawer-open">
        <input id="sidebar_drawer" type="checkbox" className="drawer-toggle" />
        
        {/* ADDED: bg-gray-50 dark:bg-[#0B1120] min-h-screen for seamless background */}
        <div className="drawer-content px-4 py-4 bg-gray-50 dark:bg-[#0B1120] min-h-screen transition-colors duration-300">
          <div className="flex justify-between items-center mb-6">
            {/* ADDED: dark:text-slate-100 */}
            <h2 className="text-2xl font-bold dark:text-slate-100">User Management</h2>
            <button className="btn btn-primary btn-sm text-white" onClick={() => document.getElementById("add_user_modal").showModal()}>
              + Add User
            </button>
          </div>
          
          <div className="flex gap-4 mb-4">
            <div className="badge badge-lg p-4">HOD: {hodCount} / 1</div>
            <div className="badge badge-lg p-4">Lab OC: {ocCount} / 1</div>
            <div className="badge badge-lg p-4">Storekeepers: {storeCount} / 1</div>
          </div>

          {/* ADDED: dark:bg-slate-800 */}
          <table className="table w-full bg-white dark:bg-slate-800 shadow-md rounded-lg transition-colors duration-300">
            {/* ADDED: dark:bg-slate-900 dark:text-slate-200 */}
            <thead className="bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  {/* ADDED: dark:text-slate-300 for readability */}
                  <td className="dark:text-slate-300">{u.email}</td>
                  <td className="capitalize dark:text-slate-300">{u.role.replace("_", " ")}</td>
                  <td>
                    <button className="btn btn-error btn-xs text-white" onClick={() => onDelete(u._id)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="drawer-side md:h-[88vh]"><Aside /></div>
      </div>

      <dialog id="add_user_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Add New User</h3>
          <form onSubmit={handleSubmit(onAddUser)} className="space-y-4">
            <input type="email" placeholder="Email" {...register("email")} className="input input-bordered w-full" required />
            <input type="password" placeholder="Password" {...register("password")} className="input input-bordered w-full" required />
            <select {...register("role")} className="select select-bordered w-full">
              <option value="hod" disabled={hodCount >= 1}>HOD {hodCount >= 1 && "(Limit Reached)"}</option>
              <option value="lab_oc" disabled={ocCount >= 1}>Lab OC {ocCount >= 1 && "(Limit Reached)"}</option>
              <option value="storekeeper" disabled={storeCount >= 1}>Storekeeper {storeCount >= 1 && "(Limit Reached)"}</option>
            </select>
            <div className="modal-action">
              <button type="button" className="btn" onClick={() => document.getElementById("add_user_modal").close()}>Cancel</button>
              <button type="submit" className="btn btn-primary">Create</button>
            </div>
          </form>
        </div>
      </dialog>
      <Toaster />
    </div>
  );
};
export default UserManagement;