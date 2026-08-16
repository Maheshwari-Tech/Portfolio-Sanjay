"use client";

import { FormEvent, useMemo, useState } from "react";
import { apiFetch, authHeaders } from "./apiClient";

export type ManagedContent = {
  id:number; title?:string; name?:string; content_description?:string; description?:string;
  body?:string; features?:string[]; tags?:string[]; technologies?:string[]; category?:string;
  file_name?:string; fileType?:string; size_bytes?:number; blob_key?:string; asset_url?:string; content_type?:string;
  visibility?:"public"|"private"|"semi-private"; hidden?:boolean;
};

type UploadTicket = {url:string;method:string;headers:Record<string,string>;detail?:string};
const siteSlug=process.env.NEXT_PUBLIC_SITE_SLUG||"sanjay-portfolio";
const maxUploadBytes=Number(process.env.NEXT_PUBLIC_FILE_UPLOAD_MAX_BYTES||"26214400");
const contentTypes:Record<string,string>={md:"text/markdown",pdf:"application/pdf",svg:"image/svg+xml"};
const legacyLocalAssets:Record<number,string>={4:"/blogs/system-design-interview.svg",6:"/blogs/typical-days.svg"};
const safeFileName=(name:string)=>name.replace(/[^a-zA-Z0-9._-]/g,"-").replace(/-+/g,"-");
const localAssetUrl=(blog:ManagedContent)=>blog.asset_url||legacyLocalAssets[blog.id];

export default function AdminContentManager({blogs,projects,onChanged}:{blogs:ManagedContent[];projects:ManagedContent[];onChanged:()=>void}) {
  const [kind,setKind] = useState<"blog"|"project">("blog");
  const [query,setQuery] = useState("");
  const [editing,setEditing] = useState<number|null>(null);
  const [status,setStatus] = useState("");
  const [migrating,setMigrating] = useState(false);
  const items = kind === "blog" ? blogs : projects;
  const filtered = useMemo(() => items.filter(item => (item.title || item.name || "").toLowerCase().includes(query.toLowerCase())),[items,query]);
  const localBlogs = useMemo(() => blogs.filter(item => localAssetUrl(item) && !item.blob_key && Boolean(contentTypes[item.fileType||""])),[blogs]);

  async function migrateBlogToAzure(blog:ManagedContent){
    const assetUrl=localAssetUrl(blog) as string;
    const fileType=blog.fileType as string;
    const contentType=contentTypes[fileType];
    const fileName=decodeURIComponent(new URL(assetUrl,window.location.origin).pathname.split("/").pop()||`blog-${blog.id}.${fileType}`);
    const source=await fetch(assetUrl,{cache:"no-store"});
    if(!source.ok)throw new Error(`Could not read the local file for ${blog.title||`blog ${blog.id}`}.`);
    const file=await source.blob();
    if(file.size>maxUploadBytes)throw new Error(`${fileName} exceeds the upload limit.`);
    const blobKey=`blogs/migrated/${blog.id}-${safeFileName(fileName)}`;
    const signed=await apiFetch(`/v1/sites/${siteSlug}/_files/upload-url`,{method:"POST",headers:authHeaders(),body:JSON.stringify({key:blobKey,content_type:contentType,size_bytes:file.size})});
    const ticket=await signed.json().catch(()=>({})) as UploadTicket;
    if(!signed.ok)throw new Error(ticket.detail||`Could not prepare ${fileName} for Azure.`);
    const uploaded=await fetch(ticket.url,{method:ticket.method,headers:ticket.headers,body:file});
    if(!uploaded.ok)throw new Error(`Azure rejected ${fileName}.`);
    const saved=await apiFetch(`/admin/content/blog/${blog.id}`,{method:"PATCH",headers:authHeaders(),body:JSON.stringify({blob_key:blobKey,file_name:fileName,file_type:fileType,content_type:contentType,size_bytes:file.size})});
    const result=await saved.json().catch(()=>({})) as {detail?:string;blob_key?:string};
    if(!saved.ok||result.blob_key!==blobKey){
      await apiFetch(`/v1/sites/${siteSlug}/_files?key=${encodeURIComponent(blobKey)}`,{method:"DELETE",headers:authHeaders()}).catch(()=>undefined);
      throw new Error(result.detail||`Could not verify Azure metadata for ${fileName}. Deploy the backend update first.`);
    }
  }

  async function migrateAllLocalBlogs(){
    if(!localBlogs.length||!window.confirm(`Upload ${localBlogs.length} local blog file${localBlogs.length===1?"":"s"} to Azure?`))return;
    setMigrating(true);setStatus(`Uploading 0 of ${localBlogs.length} local blog files…`);
    const failures:string[]=[];let completed=0;
    for(const blog of localBlogs){
      try{await migrateBlogToAzure(blog);completed+=1;setStatus(`Uploading ${completed} of ${localBlogs.length} local blog files…`)}
      catch(error){failures.push(error instanceof Error?error.message:`Blog ${blog.id} failed.`)}
    }
    setMigrating(false);
    setStatus(failures.length?`${completed} uploaded. ${failures.length} failed: ${failures.join(" ")}`:`${completed} local blog file${completed===1?"":"s"} uploaded to Azure.`);
    onChanged();
  }

  async function patch(id:number, body:Record<string,unknown>) {
    setStatus("");
    const response = await apiFetch(`/admin/content/${kind}/${id}`,{method:"PATCH",headers:authHeaders(),body:JSON.stringify(body)});
    const result = await response.json().catch(()=>({}));
    if(!response.ok){setStatus(result.detail || "Content could not be updated.");return false}
    setStatus(`${kind === "blog" ? "Article" : "Project"} updated.`);onChanged();return true;
  }

  async function save(event:FormEvent<HTMLFormElement>,id:number){
    event.preventDefault();const form=new FormData(event.currentTarget);
    const list=String(form.get("topics")||"").split(",").map(value=>value.trim()).filter(Boolean);
    const ok=await patch(id,{title:form.get("title"),description:form.get("description"),category:form.get("category"),visibility:form.get("visibility"),...(kind==="blog"?{tags:list}:{technologies:list})});
    if(ok)setEditing(null);
  }

  async function remove(id:number){
    if(!window.confirm(`Permanently delete this ${kind}?`))return;
    const response=await apiFetch(`/admin/content/${kind}/${id}`,{method:"DELETE",headers:authHeaders()});
    if(response.ok){setStatus(`${kind === "blog" ? "Article" : "Project"} deleted.`);onChanged()}else setStatus("Content could not be deleted.");
  }

  return <section className="admin-section admin-content-manager">
    <div className="admin-section-heading"><div><p className="eyebrow">CONTENT LIBRARY</p><h2>Manage published work</h2></div><div className="admin-content-tabs"><button className={kind==="blog"?"active":""} onClick={()=>{setKind("blog");setEditing(null)}}>Blogs <span>{blogs.length}</span></button><button className={kind==="project"?"active":""} onClick={()=>{setKind("project");setEditing(null)}}>Projects <span>{projects.length}</span></button></div></div>
    {kind==="blog"&&<div className="admin-storage-migration"><div><strong>Azure blog storage</strong><p>{localBlogs.length?`${localBlogs.length} blog file${localBlogs.length===1?" is":"s are"} still served from the website deployment.`:"All eligible blog files are stored in Azure."}</p></div>{localBlogs.length>0&&<button disabled={migrating} onClick={()=>void migrateAllLocalBlogs()}>{migrating?"Uploading…":`Upload all ${localBlogs.length} to Azure`}</button>}</div>}
    <label className="admin-content-search">Search {kind === "blog" ? "blogs" : "projects"}<input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search by title…"/></label>
    {status&&<p className="form-status" role="status">{status}</p>}
    <div className="admin-content-list">{filtered.map(item=>{
      const title=item.title||item.name||"Untitled";const description=item.content_description||item.description||"";
      return <article key={item.id} className={item.hidden?"is-hidden":""}>
        {editing===item.id?<form onSubmit={event=>void save(event,item.id)}><label>Title<input name="title" defaultValue={title} required/></label><label>Summary<textarea name="description" defaultValue={description} required rows={3}/></label><label>Category<input name="category" defaultValue={item.category||item.tags?.[0]||"General"}/></label><label>Visibility<select name="visibility" defaultValue={item.visibility||"public"}><option value="public">Public</option><option value="semi-private">Semi-private</option><option value="private">Private</option></select></label><label>Topics / technologies<input name="topics" defaultValue={(kind==="blog"?item.tags:item.technologies)?.join(", ")||""}/></label><div><button className="admin-small-primary">Save</button><button type="button" onClick={()=>setEditing(null)}>Cancel</button></div></form>:<><div className="admin-content-copy"><div><span className={`admin-visibility ${item.hidden?"hidden":""}`}>{item.hidden?"Hidden":item.visibility||"public"}</span><span>#{item.id}</span>{item.blob_key?<span>{item.fileType?.toUpperCase()} · Azure · {item.file_name} · {item.size_bytes ? `${(item.size_bytes/1024/1024).toFixed(1)} MB` : "stored"}</span>:localAssetUrl(item)&&<span>{item.fileType?.toUpperCase()} · Local file</span>}</div><h3>{title}</h3><p>{description}</p></div><div className="admin-row-actions"><button onClick={()=>setEditing(item.id)}>Edit</button><button onClick={()=>void patch(item.id,{hidden:!item.hidden})}>{item.hidden?"Show":"Hide"}</button><button className="danger" onClick={()=>void remove(item.id)}>Delete</button></div></>}
      </article>})}</div>
  </section>;
}
