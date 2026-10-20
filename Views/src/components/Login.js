import React, { useState } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { API_BASE } from "../lib/api";
import { Alert, AuthShell, Button, Divider, Field, Input } from "./site/ui";
import GoogleButton from "./site/GoogleButton";
import PageMeta from "./site/PageMeta";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  // Return to the page that asked the shopper to sign in, or their account
  const destination = location.state?.from?.pathname || "/account";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const signedIn = (token) => {
    localStorage.setItem("token", token);
    navigate(destination, { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_BASE}/api/auth/login`, formData);
      if (res.data.token) signedIn(res.data.token);
      else setError("We couldn’t sign you in. Please try again.");
    } catch (err) {
      setError(err.response?.status === 400 ? "That email or password isn’t right." : "We can’t reach Govind right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async (credential) => {
    setError(null);
    try {
      const res = await axios.post(`${API_BASE}/api/auth/google-login`, { token: credential });
      signedIn(res.data.token);
    } catch {
      setError(
        <>
          We couldn’t sign you in with Google. New to Govind? <Link to="/signup" className="font-semibold underline">Create an account</Link> first.
        </>
      );
    }
  };

  return (
    <AuthShell
      title="Sign in to Govind."
      subtitle="Your bag, orders and saved details are waiting."
      footer={
        <>
          New to Govind?{" "}
          <Link to="/signup" className="text-brand hover:underline">Create your account<span aria-hidden="true"> ›</span></Link>
        </>
      }
    >
      <PageMeta title="Sign In" />
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <Alert>{error}</Alert>

        <Field label="Email address" htmlFor="email">
          <Input id="email" name="email" type="email" autoComplete="email" required value={formData.email} onChange={handleChange} placeholder="name@example.com" />
        </Field>

        <Field label="Password" htmlFor="password">
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={handleChange}
              className="pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-muted hover:text-ink"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </Field>

        <div className="flex justify-end">
          <Link to="/forget" className="text-[14px] text-brand hover:underline">Forgotten your password?</Link>
        </div>

        <Button type="submit" loading={loading} loadingText="Signing in…" className="w-full" disabled={!formData.email || !formData.password}>
          Sign in
        </Button>
      </form>

      <Divider>or</Divider>
      <GoogleButton text="signin_with" onCredential={handleGoogle} onError={() => setError("Google sign-in was cancelled.")} />
    </AuthShell>
  );
};

export default Login;
