import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE } from "../lib/api";
import { getUserIdFromToken } from "../utils/auth";
import { Alert, Button, Card, Field, Input, Select } from "./site/ui";
import CheckoutSteps from "./site/CheckoutSteps";
import PageMeta from "./site/PageMeta";

const UserDetailsForm = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    phone: "",
    street: "",
    district: "",
    pincode: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const userId = location.state?.userId || getUserIdFromToken();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const response = await axios.post(`${API_BASE}/api/user-details`, { userId, ...formData });
      if (response.status === 201) {
        navigate("/payment", { state: { userId, formData } });
      }
    } catch (err) {
      console.error("Error submitting user details:", err);
      setError("We couldn’t save your delivery details. Please check them and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-mist px-4 pb-16 pt-24 md:pt-28">
      <PageMeta title="Delivery Details" />
      <div className="mx-auto max-w-[560px]">
        <CheckoutSteps current={1} />
        <h1 className="text-center text-[32px] font-semibold leading-[1.125] text-ink md:text-[40px]">Where should we deliver?</h1>
        <p className="mb-8 mt-2 text-center text-[17px] text-muted">Every Govind order is fully insured until it reaches you.</p>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-5">
            <Alert>{error}</Alert>
            <div className="grid grid-cols-2 gap-4">
              <Field label="First name" htmlFor="firstName">
                <Input id="firstName" name="firstName" autoComplete="given-name" required value={formData.firstName} onChange={handleChange} />
              </Field>
              <Field label="Last name" htmlFor="lastName">
                <Input id="lastName" name="lastName" autoComplete="family-name" required value={formData.lastName} onChange={handleChange} />
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
            <Field label="Mobile number" htmlFor="phone" hint="We’ll call this number to confirm delivery.">
              <Input id="phone" name="phone" type="tel" inputMode="numeric" autoComplete="tel-national" pattern="[6-9][0-9]{9}" title="A 10-digit Indian mobile number" maxLength={10} required value={formData.phone} onChange={handleChange} placeholder="10-digit mobile number" />
            </Field>
            <Field label="Street address" htmlFor="street">
              <Input id="street" name="street" autoComplete="street-address" required value={formData.street} onChange={handleChange} placeholder="House no., building, street" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="City / District" htmlFor="district">
                <Input id="district" name="district" autoComplete="address-level2" required value={formData.district} onChange={handleChange} />
              </Field>
              <Field label="PIN code" htmlFor="pincode">
                <Input id="pincode" name="pincode" inputMode="numeric" autoComplete="postal-code" pattern="[1-9][0-9]{5}" title="A 6-digit PIN code" maxLength={6} required value={formData.pincode} onChange={handleChange} />
              </Field>
            </div>
            <Button type="submit" loading={submitting} loadingText="Saving…" className="w-full">Continue to review</Button>
          </form>
        </Card>
      </div>
    </main>
  );
};

export default UserDetailsForm;
