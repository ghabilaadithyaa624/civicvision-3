import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { loginFormSchema, type LoginFormValues } from "../auth.schema";
import { useLoginMutation } from "../hooks/useAuth.hooks";
import { Button, InputField, Alert } from "@civicvision/shared-ui";

export function LoginPage() {
  const navigate = useNavigate();
  const loginMutation = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
  });

  const onSubmit = handleSubmit((values) => {
    loginMutation.mutate(values, {
      onSuccess: () => navigate("/dashboard"),
    });
  });

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4">
      <div className="mb-6 flex items-center gap-2">
        <LogIn className="h-6 w-6 text-brand-600" />
        <h1 className="text-2xl font-semibold text-slate-900">Sign in</h1>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        {loginMutation.isError && (
          <Alert variant="error">Invalid email or password. Please try again.</Alert>
        )}

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
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />

        <Button type="submit" isLoading={loginMutation.isPending} className="mt-2">
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="font-medium text-brand-600 hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
