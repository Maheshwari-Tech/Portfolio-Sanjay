"use client";

import Link from "next/link";
import { FormEvent, KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseBrowserClient, normalizeIndianPhone } from "../supabaseClient";
import { apiFetch } from "../apiClient";
import CaptchaChallenge, { type CaptchaProvider } from "../CaptchaChallenge";
import CountryCodePicker from "../CountryCodePicker";
import Wordmark from "../Wordmark";

export default function LoginPage({ adminMode = false }: { adminMode?: boolean }) {
  const [authMode, setAuthMode] = useState<"signIn" | "signUp">("signIn");
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [step, setStep] = useState<"password" | "otp" | "profile">("password");
  const [verifiedSession, setVerifiedSession] = useState<Session | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaResetKey, setCaptchaResetKey] = useState(0);
  const [trialVerificationPhone, setTrialVerificationPhone] = useState<string | null>(null);
  const [trialValidationCode, setTrialValidationCode] = useState<string | null>(null);
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const authTabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const captchaProviderValue = process.env.NEXT_PUBLIC_CAPTCHA_PROVIDER?.toLowerCase();
  const captchaProvider = captchaProviderValue === "hcaptcha" || captchaProviderValue === "turnstile" ? captchaProviderValue as CaptchaProvider : null;
  const captchaSiteKey = process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY || "";
  const captchaRequested = Boolean(captchaProviderValue || captchaSiteKey);
  const captchaConfigured = Boolean(captchaProvider && captchaSiteKey);
  const requestedNext = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("next") : null;
  const next = requestedNext?.startsWith("/") ? requestedNext : adminMode ? "/admin" : "/";

  const selectAuthMode = (mode: "signIn" | "signUp") => {
    setAuthMode(mode);
    setStep("password");
    setStatus("");
    if (mode === "signIn") {
      setTrialVerificationPhone(null);
      setTrialValidationCode(null);
    } else {
      setPassword("");
    }
  };

  const handleAuthTabKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? 1 : event.key === "ArrowRight" ? (index + 1) % 2 : (index + 1) % 2;
    selectAuthMode(nextIndex === 0 ? "signIn" : "signUp");
    authTabRefs.current[nextIndex]?.focus();
  };

  useEffect(() => {
    stepHeadingRef.current?.focus();
  }, [authMode, step]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development" || captchaProviderValue !== "hcaptcha") return;
    if (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") return;
    const localUrl = new URL(window.location.href);
    localUrl.hostname = "portfolio.localtest.me";
    window.location.replace(localUrl.toString());
  }, [captchaProviderValue]);

  function finish(session: Session, displayName?: string) {
    const user = session.user;
    const storedUser = {
      id: user.id,
      name: displayName || user.user_metadata?.name || "Member",
      phone: user.phone,
      role: user.phone === "+918847472124" ? "admin" : "member",
    };
    localStorage.setItem("sanjay_portfolio_token", session.access_token);
    localStorage.setItem("sanjay_portfolio_user", JSON.stringify(storedUser));
    window.location.href = next;
  }

  function finishLocal(data: {token:string;user:{id:number;name:string;phone:string;role:string}}) {
    localStorage.setItem("sanjay_portfolio_token", data.token);
    localStorage.setItem("sanjay_portfolio_user", JSON.stringify(data.user));
    window.location.href = next;
  }

  const resetCaptcha = useCallback(() => {
    setCaptchaToken(null);
    setCaptchaResetKey((value) => value + 1);
  }, []);

  function captchaIsReady() {
    if (!captchaRequested) return true;
    if (!captchaConfigured) {
      setStatus("Security verification is not configured. Add the public CAPTCHA site key to .env.local.");
      return false;
    }
    if (!captchaToken) {
      setStatus("Complete the security verification before continuing.");
      return false;
    }
    return true;
  }

  const sendSmsOtp = useCallback(async (normalizedPhone: string) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      const response = await apiFetch("/auth/request-otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone: normalizedPhone }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Could not create a code.");
      setStep("otp");
      setStatus(data.message || "SMS code sent. Enter it below to continue.");
      return;
    }
    if (!captchaToken) throw new Error("Security verification expired. Complete it again before requesting an SMS code.");
    const { error } = await supabase.auth.signInWithOtp({ phone: normalizedPhone, options: { captchaToken } });
    resetCaptcha();
    if (error) throw error;
    setStep("otp");
    setStatus("SMS code sent. Enter the six-digit code to continue.");
  }, [captchaToken, resetCaptcha]);

  async function startTrialSignupVerification() {
    const normalizedPhone = normalizeIndianPhone(`${countryCode}${phone}`);
    if (!/^\+[1-9]\d{9,14}$/.test(normalizedPhone)) {
      setStatus("Enter a valid mobile number first.");
      return;
    }
    if (!captchaIsReady()) return;
    setBusy(true);
    setStatus("Starting phone verification call…");
    try {
      const response = await apiFetch("/auth/twilio/start-caller-id-verification", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone: normalizedPhone }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || data.message || "Could not start phone verification.");
      if (data.status === "verified" || data.verified === true) {
        setTrialVerificationPhone(null);
        setTrialValidationCode(null);
        await sendSmsOtp(normalizedPhone);
        return;
      }
      if (data.status !== "pending") throw new Error(data.detail || data.message || "Phone verification could not be started.");
      setTrialVerificationPhone(normalizedPhone);
      setTrialValidationCode(typeof data.validation_code === "string" ? data.validation_code : null);
      setStatus("Answer the Twilio call in English, then enter the validation code on your phone keypad.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "The phone verification service is unavailable.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!trialVerificationPhone) return;
    let active = true;
    let checking = false;
    const getVerificationStatus = async () => {
      let lastError: unknown;
      for (let attempt = 0; attempt < 3; attempt += 1) {
        try {
          const response = await apiFetch(`/auth/twilio/caller-id-verification-status?phone=${encodeURIComponent(trialVerificationPhone)}`);
          const data = await response.json();
          if (!response.ok) throw new Error(data.detail || "Could not check phone verification status.");
          return data;
        } catch (error) {
          lastError = error;
          if (attempt < 2) await new Promise<void>((resolve) => window.setTimeout(resolve, 500 * 2 ** attempt));
        }
      }
      throw lastError instanceof Error ? lastError : new Error("Could not check phone verification status.");
    };
    const checkVerification = async () => {
      if (checking) return;
      checking = true;
      try {
        const data = await getVerificationStatus();
        if (!active || !(data.status === "verified" && data.verified === true)) return;
        setTrialVerificationPhone(null);
        setTrialValidationCode(null);
        setBusy(true);
        setStatus("Phone verified. Sending your SMS code…");
        try {
          await sendSmsOtp(trialVerificationPhone);
        } catch (error) {
          setStatus(error instanceof Error ? error.message : "Could not send the SMS code.");
        } finally {
          if (active) setBusy(false);
        }
      } catch {
        if (active) setStatus("Still waiting for phone verification. We’ll keep checking every few seconds.");
      } finally {
        checking = false;
      }
    };
    void checkVerification();
    const interval = window.setInterval(() => void checkVerification(), 3000);
    return () => { active = false; window.clearInterval(interval); };
  }, [sendSmsOtp, trialVerificationPhone]);

  async function tryPassword(event: FormEvent) {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    setBusy(true);
    setStatus("Checking your password…");
    const normalizedPhone = normalizeIndianPhone(`${countryCode}${phone}`);
    if (!supabase) {
      try {
        const passwordResponse = await apiFetch("/auth/password", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phone:normalizedPhone,password})});
        if (passwordResponse.ok) { finishLocal(await passwordResponse.json()); return; }
        setStatus("Invalid mobile number or password.");
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "The login service is unavailable.");
      } finally { setBusy(false); }
      return;
    }
    if (!captchaIsReady()) { setBusy(false); return; }
    const { data, error } = await supabase.auth.signInWithPassword({
      phone: normalizedPhone,
      password,
      options: { captchaToken: captchaToken || undefined },
    });
    if (!error && data.session) {
      finish(data.session);
      return;
    }
    setBusy(false);
    resetCaptcha();
    if (error?.message.toLowerCase().includes("captcha")) {
      setStatus(error.message);
      return;
    }
    setStatus("Invalid mobile number or password.");
  }

  async function requestOtp() {
    const normalizedPhone = normalizeIndianPhone(`${countryCode}${phone}`);
    if (!/^\+[1-9]\d{9,14}$/.test(normalizedPhone)) {
      setStatus("Enter a valid mobile number first.");
      return;
    }
    const supabase = getSupabaseBrowserClient();
    setBusy(true);
    setStatus(authMode === "signUp" ? "Sending your verification code…" : "Requesting a one-time code…");
    if (!supabase) {
      try {
        const response = await apiFetch("/auth/request-otp", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phone:normalizedPhone})});
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || "Could not create a code.");
        setStep("otp");
        setStatus(data.message || (authMode === "signUp" ? "Verification code sent. Enter it below to create your account." : "A sign-in code was generated."));
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "The login service is unavailable.");
      } finally { setBusy(false); }
      return;
    }
    if (!captchaIsReady()) { setBusy(false); return; }
    const { error } = await supabase.auth.signInWithOtp({
      phone: normalizedPhone,
      options: { captchaToken: captchaToken || undefined },
    });
    setBusy(false);
    resetCaptcha();
    if (error) {
      setStatus(error.message);
      return;
    }
    setStep("otp");
    setStatus(authMode === "signUp" ? "Verification code sent. It expires in 30 minutes and can be used once." : "Code sent. It expires in 30 minutes and can be used once.");
  }

  async function verifyOtp(event: FormEvent) {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    setBusy(true);
    if (!supabase) {
      try {
        const response = await apiFetch("/auth/verify-otp", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phone:normalizeIndianPhone(`${countryCode}${phone}`),code:otp})});
        const data = await response.json();
        if (response.status === 428) { setStep("profile"); setStatus("Phone verified. Add your name to finish local signup."); return; }
        if (!response.ok) throw new Error(data.detail || "The code is invalid or expired.");
        finishLocal(data);
      } catch (error) { setStatus(error instanceof Error ? error.message : "The login service is unavailable."); }
      finally { setBusy(false); }
      return;
    }
    const { data, error } = await supabase.auth.verifyOtp({ phone: normalizeIndianPhone(`${countryCode}${phone}`), token: otp, type: "sms" });
    if (error || !data.session) {
      setBusy(false);
      setStatus(error?.message || "The code is invalid or expired.");
      return;
    }

    if (authMode === "signUp" || !data.user?.user_metadata?.name) {
      setVerifiedSession(data.session);
      setStep("profile");
      setBusy(false);
      setStatus("Phone verified. Add your name to complete your profile.");
      return;
    }
    finish(data.session);
  }

  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    setBusy(true);
    if (!supabase) {
      try {
        const response = await apiFetch("/auth/verify-otp", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phone:normalizeIndianPhone(`${countryCode}${phone}`),code:otp,name:name.trim()})});
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || "Could not complete signup.");
        finishLocal(data);
      } catch (error) { setStatus(error instanceof Error ? error.message : "The login service is unavailable."); setBusy(false); }
      return;
    }
    if (!verifiedSession) { setBusy(false); return; }
    const { error } = await supabase.auth.updateUser({ data: { name: name.trim() } });
    if (error) {
      setBusy(false);
      setStatus(error.message);
      return;
    }
    finish(verifiedSession, name.trim());
  }

  return (
    <main className="auth-page">
      <header className="article-nav">
        <Wordmark />
        <Link href="/">Back to portfolio</Link>
      </header>
      <section className="auth-shell">
        {!adminMode && step === "password" && <div className="auth-mode-switch" role="tablist" aria-label="Choose account action"><button ref={(element) => { authTabRefs.current[0] = element; }} id="sign-in-tab" type="button" role="tab" aria-selected={authMode === "signIn"} aria-controls="sign-in-panel" tabIndex={authMode === "signIn" ? 0 : -1} className={authMode === "signIn" ? "active" : ""} onKeyDown={(event) => handleAuthTabKey(event, 0)} onClick={() => selectAuthMode("signIn")}>Sign in</button><button ref={(element) => { authTabRefs.current[1] = element; }} id="sign-up-tab" type="button" role="tab" aria-selected={authMode === "signUp"} aria-controls="sign-up-panel" tabIndex={authMode === "signUp" ? 0 : -1} className={authMode === "signUp" ? "active" : ""} onKeyDown={(event) => handleAuthTabKey(event, 1)} onClick={() => selectAuthMode("signUp")}>Sign up</button></div>}
        <div className="auth-form-stage" id={!adminMode && step === "password" ? authMode === "signIn" ? "sign-in-panel" : "sign-up-panel" : undefined} role={!adminMode && step === "password" ? "tabpanel" : undefined} aria-labelledby={!adminMode && step === "password" ? authMode === "signIn" ? "sign-in-tab" : "sign-up-tab" : undefined}>
        <p className="eyebrow">{adminMode ? "ADMIN ACCESS" : authMode === "signUp" ? "NEW MEMBER" : "WELCOME BACK"}</p>
        <h1 ref={stepHeadingRef} tabIndex={-1}>{step === "password" ? adminMode ? "Admin sign in." : authMode === "signUp" ? "Create your account." : "Sign in with mobile." : step === "otp" ? "Enter your OTP." : "Complete your profile."}</h1>
        {step === "password" && authMode === "signUp" && <p className="auth-intro">Use your mobile number to create an account. We’ll verify it with a one-time code.</p>}
        {step === "otp" && <p>Enter the six-digit code to continue.</p>}
        {step === "profile" && <p>Add your name to complete your profile.</p>}

        {step === "password" && authMode === "signIn" && (
          <form onSubmit={tryPassword}>
            <label>
              Mobile number
              <span className="phone-input-group">
                <CountryCodePicker value={countryCode} onChange={setCountryCode} />
                <input required type="tel" inputMode="numeric" value={phone} onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 15))} autoComplete="tel-national" aria-label="Mobile number" placeholder="Mobile number" />
              </span>
            </label>
            <label>
              Password
              <span className="password-input-wrap">
                <input required type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" placeholder="Enter password" />
                <button type="button" className="password-toggle" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} title={showPassword ? "Hide password" : "Show password"}>
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{showPassword ? <><path d="M2.5 12s3.4-5.5 9.5-5.5S21.5 12 21.5 12 18.1 17.5 12 17.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="2.5" /></> : <><path d="m3 3 18 18" /><path d="M10.6 6.6A10.7 10.7 0 0 1 12 6.5c6.1 0 9.5 5.5 9.5 5.5a17.3 17.3 0 0 1-3.1 3.6" /><path d="M6.3 8.1A17.3 17.3 0 0 0 2.5 12s3.4 5.5 9.5 5.5c1.2 0 2.3-.2 3.3-.6" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></>}</svg><span>{showPassword ? "Hide" : "Show"}</span>
                </button>
              </span>
            </label>
            {captchaConfigured && <CaptchaChallenge provider={captchaProvider!} siteKey={captchaSiteKey} resetKey={captchaResetKey} onToken={setCaptchaToken} />}
            <button disabled={busy} className="button button-dark">{busy ? "Checking…" : "Login"}</button>
            <button disabled={busy} type="button" className="text-link" onClick={() => void requestOtp()}>Forgot password? Login with OTP</button>
            {!adminMode && <button disabled={busy} type="button" className="text-link" onClick={() => selectAuthMode("signUp")}>New here? Create an account</button>}
          </form>
        )}

        {step === "password" && authMode === "signUp" && (
          <form onSubmit={(event) => { event.preventDefault(); void startTrialSignupVerification(); }}><label>Mobile number<span className="phone-input-group"><CountryCodePicker value={countryCode} onChange={setCountryCode} disabled={Boolean(trialVerificationPhone)} /><input required disabled={Boolean(trialVerificationPhone)} type="tel" inputMode="numeric" value={phone} onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 15))} autoComplete="tel-national" aria-label="Mobile number" placeholder="Mobile number" /></span></label>{captchaConfigured && <CaptchaChallenge provider={captchaProvider!} siteKey={captchaSiteKey} resetKey={captchaResetKey} onToken={setCaptchaToken} />}{trialVerificationPhone && <div className="trial-verification" role="status"><strong>Phone verification in progress</strong><p>Answer the Twilio call and enter this code on your phone keypad:</p><output>{trialValidationCode || "Check the call for your code"}</output><small>We’re checking confirmation every 3 seconds.</small></div>}<button disabled={busy || Boolean(trialVerificationPhone)} className="button button-dark">{busy ? "Starting…" : trialVerificationPhone ? "Waiting for confirmation…" : "Verify phone by call"}</button><button disabled={busy} type="button" className="text-link" onClick={() => selectAuthMode("signIn")}>Already have an account? Sign in</button></form>
        )}

        {step === "otp" && (
          <form onSubmit={verifyOtp}>
            <label>One-time code<input required value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" placeholder="000000" /></label>
            <button disabled={busy || otp.length !== 6} className="button button-dark">{busy ? "Verifying…" : "Verify and continue"}</button>
            <button type="button" className="text-link" onClick={() => { setStep("password"); setOtp(""); resetCaptcha(); setStatus(""); }}>Back to password</button>
          </form>
        )}

        {step === "profile" && (
          <form onSubmit={saveProfile}>
            <label>Your name<input required value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" placeholder="Your name" /></label>
            <button disabled={busy} className="button button-dark">Create profile</button>
          </form>
        )}
        {status && <p className="form-status" role="status" aria-live="polite">{status}</p>}
        </div>
      </section>
    </main>
  );
}
