"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SiteFooter from "../SiteFooter";
import SiteHeader from "../SiteHeader";
import { getSupabaseBrowserClient } from "../supabaseClient";

type ProfileState = "loading" | "ready" | "unavailable";

export default function ProfilePage() {
  const router = useRouter();
  const [state, setState] = useState<ProfileState>("loading");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [profileStatus, setProfileStatus] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setState("unavailable");
      return;
    }

    void supabase.auth.getUser().then(({ data, error }) => {
      if (error || !data.user) {
        router.replace("/login?next=/profile");
        return;
      }
      setName(String(data.user.user_metadata?.name || ""));
      setBio(String(data.user.user_metadata?.bio || ""));
      setPhone(data.user.phone || "");
      setState("ready");
    });
  }, [router]);

  async function updateProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setSavingProfile(true);
    setProfileStatus("");
    const cleanName = name.trim();
    const cleanBio = bio.trim();
    const { error } = await supabase.auth.updateUser({ data: { name: cleanName, bio: cleanBio } });
    if (error) {
      setProfileStatus(error.message);
    } else {
      try {
        const stored = JSON.parse(localStorage.getItem("sanjay_portfolio_user") || "{}");
        localStorage.setItem("sanjay_portfolio_user", JSON.stringify({ ...stored, name: cleanName, bio: cleanBio }));
      } catch {
        localStorage.setItem("sanjay_portfolio_user", JSON.stringify({ name: cleanName, bio: cleanBio, phone }));
      }
      setProfileStatus("Profile updated.");
    }
    setSavingProfile(false);
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordStatus("");
    if (password.length < 8) {
      setPasswordStatus("Use at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setPasswordStatus("The passwords do not match.");
      return;
    }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setPasswordStatus(error.message);
    } else {
      setPassword("");
      setConfirmPassword("");
      setPasswordStatus("Password changed successfully.");
    }
    setSavingPassword(false);
  }

  return (
    <main className="profile-page">
      <SiteHeader />
      <section className="profile-hero">
        <p className="eyebrow">YOUR PROFILE</p>
        <h1>Keep your profile current.</h1>
        <p>Update how your name appears, add a short bio, or change your account password.</p>
      </section>

      {state === "loading" && <section className="profile-loading"><p>Loading your profile…</p></section>}
      {state === "unavailable" && <section className="profile-loading"><h2>Profile service unavailable.</h2><p>Supabase authentication is not configured for this environment.</p></section>}
      {state === "ready" && (
        <section className="profile-grid">
          <form className="profile-card" onSubmit={updateProfile}>
            <div><p className="eyebrow">ABOUT YOU</p><h2>Profile details</h2></div>
            <label>Mobile number<input value={phone} readOnly aria-readonly="true" /></label>
            <label>Profile name<input value={name} onChange={(event) => setName(event.target.value)} required maxLength={80} autoComplete="name" /></label>
            <label>Bio<textarea value={bio} onChange={(event) => setBio(event.target.value)} maxLength={500} rows={6} placeholder="Share a little about your work, interests, or goals." /></label>
            <div className="profile-form-footer"><span>{bio.length}/500</span><button className="button button-dark" disabled={savingProfile}>{savingProfile ? "Saving…" : "Save profile"}</button></div>
            {profileStatus && <p className="form-status" role="status">{profileStatus}</p>}
          </form>

          <form className="profile-card profile-password-card" onSubmit={changePassword}>
            <div><p className="eyebrow">SECURITY</p><h2>Change password</h2></div>
            <p className="profile-card-copy">Use a unique password with at least eight characters.</p>
            <label>New password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} autoComplete="new-password" /></label>
            <label>Confirm new password<input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required minLength={8} autoComplete="new-password" /></label>
            <button className="button button-dark" disabled={savingPassword}>{savingPassword ? "Changing…" : "Change password"}</button>
            {passwordStatus && <p className="form-status" role="status">{passwordStatus}</p>}
          </form>
        </section>
      )}
      <SiteFooter />
    </main>
  );
}
