import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate, useLocation } from "react-router";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/app/dashboard";

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    const result = await login(formData.email, formData.password);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setErrors({ submit: result.error });
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#475467] hover:text-[#182230]">
          <span aria-hidden="true">←</span> Back to home
        </Link>
        <div className="rounded-2xl border border-[#e6e8ec] bg-white p-7 shadow-[0_12px_30px_rgba(16,24,40,.06)] sm:p-9">
          {/* Header */}
          <div className="text-center mb-8">
            <img src="/project-pulse-mark.svg" alt="Project Pulse" className="mx-auto h-12 w-12" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900 tracking-tight">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to continue to{" "}
              <span className="text-primary-600 font-semibold">Project Pulse</span>
            </p>
          </div>

          {/* Server Error */}
          {errors.submit && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg text-red-700 text-sm flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="group">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                Email address
              </label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400 group-focus-within:text-primary-600 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                    />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full pl-12 pr-4 py-3 rounded-xl border-2 ${
                    errors.email
                      ? "border-red-400 focus:ring-red-500 bg-red-50"
                      : "border-gray-200 focus:border-primary-500 focus:ring-primary-500"
                  } shadow-sm placeholder-gray-400 text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 sm:text-sm font-medium`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="group">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                Password
              </label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400 group-focus-within:text-primary-600 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full pl-12 pr-4 py-3 rounded-xl border-2 ${
                    errors.password
                      ? "border-red-400 focus:ring-red-500 bg-red-50"
                      : "border-gray-200 focus:border-primary-500 focus:ring-primary-500"
                  } shadow-sm placeholder-gray-400 text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 sm:text-sm font-medium`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-white font-semibold text-sm tracking-wide bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-200 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm">
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5 mr-2 -ml-1 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                  Sign in
                </>
              )}
            </button>
          </form>

          {/* Sign up link */}
          <p className="mt-8 text-center text-sm text-gray-600">
            New to Project Pulse?{" "}
            <Link
              to="/register"
              className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
              Create an account
            </Link>
          </p>
        </div>

        <div className="mt-6 flex items-start gap-2 rounded-xl border border-[#e6e8ec] bg-white px-4 py-3 text-xs leading-5 text-[#667085]">
          <span className="mt-0.5 text-primary-600">●</span>
          Your workspace is protected by your account credentials.
        </div>
      </div>
    </div>
  );
};

export default Login;
