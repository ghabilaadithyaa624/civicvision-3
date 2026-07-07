import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { registerFormSchema, type RegisterFormValues } from "../auth.schema";
import { useRegisterMutation } from "../hooks/useAuth.hooks";
import { Button, InputField, Alert } from "@civicvision/shared-ui";

export function RegisterPage() {
  const navigate = useNavigate();
  const registerMutation = useRegisterMutation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      role: "CITIZEN",
    },
  });

  const watchRole = watch("role", "CITIZEN");

  const onSubmit = handleSubmit((values) => {
    registerMutation.mutate(values, {
      onSuccess: () => navigate("/dashboard"),
    });
  });

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4">
      <div className="mb-6 flex items-center gap-2">
        <UserPlus className="h-6 w-6 text-brand-600" />
        <h1 className="text-2xl font-bold text-white">Create an account</h1>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        {registerMutation.isError && (
          <Alert variant="error">
            {(registerMutation.error as { response?: { data?: { message?: string } } })
              ?.response?.data?.message ?? "Registration failed. Please try again."}
          </Alert>
        )}

        <InputField
          label="Full name"
          autoComplete="name"
          error={errors.fullName?.message}
          {...register("fullName")}
        />
        <InputField
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <InputField
          label="Password"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">I am registering as a</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setValue("role", "CITIZEN")}
              className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all cursor-pointer ${
                watchRole === "CITIZEN"
                  ? "border-brand-500 bg-brand-500/10 text-brand-400 font-bold"
                  : "border-slate-800 bg-[#0f172a]/50 text-slate-400 hover:border-slate-700"
              }`}
            >
              <span className="text-lg">🏡</span>
              <span className="text-xs">Citizen</span>
            </button>
            <button
              type="button"
              onClick={() => setValue("role", "FIELD_AGENT")}
              className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all cursor-pointer ${
                watchRole === "FIELD_AGENT"
                  ? "border-brand-500 bg-brand-500/10 text-brand-400 font-bold"
                  : "border-slate-800 bg-[#0f172a]/50 text-slate-400 hover:border-slate-700"
              }`}
            >
              <span className="text-lg">🛠️</span>
              <span className="text-xs">Field Agent</span>
            </button>
          </div>
        </div>

        <Button type="submit" isLoading={registerMutation.isPending} className="mt-2">
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-brand-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
