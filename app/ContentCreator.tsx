"use client";

import { FormEvent, useState } from "react";
import { apiFetch, authHeaders } from "./apiClient";

type ContentKind = "blog" | "project";
type BlogFileType = "md" | "pdf" | "svg";
type UploadTicket = { url: string; method: string; headers: Record<string, string> };

const siteSlug = process.env.NEXT_PUBLIC_SITE_SLUG || "sanjay-portfolio";
const maxUploadBytes = Number(process.env.NEXT_PUBLIC_FILE_UPLOAD_MAX_BYTES || "26214400");
const blogContentTypes: Record<BlogFileType, string> = {
  md: "text/markdown",
  pdf: "application/pdf",
  svg: "image/svg+xml",
};

function blogFileType(file: File): BlogFileType {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension === "md" || extension === "pdf" || extension === "svg") return extension;
  throw new Error("Choose a Markdown, PDF, or SVG file.");
}

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");
}

async function uploadBlogFile(file: File) {
  if (file.size > maxUploadBytes) throw new Error(`File must be smaller than ${Math.round(maxUploadBytes / 1024 / 1024)} MB.`);
  const fileType = blogFileType(file);
  const contentType = blogContentTypes[fileType];
  const blobKey = `blogs/${crypto.randomUUID()}-${safeFileName(file.name)}`;
  const signed = await apiFetch(`/v1/sites/${siteSlug}/_files/upload-url`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ key: blobKey, content_type: contentType, size_bytes: file.size }),
  });
  const ticket = await signed.json().catch(() => ({})) as UploadTicket & { detail?: string };
  if (!signed.ok) throw new Error(ticket.detail || "Could not prepare the Azure upload.");
  const uploaded = await fetch(ticket.url, { method: ticket.method, headers: ticket.headers, body: file });
  if (!uploaded.ok) throw new Error("Azure Blob Storage rejected the upload.");
  return { blobKey, fileType, contentType };
}

export default function ContentCreator({ onCreated }: { onCreated?: () => void }) {
  const [kind, setKind] = useState<ContentKind>("blog");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setStatus(kind === "blog" ? "Uploading file to Azure Blob Storage…" : "Creating project…");
    const form = event.currentTarget;
    const fields = new FormData(form);
    let uploadedKey: string | null = null;
    try {
      const file = fields.get("blogFile");
      const uploaded = kind === "blog"
        ? await uploadBlogFile(file instanceof File && file.size > 0 ? file : (() => { throw new Error("Choose a blog file to upload."); })())
        : null;
      uploadedKey = uploaded?.blobKey || null;
      setStatus(kind === "blog" ? "Saving blog metadata…" : "Creating project…");
      const response = await apiFetch("/admin/content", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          kind,
          title: fields.get("title"),
          description: fields.get("description"),
          body: kind === "project" ? fields.get("body") : undefined,
          category: fields.get("category"),
          visibility: fields.get("visibility"),
          tags: String(fields.get("tags") || "").split(",").map(value => value.trim()).filter(Boolean),
          technologies: String(fields.get("technologies") || "").split(",").map(value => value.trim()).filter(Boolean),
          ...(uploaded && file instanceof File ? {
            blob_key: uploaded.blobKey,
            file_name: file.name,
            file_type: uploaded.fileType,
            content_type: uploaded.contentType,
            size_bytes: file.size,
          } : {}),
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.detail || "Could not create content.");
      setStatus(`${kind === "blog" ? "Blog uploaded" : "Project created"}.`);
      form.reset();
      onCreated?.();
    } catch (error) {
      if (uploadedKey) {
        await apiFetch(`/v1/sites/${siteSlug}/_files?key=${encodeURIComponent(uploadedKey)}`, { method: "DELETE", headers: authHeaders() }).catch(() => undefined);
      }
      setStatus(error instanceof Error ? error.message : "The content could not be created.");
    } finally {
      setBusy(false);
    }
  }

  return <section className="content-creator">
    <p className="eyebrow">CREATE CONTENT</p>
    <h2>New blog or project.</h2>
    <form onSubmit={submit}>
      <label>Type<select value={kind} onChange={event => setKind(event.target.value as ContentKind)}><option value="blog">Blog / article</option><option value="project">Project</option></select></label>
      <label>Visibility<select name="visibility" defaultValue="public"><option value="public">Public</option><option value="semi-private">Semi-private</option><option value="private">Private</option></select></label>
      <label>Title<input name="title" required /></label>
      <label>Summary<input name="description" required /></label>
      {kind === "blog"
        ? <label className="content-file-field">Blog file<input name="blogFile" type="file" accept=".md,.pdf,.svg,text/markdown,application/pdf,image/svg+xml" required /><small>Markdown, PDF, or SVG. The file is stored in Azure; only its metadata is saved in Supabase.</small></label>
        : <label>Project features (one per line)<textarea name="body" rows={6} /></label>}
      <label>Category<input name="category" defaultValue={kind === "blog" ? "Leadership" : "General"} /></label>
      <label>{kind === "blog" ? "Tags (comma separated)" : "Technologies (comma separated)"}<input name={kind === "blog" ? "tags" : "technologies"} /></label>
      <button disabled={busy} className="button button-dark">{busy ? "Working…" : `Create ${kind === "blog" ? "blog" : "project"} ↗`}</button>
      {status && <p className="form-status" role="status">{status}</p>}
    </form>
  </section>;
}
