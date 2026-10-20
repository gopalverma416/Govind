import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { API_BASE } from '../lib/api';
import { Alert, AuthShell, Button, Field, Input } from './site/ui';
import PageMeta from './site/PageMeta';

const API_URL = `${API_BASE}/api/auth`;
const MIN_PASSWORD = 8;
const STEPS = ['Email', 'Code', 'Password'];

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');

  const fail = (text) => {
    setMessage(text);
    setStatus('error');
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return fail('Enter a valid email address.');
    setLoading(true);
    try {
      await axios.post(`${API_URL}/send-otp`, { email });
      setMessage(`We’ve sent a code to ${email}.`);
      setStatus('success');
      setStep(2);
    } catch (error) {
      fail(error.response?.status === 404 ? 'There’s no Govind Account for that email.' : 'We couldn’t send a code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) return fail('Enter the code we sent to your email.');
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/verify-otp`, { email, otp: otp.toString() });
      setToken(response.data.token || '');
      setMessage('');
      setStatus('');
      setStep(3);
    } catch {
      fail('That code isn’t right, or it has expired. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < MIN_PASSWORD) return fail(`Choose a password with at least ${MIN_PASSWORD} characters.`);
    if (newPassword !== confirmPassword) return fail('Those passwords don’t match.');
    if (!token) return fail('Your session has expired. Please start again.');
    setLoading(true);
    try {
      await axios.post(`${API_URL}/reset-password`, { token, newPassword });
      setMessage('');
      setStatus('');
      setStep(4);
    } catch (error) {
      fail(error.response ? 'Your reset link has expired. Please start again.' : 'We can’t reach Govind right now. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Reset your password."
      subtitle={step < 4 ? 'We’ll email you a code to confirm it’s you.' : undefined}
      footer={
        step < 4 && (
          <>
            Remembered it? <Link to="/login" className="text-brand hover:underline">Sign in<span aria-hidden="true"> ›</span></Link>
          </>
        )
      }
    >
      <PageMeta title="Reset Password" />

      {step < 4 && (
        <ol className="mb-6 flex gap-2" aria-label="Progress">
          {STEPS.map((label, i) => (
            <li key={label} className="flex-1">
              <div className={`h-1 rounded-full transition-colors ${step > i ? 'bg-brand' : 'bg-black/10'}`} />
              <p className={`mt-1.5 text-[12px] ${step === i + 1 ? 'font-semibold text-ink' : 'text-muted'}`}>{label}</p>
            </li>
          ))}
        </ol>
      )}

      <Alert tone={status === 'success' ? 'success' : 'error'} className="mb-5">{message}</Alert>

      {step === 1 && (
        <form onSubmit={handleSendOtp} className="space-y-5">
          <Field label="Email address" htmlFor="email">
            <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
          </Field>
          <Button type="submit" loading={loading} loadingText="Sending…" className="w-full">Send code</Button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyOtp} className="space-y-5">
          <Field label="Verification code" htmlFor="otp" hint="Check your inbox, and your spam folder.">
            <Input id="otp" inputMode="numeric" autoComplete="one-time-code" required value={otp} onChange={(e) => setOtp(e.target.value)} className="text-center text-[24px] tracking-[0.4em]" />
          </Field>
          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={() => setStep(1)} disabled={loading} className="flex-1">Back</Button>
            <Button type="submit" loading={loading} loadingText="Verifying…" className="flex-[2]">Verify code</Button>
          </div>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleResetPassword} className="space-y-5">
          <Field label="New password" htmlFor="new-password" hint={`At least ${MIN_PASSWORD} characters.`}>
            <Input id="new-password" type="password" autoComplete="new-password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </Field>
          <Field label="Confirm password" htmlFor="confirm-password">
            <Input id="confirm-password" type="password" autoComplete="new-password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </Field>
          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={() => setStep(2)} disabled={loading} className="flex-1">Back</Button>
            <Button type="submit" loading={loading} loadingText="Resetting…" className="flex-[2]">Reset password</Button>
          </div>
        </form>
      )}

      {step === 4 && (
        <div className="py-4 text-center">
          <CheckCircle2 size={48} className="mx-auto text-emerald-500" />
          <h2 className="mt-4 text-[21px] font-semibold text-ink">Your password has been reset.</h2>
          <p className="mt-1 text-[17px] text-muted">Sign in with your new password to continue.</p>
          <Link to="/login" className="btn-filled mt-6 w-full">Sign in</Link>
        </div>
      )}
    </AuthShell>
  );
};

export default ForgotPassword;
