"use client";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { apiFetch, authHeaders, isLoggedIn } from "./apiClient";

type Comment={id:number;author:string;message:string};
export default function ContentInteractions({contentId}:{contentId:string}) {
  const [likes,setLikes]=useState(0); const [comments,setComments]=useState<Comment[]>([]); const [text,setText]=useState(""); const [note,setNote]=useState(""); const [available,setAvailable]=useState(true);
  useEffect(()=>{apiFetch(`/content/${contentId}/interactions`).then(r=>r.json()).then(d=>{setLikes(d.likes?.length||0);setComments(d.comments||[])}).catch(()=>{setAvailable(false);setNote("Likes and comments are temporarily unavailable; the article remains available.")})},[contentId]);
  async function action(action:"like"|"comment",message?:string){
    if(!isLoggedIn()){window.location.href="/login";return;}
    try { const r=await apiFetch(`/content/${contentId}/interactions`,{method:"POST",headers:authHeaders(),body:JSON.stringify({action,message})}); const d=await r.json(); if(r.ok){if(action==="like")setLikes(d.count);else{setComments(c=>[...c,d.comment]);setText("")}}else setNote(d.detail||"Could not save interaction."); }
    catch { setAvailable(false); setNote("The interaction service is offline. Nothing was changed."); }
  }
  return <section className="content-interactions"><button disabled={!available} type="button" onClick={()=>action("like")}>♥ {likes} · Like</button><form onSubmit={(e:FormEvent)=>{e.preventDefault();void action("comment",text)}}><label>Comment<input disabled={!available} required value={text} onChange={e=>setText(e.target.value)} placeholder="Add a thoughtful note"/></label><button disabled={!available}>Post comment</button></form>{!isLoggedIn()&&<p><Link href="/login">Sign in</Link> to like or comment.</p>}{comments.map(c=><p className="comment" key={c.id}><strong>{c.author}</strong>{c.message}</p>)}{note&&<p className="form-status">{note}</p>}</section>;
}
