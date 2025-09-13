import React, { useState } from "react";
import axios from "axios";
import GeminiWave from "../ui/GeminiWave.jsx";
import ToggelSwitch from "../ui/ToggelSwitch.jsx";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { cn } from "../lib/utils";

// ✅ Configure axios once
const api = axios.create({
  baseURL: "http://localhost:8000",  // backend server
  withCredentials: true, // to send cookies if any
});

export default function Login() {
  const [role, setRole] = useState("institute"); // default role
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = role === "institute" ? "/institute/login" : "/admin/login";
      // Prepare payload according to role
      const payload =
        role === "admin"
          ? { username: email, password } // admin expects username
          : { email, password }; // institute expects email

      const res = await api.post(endpoint, payload);

      // Save token (backend returns { token })
      localStorage.setItem("token", res.data?.data?.token);

      alert("Login successful ✅");
      window.location.href = "/dashboard"; // redirect after login
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.message || "Invalid credentials or server error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <GeminiWave>
      <div className="relative flex min-h-screen flex-col">
        {/* Theme Toggle */}
        <div className="absolute right-5 top-5">
          <ToggelSwitch />
        </div>

        {/* Login Box */}
        <div className="flex mb-1 flex-1 items-center justify-center px-4">
          <div className="shadow-input w-full max-w-md rounded-none bg-white p-4 md:rounded-2xl md:p-8 dark:bg-black">
            <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
              Welcome to Certificate Platform
            </h2>

            {/* Role Selector */}
            <div className="mt-2 flex space-x-4">
              <button
                type="button"
                onClick={() => setRole("institute")}
                className={cn(
                  "flex-1 rounded-md border px-1 py-1 text-sm font-medium",
                  role === "institute"
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "bg-transparent text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                )}
              >
                Institute
              </button>
              <button
                type="button"
                onClick={() => setRole("admin")}
                className={cn(
                  "flex-1 rounded-md border px-1 py-1 text-sm font-medium",
                  role === "admin"
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "bg-transparent text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                )}
              >
                Admin
              </button>
            </div>

            {/* Form */}
            <form className="my-8" onSubmit={handleSubmit}>
              <LabelInputContainer className="mb-4">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  placeholder="your@email.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </LabelInputContainer>

              <LabelInputContainer className="mb-4">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </LabelInputContainer>

              {error && (
                <p className="mb-4 text-sm text-red-500 font-medium">{error}</p>
              )}

              <button
                className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white disabled:opacity-50"
                type="submit"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Log in →"}
                <BottomGradient />
              </button>

              {/* Info Section */}
              <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />
              <div className="group/btn relative block w-full rounded-md bg-white border border-black p-4 text-sm font-medium shadow dark:bg-zinc-800">
                <p className="leading-relaxed text-black dark:text-neutral-300">
                  Credentials are issued directly by our team. <br />
                  If your institute or university requires access to our
                  platform, please contact us.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </GeminiWave>
  );
}

/* Gradient under button */
const BottomGradient = () => (
  <>
    <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
    <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
  </>
);

/* Input wrapper */
const LabelInputContainer = ({ className, ...props }) => (
  <div className={cn("flex flex-col space-y-1", className)} {...props} />
);
