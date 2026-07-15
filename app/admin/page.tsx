"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch, ApiUnavailableError, authHeaders } from "../apiClient";
import AdminContentManager, { ManagedContent } from "../AdminContentManager";
import ContentCreator from "../ContentCreator";

type RequestStatus = "pending"|"accepted"|"rejected"|"later";
type Submission = {id:number;type:string;title:string;name:string;email?:string;message?:string;category?:string;rating?:string;project_id?:string;status?:RequestStatus;created_at:string};
type Overview = {
  submissions:Submission[];
  comments:Array<{id:number;content_id:string;author:string;message:string;created_at:string}>;
  likes:Array<{content_id:string;count:number;people:string[]}>;
  users:Array<{id:number;name:string;phone?:string;email?:string;role:string;access?:string[]}>;
  content:{blogs:ManagedContent[];projects:ManagedContent[]};
  counts:{requests:number;actionable:number;comments:number;likes:number;by_type:Record<string,number>};
};

const requestTypes = [
  ["all","All requests"],["contact","Contact"],["feedback","Feedback"],["recommendation","Recommendations"],
  ["demo","Demo requests"],["candidate","Candidates"],["recruiter","Recruiters"],
] as const;

export default function AdminPage() {
  const [data,setData] = useState<Overview|null>(null);
  const [requests,setRequests] = useState<Submission[]>([]);
  const [state,setState] = useState<"loading"|"offline"|"denied"|"ready">("loading");
  const [message,setMessage] = useState("");
  const [activeType,setActiveType] = useState("all");
  const [statusFilter,setStatusFilter] = useState("actionable");
  const [timeRange,setTimeRange] = useState("30");
  const [fromDate,setFromDate] = useState("");
  const [toDate,setToDate] = useState("");
  const [requestBusy,setRequestBusy] = useState(false);
  const [actionId,setActionId] = useState<number|null>(null);
  const storedName = typeof window === "undefined" ? "Sanjay" : (()=>{try{return JSON.parse(localStorage.getItem("sanjay_portfolio_user")||"{}").name||"Sanjay"}catch{return "Sanjay"}})();

  const loadOverview = useCallback(async (initial=false) => {
    if(initial)setState("loading");setMessage("");
    try {
      const response=await apiFetch("/admin/overview",{headers:authHeaders()});
      const body=await response.json().catch(()=>({}));
      if(!response.ok){setState("denied");setMessage(body.detail||"Admin authentication is required.");return}
      setData(body);setState("ready");
    } catch(error) {
      setState(error instanceof ApiUnavailableError?"offline":"denied");
      setMessage(error instanceof ApiUnavailableError?"The private API is unavailable. No admin data can be displayed or changed.":"Admin access could not be verified.");
    }
  },[]);

  const requestQuery = useMemo(()=>{
    const params=new URLSearchParams({status:statusFilter});
    if(activeType!=="all")params.set("type",activeType);
    if(timeRange==="custom"){
      if(fromDate)params.set("from_date",new Date(`${fromDate}T00:00:00`).toISOString());
      if(toDate)params.set("to_date",new Date(`${toDate}T23:59:59`).toISOString());
    } else if(timeRange!=="all") {
      const from=new Date();from.setDate(from.getDate()-Number(timeRange));params.set("from_date",from.toISOString());
    }
    return params.toString();
  },[activeType,fromDate,statusFilter,timeRange,toDate]);

  const loadRequests=useCallback(async()=>{
    setRequestBusy(true);
    try{const response=await apiFetch(`/admin/requests?${requestQuery}`,{headers:authHeaders()});const body=await response.json();if(response.ok)setRequests(body.items||[])}finally{setRequestBusy(false)}
  },[requestQuery]);

  useEffect(()=>{void loadOverview(true)},[loadOverview]);
  useEffect(()=>{if(state==="ready")void loadRequests()},[loadRequests,state]);

  async function setRequestStatus(id:number,status:"accepted"|"rejected"|"later"){
    setActionId(id);
    const response=await apiFetch(`/admin/submissions/${id}/status`,{method:"PATCH",headers:authHeaders(),body:JSON.stringify({status})});
    if(response.ok){await Promise.all([loadRequests(),loadOverview()])}else setMessage("The request status could not be updated.");
    setActionId(null);
  }

  async function toggleAccess(userId:number,area:"candidate"|"recruiter",current:string[]=[]){
    const access=current.includes(area)?current.filter(item=>item!==area):[...current,area];
    const response=await apiFetch(`/admin/users/${userId}/access`,{method:"PATCH",headers:authHeaders(),body:JSON.stringify({access})});if(response.ok)await loadOverview();
  }

  if(state!=="ready"||!data)return <main className="admin-page"><header className="article-nav"><Link className="wordmark" href="/">SM<span>.</span></Link><Link href="/">Public website</Link></header><section className="admin-empty"><p className="eyebrow">PRIVATE ADMIN</p><h1>{state==="loading"?"Verifying access…":state==="offline"?"Admin service unavailable.":"Admin access only."}</h1>{message&&<p>{message}</p>}{state==="offline"&&<button className="button button-dark" onClick={()=>void loadOverview(true)}>Retry connection ↗</button>}{state==="denied"&&<Link className="button button-dark" href="/admin/login">Admin login ↗</Link>}</section></main>;

  return <main className="admin-page">
    <header className="admin-topbar"><Link className="wordmark" href="/">SM<span>.</span></Link><nav><a href="#requests">Requests</a><a href="#content">Content</a><a href="#access">Access</a><a href="#engagement">Engagement</a></nav><span>{storedName}</span></header>
    <section className="admin-shell">
      <div className="admin-hero"><div><p className="eyebrow">ADMIN PORTAL</p><h1>Good day, {storedName}.</h1><p>Review incoming requests, publish work, and manage access from one place.</p></div><div className="admin-notification-card"><span>Needs attention</span><strong>{data.counts.actionable}</strong><p>{data.counts.actionable===1?"request is":"requests are"} waiting for a decision.</p><a href="#requests">Open queue ↓</a></div></div>
      <div className="admin-counts"><div><strong>{data.counts.actionable}</strong><span>Waiting for review</span></div><div><strong>{data.counts.requests}</strong><span>Total requests</span></div><div><strong>{data.counts.comments+data.counts.likes}</strong><span>Engagement events</span></div></div>

      <section className="admin-section admin-request-workspace" id="requests">
        <div className="admin-section-heading"><div><p className="eyebrow">REQUEST INBOX</p><h2>Review queue</h2></div><span className="admin-live-indicator"><i/> {data.counts.actionable} actionable</span></div>
        <div className="admin-request-tabs" role="tablist">{requestTypes.map(([value,label])=><button role="tab" aria-selected={activeType===value} className={activeType===value?"active":""} key={value} onClick={()=>setActiveType(value)}>{label}<span>{value==="all"?data.counts.actionable:data.counts.by_type[value]||0}</span></button>)}</div>
        <div className="admin-filters">
          <label>Status<select value={statusFilter} onChange={event=>setStatusFilter(event.target.value)}><option value="actionable">Later / pending</option><option value="accepted">Accepted</option><option value="rejected">Rejected</option><option value="all">All statuses</option></select></label>
          <label>Time range<select value={timeRange} onChange={event=>setTimeRange(event.target.value)}><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option><option value="all">All time</option><option value="custom">Custom dates</option></select></label>
          {timeRange==="custom"&&<><label>From<input type="date" value={fromDate} onChange={event=>setFromDate(event.target.value)}/></label><label>To<input type="date" value={toDate} onChange={event=>setToDate(event.target.value)}/></label></>}
          <span>{requestBusy?"Refreshing…":`${requests.length} shown`}</span>
        </div>
        {requests.length===0?<div className="admin-zero-state"><strong>Queue clear.</strong><p>No requests match these filters.</p></div>:<div className="admin-request-list">{requests.map(item=><article key={item.id}>
          <div className="admin-request-icon">{item.type.slice(0,1).toUpperCase()}</div>
          <div className="admin-request-copy"><div><span>{item.type}</span><span className={`request-status ${item.status||"pending"}`}>{item.status==="pending"||!item.status?"later":item.status}</span></div><h3>{item.title}</h3><p className="admin-request-person">{item.name}{item.email?` · ${item.email}`:""}</p><p>{item.message||item.category||item.rating||"No additional detail provided."}</p><time>{new Date(item.created_at).toLocaleString()}</time></div>
          <div className="admin-decision-actions"><button disabled={actionId===item.id} className="accept" title="Accept request" onClick={()=>void setRequestStatus(item.id,"accepted")}><b>✓</b><span>Accept</span></button><button disabled={actionId===item.id} className="reject" title="Reject request" onClick={()=>void setRequestStatus(item.id,"rejected")}><b>×</b><span>Reject</span></button><button disabled={actionId===item.id} className="later" title="Review later" onClick={()=>void setRequestStatus(item.id,"later")}><b>↗</b><span>Later</span></button></div>
        </article>)}</div>}
      </section>

      <div id="content"><ContentCreator onCreated={()=>void loadOverview()}/><AdminContentManager blogs={data.content.blogs} projects={data.content.projects} onChanged={()=>void loadOverview()}/></div>

      <section className="admin-section" id="access"><div className="admin-section-heading"><div><p className="eyebrow">AUTHORIZATION</p><h2>User access</h2></div><span>{data.users.length} users</span></div><div className="admin-user-list">{data.users.map(user=><article key={user.id}><div className="admin-user-avatar">{user.name.charAt(0)}</div><div><span>{user.role}</span><h3>{user.name}</h3><p>{user.phone||user.email}</p></div><div className="admin-access-actions"><button className={user.access?.includes("candidate")?"active":""} onClick={()=>void toggleAccess(user.id,"candidate",user.access)}>Candidate {user.access?.includes("candidate")?"✓":"+"}</button><button className={user.access?.includes("recruiter")?"active":""} onClick={()=>void toggleAccess(user.id,"recruiter",user.access)}>Recruiter {user.access?.includes("recruiter")?"✓":"+"}</button></div></article>)}</div></section>

      <section className="admin-section admin-engagement" id="engagement"><div className="admin-section-heading"><div><p className="eyebrow">NOTIFICATIONS</p><h2>Likes & comments</h2></div><span>{data.counts.comments+data.counts.likes} events</span></div><div className="admin-engagement-grid"><div><h3>Recent comments <span>{data.counts.comments}</span></h3>{data.comments.length===0?<p>No comments yet.</p>:data.comments.map(item=><article key={`${item.content_id}-${item.id}`}><span>{item.content_id}</span><strong>{item.author}</strong><p>{item.message}</p><time>{new Date(item.created_at).toLocaleString()}</time></article>)}</div><div><h3>Likes <span>{data.counts.likes}</span></h3>{data.likes.length===0?<p>No likes yet.</p>:data.likes.map(item=><article key={item.content_id}><span>{item.content_id}</span><strong>{item.count} {item.count===1?"like":"likes"}</strong><p>{item.people.join(", ")}</p></article>)}</div></div></section>
    </section>
  </main>;
}
