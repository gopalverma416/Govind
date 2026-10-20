import React, { useState } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { API_BASE } from "../lib/api";
import { Alert, AuthShell, Button, Divider, Field, Input, Select } from "./site/ui";
import GoogleButton from "./site/GoogleButton";
import PageMeta from "./site/PageMeta";

const MIN_PASSWORD = 8;

const Section = ({ title, children }) => (
  <fieldset className="space-y-4">
    <legend className="mb-3 text-[17px] font-semibold text-ink">{title}</legend>
    {children}
  </fieldset>
);

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    weight: "",
    gender: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const destination = location.state?.from?.pathname || "/account";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const signedUp = (token) => {
    localStorage.setItem("token", token);
    navigate(destination, { replace: true });
  };

  const profileComplete = formData.age && formData.weight && formData.gender && formData.address.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (formData.password.length < MIN_PASSWORD) {
      setError(`Choose a password with at least ${MIN_PASSWORD} characters.`);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/api/auth/signup`, formData);
      signedUp(res.data.token);
    } catch (err) {
      const msg = err.response?.data?.msg;
      setError(
        msg === "User already exists" ? (
          <>
            There’s already a Govind Account for this email. <Link to="/login" className="font-semibold underline">Sign in</Link> instead.
          </>
        ) : (
          msg || "We couldn’t create your account. Please try again."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async (credential) => {
    setError(null);
    if (!profileComplete) {
      setError("Fill in “About you” and your delivery address first, then continue with Google.");
      return;
    }
    try {
      const { age, gender, address, weight } = formData;
      const res = await axios.post(`${API_BASE}/api/auth/google-signup`, { token: credential, age, gender, address, weight });
      signedUp(res.data.token);
    } catch (err) {
      setError(err.response?.data?.msg || "We couldn’t create your account with Google. Please try again.");
    }
  };

  return (
    <AuthShell
      title="Create your Govind Account."
      subtitle="One account for your bag, your orders and your bespoke designs."
      footer={
        <>
          Already have a Govind Account?{" "}
          <Link to="/login" className="text-brand hover:underline">Sign in<span aria-hidden="true"> ›</span></Link>
        </>
      }
    >
      <PageMeta title="Create Account" />
      <form onSubmit={handleSubmit} className="space-y-8">
        <Alert>{error}</Alert>

        <Section title="Your account">
          <Field label="Full name" htmlFor="name">
            <Input id="name" name="name" autoComplete="name" required maxLength={50} value={formData.name} onChange={handleChange} />
          </Field>
          <Field label="Email address" htmlFor="email">
            <Input id="email" name="email" type="email" autoComplete="email" required value={formData.email} onChange={handleChange} placeholder="name@example.com" />
          </Field>
          <Field label="Password" htmlFor="password" hint={`At least ${MIN_PASSWORD} characters.`}>
            <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={MIN_PASSWORD} value={formData.password} onChange={handleChange} />
          </Field>
        </Section>

        <Section title="About you">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Age" htmlFor="age">
              <Input id="age" name="age" type="number" inputMode="numeric" min="1" max="120" required value={formData.age} onChange={handleChange} />
            </Field>
            <Field label="Weight (kg)" htmlFor="weight">
              <Input id="weight" name="weight" type="number" inputMode="decimal" min="1" required value={formData.weight} onChange={handleChange} />
            </Field>
          </div>
          <Field label="Gender" htmlFor="gender">
            <Select id="gender" name="gender" required value={formData.gender} onChange={handleChange}>
              <option value="" disabled>Select</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </Select>
          </Field>
        </Section>

        <Section title="Delivery address">
          <Field label="Address" htmlFor="address">
            <Input id="address" name="address" autoComplete="street-address" required value={formData.address} onChange={handleChange} placeholder="House no., street, city, pincode" />
          </Field>
        </Section>

        <Button type="submit" loading={loading} loadingText="Creating your account…" className="w-full">
          Create account
        </Button>
      </form>

      <Divider>or</Divider>
      <p className="mb-3 text-center text-[12px] text-muted">Use Google for your name and email. We’ll use the details above for the rest.</p>
      <GoogleButton text="signup_with" onCredential={handleGoogle} onError={() => setError("Google sign-up was cancelled.")} />
    </AuthShell>
  );
};

export default Signup;
