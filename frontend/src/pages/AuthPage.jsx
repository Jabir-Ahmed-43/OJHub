import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Code2, Mail, Lock, User, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { auth, googleProvider, signInWithPopup } from "../config/firebase";

const AuthPage = () => {
  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [pendingIdToken, setPendingIdToken] = useState("");
  const [googleUsername, setGoogleUsername] = useState("");
  const [googleFieldErrors, setGoogleFieldErrors] = useState({});

  const [loginForm, setLoginForm] = useState({ identifier: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const { login } = useAuth();
  const navigate = useNavigate();

  const resetErrors = () => {
    setError("");
    setFieldErrors({});
    setGoogleFieldErrors({});
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    resetErrors();
  };

  const handleGoogleSignIn = async () => {
    resetErrors();
    setGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      
      const res = await api.post("/auth/firebase-login", { idToken });
      
      if (res.data.isNewUser) {
        setIsNewUser(true);
        setPendingIdToken(idToken);
        // Pre-fill user suggestion
        const suggestedUsername = (result.user.displayName || result.user.email.split("@")[0])
          .toLowerCase()
          .replace(/[^a-z0-9_]/g, "")
          .substring(0, 20);
        setGoogleUsername(suggestedUsername);
      } else {
        login(res.data.user, res.data.token);
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Google sign in error:", err);
      const errMsg = err.response?.data?.message || err.message || "Google sign in failed.";
      setError(errMsg);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleUsernameSubmit = async (e) => {
    e.preventDefault();
    setGoogleFieldErrors({});
    setError("");
    setLoading(true);

    const sanitizedUsername = googleUsername.trim();
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(sanitizedUsername)) {
      setGoogleFieldErrors({ username: "Username must be 3-20 characters long and contain only letters, numbers, or underscores." });
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/auth/firebase-login", {
        idToken: pendingIdToken,
        username: sanitizedUsername,
      });

      login(res.data.user, res.data.token);
      navigate("/dashboard");
    } catch (err) {
      const data = err.response?.data;
      if (data?.field) {
        setGoogleFieldErrors({ [data.field]: data.message });
      } else {
        setError(data?.message || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    resetErrors();
    setLoading(true);
    try {
      const res = await api.post("/auth/login", loginForm);
      login(res.data.user, res.data.token);
      navigate("/dashboard");
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    resetErrors();

    if (registerForm.password !== registerForm.confirmPassword) {
      setFieldErrors({ confirmPassword: "Passwords do not match." });
      return;
    }
    if (registerForm.password.length < 6) {
      setFieldErrors({ password: "Password must be at least 6 characters." });
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/register", {
        username: registerForm.username,
        email: registerForm.email,
        password: registerForm.password,
      });
      login(res.data.user, res.data.token);
      navigate("/dashboard");
    } catch (err) {
      const data = err.response?.data;
      if (data?.field) {
        // Gracefully surface "Username already exists" / "Email already exists"
        setFieldErrors({ [data.field]: data.message });
      } else {
        setError(data?.message || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-950">
      {/* Left branding panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-900 via-slate-900 to-slate-950 p-12 lg:flex">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-brand-600/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-brand-500/10 blur-3xl" />

        <Link to="/" className="relative z-10 flex items-center gap-2 text-2xl font-bold text-white">
          <Code2 className="h-8 w-8 text-brand-400" />
          OJ<span className="text-brand-400">Hub</span>
        </Link>

        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-bold leading-tight text-white">
            Sharpen your skills.
            <br />
            Rise to the top.
          </h1>
          <p className="max-w-md text-slate-400">
            Join thousands of competitive programmers solving problems, competing in
            contests, and tracking their growth on OJHub.
          </p>
          <div className="flex gap-8 pt-4 text-sm text-slate-300">
            <div>
              <p className="text-2xl font-bold text-brand-400">2,500+</p>
              <p>Problems</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-brand-400">40K+</p>
              <p>Coders</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-brand-400">Weekly</p>
              <p>Contests</p>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-xs text-slate-500">© {new Date().getFullYear()} OJHub. All rights reserved.</p>
      </div>

      {/* Right form panel */}
      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <Code2 className="h-7 w-7 text-brand-500" />
            <span className="text-xl font-bold text-white">
              OJ<span className="text-brand-500">Hub</span>
            </span>
          </div>

          {isNewUser ? (
            <div className="space-y-4">
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-white">Choose a Username</h2>
                <p className="mt-1 text-sm text-slate-400">
                  To complete your registration, please choose a unique username for your OJHub account.
                </p>
              </div>

              {error && (
                <div className="mb-4 flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-400">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleGoogleUsernameSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-300">Username</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      required
                      minLength={3}
                      maxLength={20}
                      value={googleUsername}
                      onChange={(e) => {
                        setGoogleUsername(e.target.value);
                        setGoogleFieldErrors((f) => ({ ...f, username: undefined }));
                      }}
                      className={`w-full rounded-lg border bg-slate-900 py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-brand-500 ${
                        googleFieldErrors.username ? "border-rose-500" : "border-slate-700"
                      }`}
                      placeholder="coder_123"
                    />
                  </div>
                  {googleFieldErrors.username && (
                    <p className="mt-1 text-xs text-rose-400">{googleFieldErrors.username}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:opacity-60"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Complete Registration
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsNewUser(false);
                    setPendingIdToken("");
                    resetErrors();
                  }}
                  className="w-full text-center text-sm font-semibold text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
              </form>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="mb-8 flex rounded-lg border border-slate-800 bg-slate-900 p-1">
                <button
                  onClick={() => switchMode("login")}
                  className={`flex-1 rounded-md py-2 text-sm font-semibold transition ${
                    mode === "login" ? "bg-brand-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => switchMode("register")}
                  className={`flex-1 rounded-md py-2 text-sm font-semibold transition ${
                    mode === "register" ? "bg-brand-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Register
                </button>
              </div>

              {error && (
                <div className="mb-4 flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-400">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {mode === "login" ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-300">
                      Username or Email
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        required
                        value={loginForm.identifier}
                        onChange={(e) => setLoginForm({ ...loginForm, identifier: e.target.value })}
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-brand-500"
                        placeholder="tourist"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-300">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-500 outline-none transition focus:border-brand-500"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:opacity-60"
                  >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Sign In
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-300">Username</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        required
                        minLength={3}
                        value={registerForm.username}
                        onChange={(e) => {
                          setRegisterForm({ ...registerForm, username: e.target.value });
                          setFieldErrors((f) => ({ ...f, username: undefined }));
                        }}
                        className={`w-full rounded-lg border bg-slate-900 py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-brand-500 ${
                          fieldErrors.username ? "border-rose-500" : "border-slate-700"
                        }`}
                        placeholder="coder_123"
                      />
                    </div>
                    {fieldErrors.username && (
                      <p className="mt-1 text-xs text-rose-400">{fieldErrors.username}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-300">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        type="email"
                        required
                        value={registerForm.email}
                        onChange={(e) => {
                          setRegisterForm({ ...registerForm, email: e.target.value });
                          setFieldErrors((f) => ({ ...f, email: undefined }));
                        }}
                        className={`w-full rounded-lg border bg-slate-900 py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-brand-500 ${
                          fieldErrors.email ? "border-rose-500" : "border-slate-700"
                        }`}
                        placeholder="you@example.com"
                      />
                    </div>
                    {fieldErrors.email && <p className="mt-1 text-xs text-rose-400">{fieldErrors.email}</p>}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-300">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={registerForm.password}
                        onChange={(e) => {
                          setRegisterForm({ ...registerForm, password: e.target.value });
                          setFieldErrors((f) => ({ ...f, password: undefined }));
                        }}
                        className={`w-full rounded-lg border bg-slate-900 py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-500 outline-none transition focus:border-brand-500 ${
                          fieldErrors.password ? "border-rose-500" : "border-slate-700"
                        }`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {fieldErrors.password && (
                      <p className="mt-1 text-xs text-rose-400">{fieldErrors.password}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-300">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={registerForm.confirmPassword}
                        onChange={(e) => {
                          setRegisterForm({ ...registerForm, confirmPassword: e.target.value });
                          setFieldErrors((f) => ({ ...f, confirmPassword: undefined }));
                        }}
                        className={`w-full rounded-lg border bg-slate-900 py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-brand-500 ${
                          fieldErrors.confirmPassword ? "border-rose-500" : "border-slate-700"
                        }`}
                        placeholder="••••••••"
                      />
                    </div>
                    {fieldErrors.confirmPassword && (
                      <p className="mt-1 text-xs text-rose-400">{fieldErrors.confirmPassword}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:opacity-60"
                  >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Create Account
                  </button>
                </form>
              )}

              {/* Divider and Google Button */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-slate-950 px-2 text-slate-500">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading || loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-800 bg-slate-900 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 hover:border-slate-700 disabled:opacity-60"
              >
                {googleLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      fill="#EA4335"
                    />
                  </svg>
                )}
                Sign In with Google
              </button>

              <p className="mt-6 text-center text-sm text-slate-500">
                {mode === "login" ? (
                  <>
                    Don't have an account?{" "}
                    <button onClick={() => switchMode("register")} className="font-semibold text-brand-400 hover:underline">
                      Register
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button onClick={() => switchMode("login")} className="font-semibold text-brand-400 hover:underline">
                      Login
                    </button>
                  </>
                )}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
