import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building2, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { authAPI } from "@/api/auth.api";

const schema = z.object({
  otp: z.string().min(6, "OTP must be 6 digits"),
});

export default function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";

  const resetPassword = location.state?.resetPassword || false;

  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      await authAPI.verifyOTP({
        email,
        otp: data.otp,
      });

      toast.success("OTP verified successfully!");

      if (resetPassword) {
        navigate("/reset-password", {
          state: {
            email,
          },
        });
      } else {
        navigate("/login");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] p-6">
      <div className="w-full max-w-md rounded-xl border p-8 bg-[var(--card-bg)]">
        <div className="flex items-center gap-2 mb-6">
          <Building2 className="text-[var(--primary)]" />
          <h2 className="text-2xl font-bold">Verify Email</h2>
        </div>

        <p className="mb-5 text-sm text-gray-500">
          Enter the OTP sent to
          <br />
          <strong>{email}</strong>
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label>OTP</label>

            <div className="relative">
              <ShieldCheck size={16} className="absolute left-3 top-3" />

              <input
                {...register("otp")}
                className="input pl-10"
                placeholder="Enter 6 digit OTP"
              />
            </div>

            {errors.otp && (
              <p className="text-red-500 text-sm">{errors.otp.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link to="/login" className="text-[var(--primary)]">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
