import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router";
import { communityService } from "../services/communityService";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    community: "",
  });
  const [communities, setCommunities] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingCommunities, setLoadingCommunities] = useState(true);

  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/app/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const loadCommunities = async () => {
      try {
        const communitiesData = await communityService.getCommunities();
        setCommunities(communitiesData.communities);
      } catch (error) {
        setErrors({ communities: error.message });
      } finally {
        setLoadingCommunities(false);
      }
    };

    loadCommunities();
  }, []);

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

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.community) {
      newErrors.community = "Please select a community";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    const registrationData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      communitySubdomain: formData.community,
    };

    const result = await register(registrationData);

    if (result.success) {
      navigate("/dashboard", { replace: true });
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
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <img src="/project-pulse-mark.svg" alt="Project Pulse" className="mx-auto h-12 w-12" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900 tracking-tight">
              Join Project Pulse
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Track issues, collaborate, and build better communities
            </p>
          </div>

          {/* Global Error */}
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={formData.name}
                onChange={handleChange}
                className={`mt-1 block w-full px-4 py-3 rounded-xl border ${
                  errors.name
                    ? "border-red-400 focus:ring-red-500"
                    : "border-gray-200 focus:border-primary-500 focus:ring-primary-500"
                } shadow-sm placeholder-gray-400 text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 sm:text-sm`}
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                className={`mt-1 block w-full px-4 py-3 rounded-xl border ${
                  errors.email
                    ? "border-red-400 focus:ring-red-500"
                    : "border-gray-200 focus:border-primary-500 focus:ring-primary-500"
                } shadow-sm placeholder-gray-400 text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 sm:text-sm`}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.email}</p>
              )}
            </div>

            {/* Community Dropdown */}
            <div>
              <label htmlFor="community" className="block text-sm font-semibold text-gray-700">
                Community
              </label>
              <select
                id="community"
                name="community"
                value={formData.community}
                onChange={handleChange}
                disabled={loadingCommunities}
                className={`mt-1 block w-full px-4 py-3 rounded-xl border ${
                  errors.community
                    ? "border-red-400 focus:ring-red-500"
                    : "border-gray-200 focus:border-primary-500 focus:ring-primary-500"
                } shadow-sm text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 sm:text-sm disabled:bg-gray-50 disabled:cursor-not-allowed`}>
                <option value="">
                  {loadingCommunities ? "Loading communities..." : "Select a community"}
                </option>
                {communities?.map((community) => (
                  <option key={community._id} value={community.subdomain}>
                    {community.name}
                  </option>
                ))}
              </select>
              {errors.community && (
                <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.community}</p>
              )}
              {errors.communities && (
                <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.communities}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                className={`mt-1 block w-full px-4 py-3 rounded-xl border ${
                  errors.password
                    ? "border-red-400 focus:ring-red-500"
                    : "border-gray-200 focus:border-primary-500 focus:ring-primary-500"
                } shadow-sm placeholder-gray-400 text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 sm:text-sm`}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`mt-1 block w-full px-4 py-3 rounded-xl border ${
                  errors.confirmPassword
                    ? "border-red-400 focus:ring-red-500"
                    : "border-gray-200 focus:border-primary-500 focus:ring-primary-500"
                } shadow-sm placeholder-gray-400 text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 sm:text-sm`}
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || loadingCommunities}
              className="group relative w-full flex justify-center py-3.5 px-4 rounded-xl text-white font-semibold text-sm tracking-wide bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-200 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm">
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
                  Creating your account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <p className="mt-8 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
