import React, { useState } from "react";
import axios from "../api/axios";
import { useDispatch } from "react-redux";
import { setAuth } from "../features/auth/authSlice";

export default function Login() {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("password");
  const [err, setErr] = useState("");

  async function onLogin(e) {
    e.preventDefault();
    setErr("");
    try {
      const res = await axios.post("/api/auth/login", { email, password });
      dispatch(setAuth(res.data));
      alert("Logged in!");
    } catch (e2) {
      setErr(e2?.response?.data?.message || e2.message || "Login failed");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={onLogin} className="w-full max-w-sm bg-white border rounded-xl p-6">
        <h1 className="text-xl font-semibold mb-4">Login</h1>

        {err ? (
          <div className="mb-3 p-2 text-sm bg-red-50 border border-red-200 text-red-700 rounded">
            {err}
          </div>
        ) : null}

        <label className="block text-sm mb-1">Email</label>
        <input
          className="w-full mb-3 px-3 py-2 border rounded-lg"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label className="block text-sm mb-1">Password</label>
        <input
          type="password"
          className="w-full mb-4 px-3 py-2 border rounded-lg"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800">
          Login
        </button>
      </form>
    </div>
  );
}