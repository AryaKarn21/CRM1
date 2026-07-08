import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Building2, Lock, Mail } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { authAPI } from "@/api/auth.api";
import toast from "react-hot-toast";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Login() {
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    if (loading) return;
     
    setLoading(true);
    try {
      const res = await authAPI.login(data);
      setAuth(res.data);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      navigate(from, { replace: true });
    
      } catch (err) {

  const message =
    err?.response?.data?.message;

  if (message === "Please verify your email before logging in.") {

    toast.error(message);

    navigate("/verify-otp", {
      state: {
        email: data.email,
      },
    });

    return;
  }

  toast.error(message || "Login failed");

}
    
    
    finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg)" }}>
      {/* Left panel */}
      <div
        className="hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: "var(--sidebar-bg)" }}
      >
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-blue-500 blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-purple-500 blur-3xl" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-[var(--primary)] flex items-center justify-center">
              <Building2 size={20} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-none">
                OS Group CRM
              </p>
              <p className="text-slate-400 text-xs">Enterprise Platform</p>
            </div>
          </div>
          <h1 className="text-white text-4xl font-bold mb-4 leading-tight">
            Manage your entire
            <br />
            business from one place
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-md">
            Multi-company CRM, HR, Finance, Inventory and more — unified in a
            single enterprise platform.
          </p>
        </div>
        <div className="relative grid grid-cols-3 gap-4">
          {[
            ["15+", "Modules"],
            ["Multi", "Company"],
            ["Real-time", "Analytics"],
          ].map(([val, label]) => (
            <div
              key={label}
              className="rounded-xl p-4 border border-white/10 bg-white/05"
            >
              <p className="text-white font-bold text-xl">{val}</p>
              <p className="text-slate-400 text-sm">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6 lg:hidden">
              <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center">
                <Building2 size={16} className="text-white" />
              </div>
              <p className="font-bold" style={{ color: "var(--text-primary)" }}>
                OS Group CRM
              </p>
            </div>
            <h2
              className="text-2xl font-bold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Sign in to your account
            </h2>
            <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>
              Enter your credentials to access the platform
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="relative">
                <Mail
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-muted)" }}
                />
                <input
                  {...register("email")}
                  autoFocus
                  type="email"
                  className="input pl-9"
                  placeholder="you@company.com"
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="text-[11px] text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="relative">
                <Lock
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-muted)" }}
                />
                <input
                  {...register("password")
      
                  }
                  type={showPass ? "text" : "password"}
                  className="input pl-9 pr-9"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-muted)" }}
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-sm text-[var(--primary)] hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg w-full justify-center mt-2 disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
            <div className="text-center mt-6">
              <span style={{ color: "var(--text-muted)" }}>
                Don't have an account?
              </span>

              <button
                type="button"
                onClick={() => navigate("/register")}
                className="ml-2 text-[var(--primary)] hover:underline"
              >
                Register
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
