"use client";

import { FormEvent, useMemo, useState } from "react";
import { apiFetch, authHeaders } from "./apiClient";

export type ManagedContent = {
  id:number; title?:string; name?:string; content_description?:string; description?:string;
  body?:string; features?:string[]; tags?:string[]; technologies?:string[]; category?:string;
  visibility?:"public"|"private"|"semi-private"; hidden?:boolean;
};

export default function AdminContentManager({blogs,projects,onChanged}:{blogs:ManagedContent[];projects:ManagedContent[];onChanged:()=>void}) {
  const [kind,setKind] = useState<"blog"|"project">("blog");
  const [query,setQuery] = useState("");
  const [editing,setEditing] = useState<number|null>(null);
  const [status,setStatus] = useState("");
  const items = kind === "blog" ? blogs : projects;
  const filtered = useMemo(() => items.filter(item => (item.title || item.name || "").toLowerCase().includes(query.toLowerCase())),[items,query]);

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
    <label className="admin-content-search">Search {kind === "blog" ? "blogs" : "projects"}<input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search by title…"/></label>
    {status&&<p className="form-status" role="status">{status}</p>}
    <div className="admin-content-list">{filtered.map(item=>{
      const title=item.title||item.name||"Untitled";const description=item.content_description||item.description||"";
      return <article key={item.id} className={item.hidden?"is-hidden":""}>
        {editing===item.id?<form onSubmit={event=>void save(event,item.id)}><label>Title<input name="title" defaultValue={title} required/></label><label>Summary<textarea name="description" defaultValue={description} required rows={3}/></label><label>Category<input name="category" defaultValue={item.category||item.tags?.[0]||"General"}/></label><label>Visibility<select name="visibility" defaultValue={item.visibility||"public"}><option value="public">Public</option><option value="semi-private">Semi-private</option><option value="private">Private</option></select></label><label>Topics / technologies<input name="topics" defaultValue={(kind==="blog"?item.tags:item.technologies)?.join(", ")||""}/></label><div><button className="admin-small-primary">Save</button><button type="button" onClick={()=>setEditing(null)}>Cancel</button></div></form>:<><div className="admin-content-copy"><div><span className={`admin-visibility ${item.hidden?"hidden":""}`}>{item.hidden?"Hidden":item.visibility||"public"}</span><span>#{item.id}</span></div><h3>{title}</h3><p>{description}</p></div><div className="admin-row-actions"><button onClick={()=>setEditing(item.id)}>Edit</button><button onClick={()=>void patch(item.id,{hidden:!item.hidden})}>{item.hidden?"Show":"Hide"}</button><button className="danger" onClick={()=>void remove(item.id)}>Delete</button></div></>}
      </article>})}</div>
  </section>;
}
