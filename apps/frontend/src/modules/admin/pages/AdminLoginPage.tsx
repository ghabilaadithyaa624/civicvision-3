import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, Sparkles, KeyRound } from "lucide-react";
import { Button, InputField, Alert } from "@civicvision/shared-ui";
import { useLoginMutation, useRegisterMutation } from "@/modules/auth/hooks/useAuth.hooks";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      adminSecret: "",
    },
  });

  const onSubmit = handleSubmit((values) => {
    setErrorMsg(null);
    if (isRegister) {
      if (!values.fullName) {
        setErrorMsg("Full name is required for registration");
        return;
      }
      if (!values.adminSecret) {
        setErrorMsg("Admin secret passphrase is required");
        return;
      }
      registerMutation.mutate(
        {
          fullName: values.fullName,
          email: values.email,
          password: values.password,
          role: "ADMIN",
          adminSecret: values.adminSecret,
        },
        {
          onSuccess: () => navigate("/admin/dashboard"),
          onError: (err: unknown) => {
            const error = err as { response?: { data?: { message?: string } } };
            setErrorMsg(error.response?.data?.message || "Admin registration failed.");
          },
        }
      );
    } else {
      loginMutation.mutate(
        {
          email: values.email,
          password: values.password,
        },
        {
          onSuccess: (res) => {
            if (res.user.role !== "ADMIN") {
              setErrorMsg("Access denied. You do not have administrator permissions.");
            } else {
              navigate("/admin/dashboard");
            }
          },
          onError: () => {
            setErrorMsg("Invalid email or password.");
          },
        }
      );
    }
  });

  return (
    <div className="min-h-screen bg-[#070a13] flex flex-col justify-center items-center px-4 relative overflow-hidden select-none">
      {/* Glow overlays */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-rose-500/5 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#0f172a]/80 border border-slate-800/80 rounded-3xl p-8 shadow-2xl backdrop-blur-xl z-10 relative">
        {/* Animated accent border */}
        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-rose-500/60 to-transparent" />

        <div className="flex flex-col items-center text-center mb-8">
          <div className="p-3.5 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-4 animate-pulse">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Admin Portal</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-[280px]">
            Restricted access portal for CivicVision system administrators.
          </p>
        </div>

        {/* Toggle Mode */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950/60 border border-slate-800 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setErrorMsg(null);
            }}
            className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              !isRegister ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setErrorMsg(null);
            }}
            className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isRegister ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Register Admin
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          {errorMsg && <Alert variant="error">{errorMsg}</Alert>}

          {isRegister && (
            <InputField
              label="Full Name"
              type="text"
              error={errors.fullName?.message}
              {...register("fullName")}
            />
          )}

          <InputField
            label="Email"
            type="email"
            error={errors.email?.message}
            {...register("email")}
          />

          <InputField
            label="Password"
            type="password"
            error={errors.password?.message}
            {...register("password")}
          />

          {isRegister && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Admin Secret Passphrase</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Enter secret passphrase"
                  className="w-full bg-[#05070e] border border-slate-800 focus:border-rose-500 focus:ring-rose-500/20 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 outline-none"
                  {...register("adminSecret")}
                />
                <KeyRound className="absolute right-3 top-2.5 h-4 w-4 text-slate-500" />
              </div>
            </div>
          )}

          <Button
            type="submit"
            isLoading={loginMutation.isPending || registerMutation.isPending}
            className="w-full bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-bold border-none shadow-md shadow-rose-900/20 rounded-xl py-2.5 text-xs transition-all mt-4"
          >
            {isRegister ? "Register Administrator" : "Authenticate admin"}
          </Button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-mono">
          <Sparkles className="h-3.5 w-3.5 text-rose-500" />
          <span>SECURE ENDPOINT · MULTI-FACTOR PATTERN</span>
        </div>
      </div>
    </div>
  );
}
