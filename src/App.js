import { useState, useRef, useCallback, useEffect } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from "recharts";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL || "https://htgdxtiufksxoahyuief.supabase.co",
  process.env.REACT_APP_SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0Z2R4dGl1ZmtzeG9haHl1aWVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyMTE0ODIsImV4cCI6MjA5Nzc4NzQ4Mn0.zO6tD_LMZtQfQBbtqeISknFbXSZ1oYWWVpJmFSDQKLU"
);

// ── Fonts ──────────────────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap";
document.head.appendChild(fontLink);

// ── EDGY Design System ─────────────────────────────────────────
// Prestige palette: deep black, warm gold gradient, crisp white
const C = {
  // Backgrounds
  bg:"#080808",
  bgCard:"#111111",
  bgElevated:"#181818",
  // Brand gradient: Orange → Gold → White
  grad:"linear-gradient(90deg, #FF8800 0%, #FFD700 55%, #FFFFFF 100%)",
  gradVert:"linear-gradient(160deg, #FF8800 0%, #FFD700 55%, #FFFFFF 100%)",
  // Accent colors
  orange:"#FF8800",
  gold:"#FFD700",
  // Status
  win:"#00E676",
  loss:"#FF3D3D",
  // Text
  text:"#FFFFFF",
  textMid:"rgba(255,255,255,0.6)",
  textDim:"rgba(255,255,255,0.3)",
  // Borders
  border:"rgba(255,255,255,0.08)",
  borderGold:"rgba(255,215,0,0.25)",
  // Legacy compat
  primary:"#FF8800",
  cyan:"#FFD700",
  navy:"#FFFFFF",
  muted:"rgba(255,255,255,0.45)",
  lavender:"#1A1A1A",
  bgCard2:"#111111",
};
const SUITS=["♠","♥","♦","♣"];
const RANKS=["2","3","4","5","6","7","8","9","T","J","Q","K","A"];
const POSITIONS=["UTG","UTG+1","MP","HJ","CO","BTN","SB","BB"];
const ACTIONS=["Fold","Call","Raise","3-Bet","4-Bet","All-in"];
const STREETS=["Préflop","Flop","Turn","River"];
const SUIT_COLORS={"♠":"#1E1B4B","♥":"#EF4444","♦":"#2563EB","♣":"#16A34A"};
const suitColor=s=>SUIT_COLORS[s]||"#1E1B4B";

function uid(){return Math.random().toString(36).slice(2,8);}
function fmtBB(n){
  if(n===undefined||n===null||n==="") return "—";
  return (n>0?"+":"")+n+" BB";
}
function fmtChips(n){
  if(n===undefined||n===null||n==="") return "—";
  const abs=Math.abs(n);
  const fmt=abs>=1000?(abs/1000).toFixed(1).replace(/\.0$/,"")+"k":String(abs);
  return (n>0?"+":n<0?"-":"")+fmt;
}
function fmtDate(ts){
  return new Date(ts).toLocaleString("fr-FR",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"});
}
function nowStr(){
  return new Date().toLocaleString("fr-FR",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"});
}

// ── Shared styles ──────────────────────────────────────────────
const FF="'Inter',system-ui,sans-serif";
const inputStyle = {
  width:"100%", boxSizing:"border-box", padding:"12px 14px", borderRadius:10,
  border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.05)",
  color:"#FFFFFF", fontSize:14, fontFamily:FF, outline:"none",
  WebkitAppearance:"none",
};
const labelStyle = {
  fontSize:10, color:"rgba(255,255,255,0.4)", fontWeight:700,
  textTransform:"uppercase", letterSpacing:1.2, marginBottom:5, display:"block",
};

// ── Edgy Logo SVG ─────────────────────────────────────────────
function EdgyLogo({size=32,showText=true}){
  const id=Math.random().toString(36).slice(2,6);
  return (
    <svg height={size} viewBox="-10 0 360 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display:"block"}}>
      <defs>
        <linearGradient id={`g${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#CC5500"/>
          <stop offset="30%" stopColor="#FF8800"/>
          <stop offset="65%" stopColor="#FFD700"/>
          <stop offset="100%" stopColor="#FFFFFF"/>
        </linearGradient>
        <linearGradient id={`l${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FF8800" stopOpacity="1"/>
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0"/>
        </linearGradient>
      </defs>
      {showText&&<text
        x="0" y="68"
        fontFamily="'Arial Black','Impact',system-ui"
        fontSize="72"
        fontWeight="900"
        fill={`url(#g${id})`}
        transform="skewX(-16)"
      >EDGY</text>}
      <rect x="0" y="72" width="280" height="2.5" fill={`url(#l${id})`}/>
      <rect x="0" y="76" width="180" height="1.5" fill={`url(#l${id})`} opacity="0.5"/>
    </svg>
  );
}

// ── Edgy Icon (app icon) ──────────────────────────────────────
function EdgyIcon({size=40}){
  const id=Math.random().toString(36).slice(2,6);
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`gi${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF8800"/>
          <stop offset="60%" stopColor="#FFD700"/>
          <stop offset="100%" stopColor="#FFFFFF"/>
        </linearGradient>
        <radialGradient id={`bg${id}`} cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="rgba(255,136,0,0.2)"/>
          <stop offset="100%" stopColor="rgba(0,0,0,0)"/>
        </radialGradient>
      </defs>
      <rect width="100" height="100" rx="22" fill="#0E0E0E"/>
      <rect width="100" height="100" rx="22" fill={`url(#bg${id})`}/>
      <rect width="100" height="100" rx="22" fill="none" stroke="rgba(255,215,0,0.2)" strokeWidth="1"/>
      <text x="52" y="82"
        fontFamily="'Arial Black','Impact',system-ui"
        fontSize="82" fontWeight="900"
        fill={`url(#gi${id})`}
        textAnchor="middle"
        transform="skewX(-14) translate(-4,0)"
      >E</text>
    </svg>
  );
}
function LoginScreen({onLogin}){
  const [mode,setMode]=useState("login");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [confirmPw,setConfirmPw]=useState("");
  const [error,setError]=useState("");
  const [success,setSuccess]=useState("");
  const [shake,setShake]=useState(false);
  const [loading,setLoading]=useState(false);
  const triggerShake=()=>{setShake(true);setTimeout(()=>setShake(false),500);};
  const resetMode=m=>{setMode(m);setError("");setSuccess("");setEmail("");setPassword("");setConfirmPw("");};
  const handleSubmit=async()=>{
    setError("");setSuccess("");setLoading(true);
    try{
      if(mode==="login"){
        if(!email.trim()||!password.trim()){setError("Remplis tous les champs");triggerShake();return;}
        const {error:e}=await supabase.auth.signInWithPassword({email,password});
        if(e){setError("Email ou mot de passe incorrect");triggerShake();}
        else{onLogin();}
      }
      if(mode==="signup"){
        if(!email.trim()||!password||!confirmPw){setError("Remplis tous les champs");triggerShake();return;}
        if(!/\S+@\S+\.\S+/.test(email)){setError("Email invalide");triggerShake();return;}
        if(password.length<6){setError("Mot de passe trop court (6 car. min)");triggerShake();return;}
        if(password!==confirmPw){setError("Les mots de passe ne correspondent pas");triggerShake();return;}
        const {error:e}=await supabase.auth.signUp({email,password});
        if(e){setError(e.message);triggerShake();}
        else{setSuccess("Compte créé ! Vérifie ton email pour confirmer.");}
      }
      if(mode==="forgot"){
        if(!email.trim()||!/\S+@\S+\.\S+/.test(email)){setError("Email invalide");triggerShake();return;}
        const {error:e}=await supabase.auth.resetPasswordForEmail(email);
        if(e){setError(e.message);}
        else{setSuccess("Lien envoyé à "+email+" ✉️");}
      }
    }finally{setLoading(false);}
  };
  const inp={...inputStyle};
  return (
    <div style={{minHeight:"100vh",fontFamily:FF,background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px",position:"relative",overflow:"hidden"}}>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}@keyframes fadeup{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{position:"absolute",top:"-20%",left:"50%",transform:"translateX(-50%)",width:600,height:600,borderRadius:"50%",background:"radial-gradient(circle,rgba(255,136,0,0.07) 0%,transparent 70%)",pointerEvents:"none"}}/>
      <div style={{marginBottom:36,animation:"fadeup .5s ease"}}><EdgyLogo size={44}/></div>
      <div style={{width:"100%",maxWidth:380,background:C.bgCard,borderRadius:20,border:"1px solid rgba(255,255,255,0.06)",padding:"28px 24px",boxShadow:"0 32px 64px rgba(0,0,0,0.7)",animation:shake?"shake .4s ease":"fadeup .5s ease .1s both"}}>
        <div style={{marginBottom:22}}>
          <div style={{fontWeight:800,fontSize:20,color:C.text,marginBottom:3}}>{mode==="login"?"Content de te revoir 👋":mode==="signup"?"Crée ton compte":"Mot de passe oublié"}</div>
          {mode==="login"&&<div style={{fontSize:12,color:C.textDim}}>Connecte-toi pour accéder à tes sessions</div>}
        </div>
        {mode!=="forgot"&&(
          <div style={{display:"flex",background:"rgba(255,255,255,0.04)",borderRadius:10,padding:3,marginBottom:20,gap:3}}>
            {[["login","Connexion"],["signup","Inscription"]].map(([m,l])=>(
              <button key={m} onClick={()=>resetMode(m)} style={{flex:1,padding:"9px 0",borderRadius:8,border:mode===m?"1px solid rgba(255,215,0,0.2)":"1px solid transparent",background:mode===m?"rgba(255,136,0,0.12)":"transparent",color:mode===m?"#FFD700":C.textDim,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:FF,transition:"all .15s"}}>{l}</button>
            ))}
          </div>
        )}
        {mode==="forgot"&&<button onClick={()=>resetMode("login")} style={{background:"none",border:"none",color:C.orange,fontSize:13,fontWeight:600,cursor:"pointer",marginBottom:18,padding:0,fontFamily:FF}}>← Retour</button>}
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
          {mode==="login"&&<>
            <input style={inp} type="email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSubmit()} placeholder="Email"/>
            <input style={inp} type="password" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSubmit()} placeholder="Mot de passe"/>
            <div style={{textAlign:"right",marginTop:2}}><button onClick={()=>resetMode("forgot")} style={{background:"none",border:"none",color:C.textDim,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:FF}}>Mot de passe oublié ?</button></div>
          </>}
          {mode==="signup"&&<>
            <input style={inp} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email"/>
            <input style={inp} type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mot de passe (6 car. min)"/>
            <input style={inp} type="password" value={confirmPw} onChange={e=>setConfirmPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSubmit()} placeholder="Confirmer le mot de passe"/>
          </>}
          {mode==="forgot"&&<input style={inp} type="email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSubmit()} placeholder="Ton adresse email"/>}
        </div>
        {error&&<div style={{background:"rgba(255,61,61,0.1)",border:"1px solid rgba(255,61,61,0.2)",borderRadius:8,padding:"10px 14px",color:"#FF6B6B",fontSize:13,fontWeight:600,marginBottom:14}}>{error}</div>}
        {success&&<div style={{background:"rgba(0,230,118,0.1)",border:"1px solid rgba(0,230,118,0.2)",borderRadius:8,padding:"10px 14px",color:C.win,fontSize:13,fontWeight:600,marginBottom:14}}>{success}</div>}
        <button onClick={handleSubmit} disabled={loading} style={{width:"100%",padding:"14px 0",background:loading?"rgba(255,136,0,0.5)":C.grad,border:"none",borderRadius:10,color:"#0A0A0A",fontSize:15,fontWeight:800,cursor:loading?"not-allowed":"pointer",fontFamily:FF,letterSpacing:.3}}>
          {loading?"...":mode==="login"?"Se connecter →":mode==="signup"?"Créer mon compte →":"Envoyer le lien →"}
        </button>
      </div>
    </div>
  );
}

function HomeScreen({user,grandTotal,totalHands,onNewSession,onHistory,onStats,onLogout}){
  return (
    <div style={{minHeight:"100vh",fontFamily:FF,background:C.bg,display:"flex",flexDirection:"column",position:"relative",overflow:"hidden"}}>
      {/* Ambient glow */}
      <div style={{position:"absolute",top:"35%",left:"50%",transform:"translate(-50%,-50%)",width:700,height:700,borderRadius:"50%",background:"radial-gradient(circle,rgba(255,136,0,0.07) 0%,transparent 70%)",pointerEvents:"none"}}/>

      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"24px 24px 16px",position:"relative",zIndex:1}}>
        <button onClick={onLogout} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,color:C.textDim,padding:"10px 18px",cursor:"pointer",fontSize:14,fontWeight:600,fontFamily:FF,opacity:0,pointerEvents:"none"}}>Déco</button>
        <div style={{position:"absolute",left:"50%",transform:"translateX(-50%)"}}>
          <EdgyLogo size={36}/>
        </div>
        <button onClick={onLogout} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,color:C.textDim,padding:"10px 18px",cursor:"pointer",fontSize:14,fontWeight:600,fontFamily:FF}}>Déco</button>
      </div>

      {/* Main content */}
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 24px 80px",position:"relative",zIndex:1}}>

        {/* Greeting */}
        <div style={{textAlign:"center",marginBottom:56}}>
          <div style={{fontWeight:900,fontSize:42,color:C.text,marginBottom:10,letterSpacing:-1.5,lineHeight:1.1}}>
            Bonjour,<br/>
            <span style={{background:C.grad,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{user}</span>
          </div>
          <div style={{fontSize:17,color:C.textDim,marginTop:8}}>
            {totalHands>0||grandTotal!==0
              ?<>
                Bankroll : <span style={{color:grandTotal>0?C.win:grandTotal<0?C.loss:C.text,fontWeight:900,fontSize:22}}>
                  {grandTotal>0?"+":""}{grandTotal.toLocaleString("fr-FR")} €
                </span>
                {totalHands>0&&<div style={{color:C.textDim,fontSize:15,marginTop:4}}>{totalHands} mains jouées</div>}
              </>
              :<span style={{fontSize:18}}>Prêt à dominer la table ?</span>}
          </div>
        </div>

        {/* Buttons */}
        <div style={{display:"flex",flexDirection:"column",gap:14,width:"100%",maxWidth:400}}>
          {/* CTA principale */}
          <button onClick={onNewSession} style={{
            width:"100%",padding:"28px 0",
            background:C.grad,
            border:"none",borderRadius:16,color:"#060606",
            fontSize:24,fontWeight:900,cursor:"pointer",fontFamily:FF,
            letterSpacing:.3,
            boxShadow:"0 0 60px rgba(255,136,0,0.25)",
          }}>
            + Nouvelle Session
          </button>

          {/* Secondary buttons */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <button onClick={onHistory} style={{
              padding:"24px 0",background:"rgba(255,255,255,0.04)",
              border:"1px solid rgba(255,255,255,0.1)",
              borderRadius:16,color:C.textMid,
              fontSize:19,fontWeight:700,cursor:"pointer",fontFamily:FF,
              display:"flex",flexDirection:"column",alignItems:"center",gap:10,
            }}>
              <span style={{fontSize:32}}>📋</span>
              <span>Sessions</span>
            </button>
            <button onClick={onStats} style={{
              padding:"24px 0",background:"rgba(255,255,255,0.04)",
              border:"1px solid rgba(255,255,255,0.1)",
              borderRadius:16,color:C.textMid,
              fontSize:19,fontWeight:700,cursor:"pointer",fontFamily:FF,
              display:"flex",flexDirection:"column",alignItems:"center",gap:10,
            }}>
              <span style={{fontSize:32}}>📊</span>
              <span>Stats</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


// ── Session Config ─────────────────────────────────────────────
const TOURNOI_FORMATS=["Normal","Mystery Bounty","KO","Progressive KO","Satellite"];
const CASH_BLINDS=["0.25/0.50","0.50/1","1/2","2/5","5/10","Autre"];
const CURRENCIES=["€","$","£","Autre"];

function SessionConfig({onStart,onBack}){
  const [type,setType]=useState("tournoi");
  const [name,setName]=useState("");
  const [startTime]=useState(nowStr());
  // Cash fields
  const [cave,setCave]=useState("");
  const [blinds,setBlinds]=useState("");
  const [blindsCustom,setBlindsCustom]=useState("");
  // Tournoi fields
  const [buyin,setBuyin]=useState("");
  const [currency,setCurrency]=useState("€");
  const [format,setFormat]=useState("");
  const [startingStack,setStartingStack]=useState("");
  const [nbPlayers,setNbPlayers]=useState("");
  const [playersPerTable,setPlayersPerTable]=useState("");
  const [currentSb,setCurrentSb]=useState("");
  const [currentBb,setCurrentBb]=useState("");
  const [tableSeats,setTableSeats]=useState([]);
  const [showTableSetup,setShowTableSetup]=useState(false);

  const canStart = name.trim() && (
    type==="cash" ? (cave && (blinds==="Autre"?blindsCustom:blinds)) :
    (buyin && format)
  );

  const handleStart=()=>{
    if(!canStart) return;
    onStart({
      id:uid(), name:name.trim(), type,
      startTime, startTs:Date.now(),
      // cash
      cave:type==="cash"?cave:"",
      blinds:type==="cash"?(blinds==="Autre"?blindsCustom:blinds):"",
      // tournoi
      buyin:type==="tournoi"?buyin:"",
      currency:type==="tournoi"?currency:"",
      format:type==="tournoi"?format:"",
      startingStack:type==="tournoi"?startingStack:"",
      nbPlayers:type==="tournoi"?nbPlayers:"",
      playersPerTable:type==="tournoi"?playersPerTable:"",
      currentSb:type==="tournoi"?currentSb:"",
      currentBb:type==="tournoi"?currentBb:"",
      tableSeats,
      hands:[],
    });
  };

  const sel={...inputStyle};
  const inp={...inputStyle};
  const lbl=labelStyle;

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(145deg,#1E1B4B 0%,#4C1D95 45%,#0E7490 100%)",fontFamily:FF,display:"flex",flexDirection:"column",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",width:400,height:400,borderRadius:"50%",top:"-10%",left:"-10%",background:"rgba(124,58,237,0.2)",filter:"blur(80px)",pointerEvents:"none"}}/>
      <div style={{position:"absolute",width:350,height:350,borderRadius:"50%",bottom:"-5%",right:"-5%",background:"rgba(6,182,212,0.15)",filter:"blur(70px)",pointerEvents:"none"}}/>

      {/* Header */}
      <div style={{padding:"20px 24px",position:"relative",zIndex:1}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:8,color:"rgba(255,255,255,0.7)",padding:"6px 12px",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:FF}}>← Accueil</button>
        <div style={{fontWeight:900,fontSize:22,color:"#0A0A0A",marginTop:12,letterSpacing:-0.5}}>🎯 Nouvelle Session</div>
        <div style={{color:"rgba(255,255,255,0.5)",fontSize:13,marginTop:4}}>Démarre le {startTime}</div>
      </div>

      {/* Form card */}
      <div style={{flex:1,padding:"0 16px 40px",position:"relative",zIndex:1,display:"flex",alignItems:"flex-start",justifyContent:"center"}}>
        <div style={{background:"rgba(255,255,255,0.97)",borderRadius:20,padding:24,width:"100%",maxWidth:440,boxShadow:"0 24px 60px rgba(0,0,0,0.3)"}}>

          {/* Type toggle */}
          <div style={{marginBottom:22}}>
            <label style={lbl}>Type de session</label>
            <div style={{display:"flex",background:"#1A1A1A",borderRadius:12,padding:4}}>
              {[["tournoi","🏆 Tournoi"],["cash","💵 Cash Game"]].map(([v,l])=>(
                <button key={v} onClick={()=>setType(v)} style={{flex:1,padding:"10px 0",borderRadius:9,background:type===v?"linear-gradient(135deg,#7C3AED,#06B6D4)":"transparent",border:"none",color:type===v?"#fff":C.muted,fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:FF,transition:"all .15s"}}>{l}</button>
              ))}
            </div>
          </div>

          {/* Nom */}
          <div style={{marginBottom:16}}>
            <label style={lbl}>Nom de la session <span style={{color:C.loss}}>*</span></label>
            <input style={inp} value={name} onChange={e=>setName(e.target.value)} placeholder={type==="cash"?"Ex: Casino de Paris – Vendredi":"Ex: EPT Barcelone – Day 1"}/>
          </div>

          {/* Date/heure (readonly) */}
          <div style={{marginBottom:20,background:"#1A1A1A",borderRadius:10,padding:"10px 14px",display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:18}}>🕐</span>
            <div>
              <div style={{fontSize:10,color:C.textMid,fontWeight:700,textTransform:"uppercase",letterSpacing:.8}}>Heure de début</div>
              <div style={{fontWeight:800,color:C.text,fontSize:14}}>{startTime}</div>
            </div>
          </div>

          {/* CASH fields */}
          {type==="cash"&&<>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
              <div>
                <label style={lbl}>Cave (€) <span style={{color:C.loss}}>*</span></label>
                <input style={inp} type="number" value={cave} onChange={e=>setCave(e.target.value)} placeholder="Ex: 200"/>
              </div>
              <div>
                <label style={lbl}>Blinds <span style={{color:C.loss}}>*</span></label>
                <select style={sel} value={blinds} onChange={e=>setBlinds(e.target.value)}>
                  <option value="">— Choisir —</option>
                  {CASH_BLINDS.map(b=><option key={b}>{b}</option>)}
                </select>
              </div>
            </div>
            {blinds==="Autre"&&(
              <div style={{marginBottom:16}}>
                <label style={lbl}>Blinds personnalisées</label>
                <input style={inp} value={blindsCustom} onChange={e=>setBlindsCustom(e.target.value)} placeholder="Ex: 3/6"/>
              </div>
            )}
          </>}

          {/* TOURNOI fields */}
          {type==="tournoi"&&<>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
              <div>
                <label style={lbl}>Buy-in <span style={{color:C.loss}}>*</span></label>
                <div style={{display:"flex",gap:6}}>
                  <select style={{...sel,width:70,flexShrink:0,paddingLeft:6,paddingRight:4}} value={currency} onChange={e=>setCurrency(e.target.value)}>
                    {CURRENCIES.map(c=><option key={c}>{c}</option>)}
                  </select>
                  <input style={{...inp,flex:1}} type="number" value={buyin} onChange={e=>setBuyin(e.target.value)} placeholder="Ex: 100"/>
                </div>
              </div>
              <div>
                <label style={lbl}>Format <span style={{color:C.loss}}>*</span></label>
                <select style={sel} value={format} onChange={e=>setFormat(e.target.value)}>
                  <option value="">— Choisir —</option>
                  {TOURNOI_FORMATS.map(f=><option key={f}>{f}</option>)}
                </select>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
              <div>
                <label style={lbl}>Stack de départ</label>
                <input style={inp} type="number" value={startingStack} onChange={e=>setStartingStack(e.target.value)} placeholder="Ex: 30000"/>
              </div>
              <div>
                <label style={lbl}>Nb. joueurs inscrits</label>
                <input style={inp} type="number" value={nbPlayers} onChange={e=>setNbPlayers(e.target.value)} placeholder="Ex: 200"/>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:16}}>
              <div>
                <label style={lbl}>Joueurs / table</label>
                <input style={inp} type="number" value={playersPerTable} onChange={e=>setPlayersPerTable(e.target.value)} placeholder="Ex: 9"/>
              </div>
              <div>
                <label style={lbl}>Petite blinde</label>
                <input style={inp} type="number" value={currentSb} onChange={e=>setCurrentSb(e.target.value)} placeholder="Ex: 100"/>
              </div>
              <div>
                <label style={lbl}>Grosse blinde</label>
                <input style={inp} type="number" value={currentBb} onChange={e=>setCurrentBb(e.target.value)} placeholder="Ex: 200"/>
              </div>
            </div>
          </>}

          {/* Ma table */}
          <div style={{marginBottom:16}}>
            <button onClick={()=>setShowTableSetup(v=>!v)} style={{
              width:"100%",padding:"11px 0",
              background:showTableSetup?C.lavender:"#F5F3FF",
              border:`1.5px solid ${tableSeats.some(s=>s.name)?C.primary:C.border}`,
              borderRadius:10,color:C.primary,fontSize:13,fontWeight:700,
              cursor:"pointer",fontFamily:FF,
              display:"flex",alignItems:"center",justifyContent:"center",gap:8
            }}>
              🪑 Ma table {tableSeats.some(s=>s.name)?`(${tableSeats.filter(s=>s.name).length} joueurs saisis)`:""} {showTableSetup?"▲":"▼"}
            </button>
            {showTableSetup&&(()=>{
              const nbSeats=parseInt(playersPerTable)||9;
              const ensureSeats=()=>{
                if(tableSeats.length!==nbSeats){
                  const filled=Array.from({length:nbSeats},(_,i)=>tableSeats[i]||{name:"",type:"—",nationality:"—",notes:"",isMe:i===0});
                  setTableSeats(filled);
                  return filled;
                }
                return tableSeats;
              };
              const seats=ensureSeats();
              const updateSeat=(i,field,val)=>setTableSeats(prev=>{
                const next=[...prev];
                next[i]={...next[i],[field]:val};
                return next;
              });
              return (
                <div style={{background:C.bgElevated,border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:12,marginTop:8,display:"flex",flexDirection:"column",gap:8}}>
                  {seats.map((seat,i)=>(
                    <div key={i} style={{background:seat.isMe?C.lavender:"#fff",border:`1px solid ${seat.isMe?C.primary:C.border}`,borderRadius:10,padding:"8px 10px"}}>
                      <div style={{display:"flex",alignItems:"flex-end",gap:6,flexWrap:"wrap"}}>
                        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:seat.isMe?0:0}}>
                          <div style={{width:22,height:22,borderRadius:"50%",background:seat.isMe?"linear-gradient(135deg,#7C3AED,#06B6D4)":"#E5E7EB",display:"flex",alignItems:"center",justifyContent:"center",color:seat.isMe?"#fff":C.muted,fontSize:10,fontWeight:800,flexShrink:0}}>{i+1}</div>
                        </div>
                        {seat.isMe
                          ?<span style={{fontWeight:800,color:C.primary,fontSize:12}}>Moi</span>
                          :<>
                            <input value={seat.name} onChange={e=>updateSeat(i,"name",e.target.value)}
                              placeholder={`Siège ${i+1} — Pseudo`}
                              style={{...inputStyle,padding:"6px 8px",fontSize:11,flex:1,minWidth:80}}/>
                            <div style={{display:"flex",flexDirection:"column",gap:1}}>
                              <span style={{fontSize:9,color:C.textMid,fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>Pays</span>
                              <select value={seat.nationality||"—"} onChange={e=>updateSeat(i,"nationality",e.target.value)}
                                style={{...inputStyle,padding:"6px 6px",fontSize:10,width:110}}>
                                {NATIONALITIES.map(n=><option key={n}>{n}</option>)}
                              </select>
                            </div>
                            <div style={{display:"flex",flexDirection:"column",gap:1}}>
                              <span style={{fontSize:9,color:C.textMid,fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>Style</span>
                              <select value={seat.type} onChange={e=>updateSeat(i,"type",e.target.value)}
                                style={{...inputStyle,padding:"6px 6px",fontSize:10,width:90,color:seat.type==="—"?C.muted:C.navy}}>
                                {PLAYER_TYPES.map(t=><option key={t}>{t}</option>)}
                              </select>
                            </div>
                          </>
                        }
                      </div>
                      {!seat.isMe&&<input value={seat.notes} onChange={e=>updateSeat(i,"notes",e.target.value)}
                        placeholder="Notes…"
                        style={{...inputStyle,padding:"5px 8px",fontSize:10,width:"100%",boxSizing:"border-box",marginTop:4}}/>}
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

          <button onClick={handleStart} disabled={!canStart} style={{width:"100%",padding:"14px 0",background:canStart?"linear-gradient(135deg,#7C3AED,#06B6D4)":"#E5E7EB",border:"none",borderRadius:12,color:canStart?"#fff":"#9CA3AF",fontSize:16,fontWeight:800,cursor:canStart?"pointer":"not-allowed",fontFamily:FF,boxShadow:canStart?"0 6px 20px rgba(124,58,237,0.4)":"none",transition:"all .2s"}}>
            Démarrer la session 🚀
          </button>
        </div>
      </div>
    </div>
  );
}

// ── MiniCard ──────────────────────────────────────────────────
function MiniCard({card,size="md"}){
  const dims=size==="sm"?{w:28,h:38,fs:10,sf:12}:{w:38,h:52,fs:13,sf:16};
  if(!card) return <div style={{width:dims.w,height:dims.h,borderRadius:6,background:"#1A1A1A",border:"2px dashed #C4B5FD",display:"flex",alignItems:"center",justifyContent:"center",color:"#C4B5FD",fontSize:dims.sf}}>?</div>;
  return (
    <div style={{width:dims.w,height:dims.h,borderRadius:6,background:C.bgCard,border:"1.5px solid #E5E7EB",boxShadow:"0 2px 8px rgba(0,0,0,0.10)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",color:suitColor(card[1]),fontWeight:800,gap:1,userSelect:"none"}}>
      <span style={{fontSize:dims.fs,lineHeight:1}}>{card[0]}</span>
      <span style={{fontSize:dims.sf,lineHeight:1}}>{card[1]}</span>
    </div>
  );
}

// ── CardPicker ────────────────────────────────────────────────
function CardPicker({value,onChange,label,usedCards=[]}){
  const [open,setOpen]=useState(false);
  const ref=useRef();
  useEffect(()=>{
    const close=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false);};
    document.addEventListener("mousedown",close);
    return ()=>document.removeEventListener("mousedown",close);
  },[]);
  return (
    <div ref={ref} style={{position:"relative",display:"inline-block"}}>
      <button onClick={()=>setOpen(o=>!o)} style={{width:46,height:62,borderRadius:8,background:value?"#fff":"#F5F3FF",border:value?"2px solid #7C3AED":"2px dashed #C4B5FD",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:1,color:value?suitColor(value[1]):"#C4B5FD",fontWeight:800,boxShadow:value?"0 2px 12px rgba(124,58,237,0.18)":"none",transition:"all .15s"}}>
        {value?<><span style={{fontSize:13}}>{value[0]}</span><span style={{fontSize:16}}>{value[1]}</span></>:<span style={{fontSize:10,fontWeight:600}}>{label}</span>}
      </button>
      {open&&(
        <div style={{position:"absolute",top:68,left:"50%",transform:"translateX(-50%)",zIndex:200,background:C.bgCard,border:"1.5px solid #E0D9FF",borderRadius:14,padding:10,width:230,boxShadow:"0 20px 60px rgba(124,58,237,0.18)"}}>
          {SUITS.map(s=>(
            <div key={s} style={{display:"flex",gap:3,marginBottom:3}}>
              {RANKS.map(r=>{
                const card=r+s;
                const used=usedCards.includes(card)&&card!==value;
                return (
                  <button key={card} onClick={()=>{if(!used){onChange(card);setOpen(false);}}} style={{
                    width:24,height:30,borderRadius:5,
                    border:value===card?"2px solid #7C3AED":used?"1px solid #F3E8FF":"1px solid #E5E7EB",
                    background:value===card?"#EDE9FE":used?"#F9F5FF":"#FAFAFA",
                    color:used?"#D8B4FE":suitColor(s),
                    fontSize:9,cursor:used?"not-allowed":"pointer",fontWeight:700,
                    opacity:used?0.45:1,
                    textDecoration:used?"line-through":"none"
                  }}>{r}{s}</button>
                );
              })}
            </div>
          ))}
          {value&&<button onClick={()=>{onChange(null);setOpen(false);}} style={{marginTop:6,width:"100%",background:"rgba(255,61,61,0.1)",border:"1px solid #FECACA",color:C.loss,borderRadius:6,padding:"4px 0",cursor:"pointer",fontSize:11,fontWeight:600}}>Effacer</button>}
        </div>
      )}
    </div>
  );
}

// ── Sparkline ─────────────────────────────────────────────────
function Sparkline({hands,width=300,height=80}){
  if(hands.length<2) return <div style={{height,display:"flex",alignItems:"center",justifyContent:"center",color:"#C4B5FD",fontSize:12}}>Saisis au moins 2 mains</div>;
  // Prefer stackAfter curve if available, else cumulative gain
  const hasStack=hands.some(h=>h.stackAfter);
  const reversed=hands.slice().reverse();
  const values=hasStack
    ? reversed.map(h=>h.stackAfter||null).filter(v=>v!==null)
    : reversed.reduce((acc,h,i)=>{acc.push((acc[i-1]||0)+h.result);return acc;},[]);
  if(values.length<2) return <div style={{height,display:"flex",alignItems:"center",justifyContent:"center",color:"#C4B5FD",fontSize:12}}>Saisis au moins 2 mains avec stack</div>;
  const min=Math.min(...values),max=Math.max(...values),range=max-min||1;
  const pad=8,w=width-pad*2,h2=height-pad*2;
  const pts=values.map((v,i)=>({x:pad+(i/(values.length-1))*w,y:pad+(1-(v-min)/range)*h2}));
  const d=pts.map((p,i)=>`${i===0?"M":"L"}${p.x},${p.y}`).join(" ");
  const last=values[values.length-1];
  const first=values[0];
  const color=last>=first?C.win:C.loss;
  return (
    <svg width={width} height={height} style={{overflow:"visible"}}>
      <defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity=".25"/><stop offset="100%" stopColor={color} stopOpacity=".02"/></linearGradient></defs>
      <path d={`${d} L${pts[pts.length-1].x},${height} L${pts[0].x},${height} Z`} fill="url(#sg)"/>
      <path d={d} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={pts[pts.length-1].x} cy={pts[pts.length-1].y} r={4} fill={color}/>
    </svg>
  );
}

// ── StatBox ───────────────────────────────────────────────────
function StatBox({label,value,color}){
  return (
    <div style={{flex:1,background:"#1A1A1A",borderRadius:12,padding:"12px 16px",border:"1px solid rgba(255,255,255,0.08)",minWidth:0}}>
      <div style={{fontSize:10,color:C.textMid,fontWeight:600,textTransform:"uppercase",letterSpacing:.8,marginBottom:4}}>{label}</div>
      <div style={{fontSize:20,fontWeight:800,color:color||C.navy,fontVariantNumeric:"tabular-nums"}}>{value}</div>
    </div>
  );
}

function StatsBar({hands}){
  if(!hands.length) return null;
  const total=hands.reduce((s,h)=>s+h.result,0);
  const wins=hands.filter(h=>h.result>0).length;
  const wr=Math.round(wins/hands.length*100);
  const best=Math.max(...hands.map(h=>h.result));
  return (
    <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
      <StatBox label="Total" value={fmtChips(total)} color={total>0?C.win:total<0?C.loss:C.muted}/>
      <StatBox label="Mains" value={hands.length}/>
      <StatBox label="Winrate" value={wr+"%"} color={wr>=50?C.win:C.loss}/>
      <StatBox label="Best" value={fmtChips(best)} color={C.win}/>
    </div>
  );
}

// ── HandForm ──────────────────────────────────────────────────
const NB_PLAYERS=[2,3,4,5,6,7,8,9,10];

function HandForm({onSave,sessionName,sessionType,defaultSb="",defaultBb="",defaultAnte="",defaultStack="",defaultRemaining="",defaultPaidPlaces=""}){
  const [card1,setCard1]=useState(null);
  const [card2,setCard2]=useState(null);
  const [board,setBoard]=useState([null,null,null,null,null]);
  const [position,setPosition]=useState("");
  const [nbPlayers,setNbPlayers]=useState(2);
  const [villains,setVillains]=useState([{cards:[null,null],position:""}]);
  const [sb,setSb]=useState(defaultSb);
  const [bb,setBb]=useState(defaultBb);
  const [ante,setAnte]=useState(defaultAnte||defaultBb);
  const [gain,setGain]=useState("");
  const [stackAfter,setStackAfter]=useState(String(defaultStack));
  const [finalStreet,setFinalStreet]=useState("");
  const [note,setNote]=useState("");
  const [action,setAction]=useState("");

  // Update blinds when session blinds change
  useEffect(()=>{
    setSb(defaultSb);
    setBb(defaultBb);
    setAnte(defaultAnte||defaultBb);
    setStackAfter(String(defaultStack));
  },[defaultSb,defaultBb,defaultAnte,defaultStack]);

  // Sync villain count when nbPlayers changes
  const handleNbPlayers=(n)=>{
    setNbPlayers(n);
    const count=n-1;
    setVillains(prev=>{
      if(prev.length===count) return prev;
      if(prev.length<count) return [...prev,...Array(count-prev.length).fill(null).map(()=>({cards:[null,null],position:""}))];
      return prev.slice(0,count);
    });
  };

  const updateVillain=(i,field,val)=>{
    setVillains(prev=>prev.map((v,idx)=>idx===i?{...v,[field]:val}:v));
  };
  const updateVillainCard=(i,cardIdx,val)=>{
    setVillains(prev=>prev.map((v,idx)=>idx===i?{...v,cards:v.cards.map((c,ci)=>ci===cardIdx?val:c)}:v));
  };

  const updateBoard=(i,v)=>{const b=[...board];b[i]=v;setBoard(b);};

  // All used cards — for blocking duplicates
  const usedCards=[card1,card2,...villains.flatMap(v=>v.cards),...board].filter(Boolean);
  // All used positions
  const usedPositions=[position,...villains.map(v=>v.position)].filter(Boolean);

  const save=()=>{
    if(gain==="") return;
    onSave({
      id:uid(),ts:Date.now(),sessionName,sessionType,
      card1,card2,board:board.some(Boolean)?board:null,
      position,nbPlayers,villains,sb,bb,ante,
      remaining:defaultRemaining||"",
      paidPlaces:defaultPaidPlaces||"",
      result:parseFloat(gain)||0,
      stackAfter:parseFloat(stackAfter)||null,
      finalStreet,note,action
    });
    setCard1(null);setCard2(null);setBoard([null,null,null,null,null]);
    setPosition("");setNbPlayers(2);setVillains([{cards:[null,null],position:""}]);
    setSb(defaultSb);setBb(defaultBb);setAnte(defaultAnte||defaultBb);setGain("");setStackAfter(String(defaultStack));setFinalStreet("");setNote("");setAction("");
  };

  const inp={...inputStyle};
  const lbl=labelStyle;
  const canSave=gain!=="";

  const SectionTitle=({emoji,title})=>(
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12,paddingBottom:8,borderBottom:`1.5px solid ${C.border}`}}>
      <span style={{fontSize:16}}>{emoji}</span>
      <span style={{fontWeight:800,fontSize:13,color:C.text,letterSpacing:.3}}>{title}</span>
    </div>
  );

  // Position dropdown — filters out already-used positions
  const PosSelect=({value,onChange,exclude=[],label,color=C.primary})=>(
    <div>
      <label style={lbl}>{label}</label>
      <select value={value} onChange={e=>onChange(e.target.value)} style={{...inp,borderColor:value?color:C.border,color:value?color:C.textMid,fontWeight:value?700:400}}>
        <option value="">— Position —</option>
        {POSITIONS.map(p=>{
          const blocked=exclude.includes(p)&&p!==value;
          return <option key={p} value={p} disabled={blocked} style={{color:blocked?"#D1D5DB":undefined}}>{p}{blocked?" ✗":""}</option>;
        })}
      </select>
    </div>
  );

  return (
    <div style={{background:C.bgCard,borderRadius:16,padding:20,border:"1px solid rgba(255,255,255,0.08)",boxShadow:"0 4px 24px rgba(124,58,237,0.07)",display:"flex",flexDirection:"column",gap:20}}>

      {/* ── Mes cartes ── */}
      <div>
        <SectionTitle emoji="🂠" title="Mes cartes"/>
        <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:12}}>
          <CardPicker value={card1} onChange={setCard1} label="C1" usedCards={usedCards}/>
          <CardPicker value={card2} onChange={setCard2} label="C2" usedCards={usedCards}/>
          {card1&&card2&&<span style={{color:C.primary,fontSize:12,fontWeight:700}}>✓ {card1} {card2}</span>}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <PosSelect value={position} onChange={v=>{setPosition(v);}} exclude={usedPositions.filter(p=>p!==position)} label="Ma position" color={C.primary}/>
          <div>
            <label style={lbl}>Nb. joueurs dans la main</label>
            <select value={nbPlayers} onChange={e=>handleNbPlayers(Number(e.target.value))} style={inp}>
              {NB_PLAYERS.map(n=><option key={n} value={n}>{n} joueurs</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── Adversaires ── */}
      <div>
        <SectionTitle emoji="👤" title={`Adversaire${nbPlayers>2?"s":""} (optionnel)`}/>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {villains.map((v,i)=>(
            <div key={i} style={{background:"#F8F7FF",borderRadius:12,padding:12,border:"1px solid rgba(255,255,255,0.08)"}}>
              <div style={{fontSize:11,color:"#0369A1",fontWeight:800,marginBottom:8,textTransform:"uppercase",letterSpacing:.5}}>Villain {nbPlayers>2?i+1:""}</div>
              <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:10}}>
                <CardPicker value={v.cards[0]} onChange={val=>updateVillainCard(i,0,val)} label="V1" usedCards={usedCards}/>
                <CardPicker value={v.cards[1]} onChange={val=>updateVillainCard(i,1,val)} label="V2" usedCards={usedCards}/>
                {v.cards[0]&&v.cards[1]&&<span style={{color:"#0369A1",fontSize:12,fontWeight:700}}>✓ {v.cards[0]} {v.cards[1]}</span>}
              </div>
              <PosSelect value={v.position} onChange={val=>updateVillain(i,"position",val)} exclude={usedPositions.filter(p=>p!==v.position)} label="Position" color="#0369A1"/>
            </div>
          ))}
        </div>
      </div>

      {/* ── Board ── */}
      <div>
        <SectionTitle emoji="🃏" title="Board (optionnel)"/>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {["F1","F2","F3","Turn","River"].map((l,i)=>(
            <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
              <span style={{fontSize:9,color:C.textMid,fontWeight:600}}>{l}</span>
              <CardPicker value={board[i]} onChange={v=>updateBoard(i,v)} label={l} usedCards={usedCards}/>
            </div>
          ))}
        </div>
      </div>

      {/* ── Détails ── */}
      <div>
        <SectionTitle emoji="📋" title="Détails de la main"/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
          <div><label style={lbl}>Street finale</label><select value={finalStreet} onChange={e=>setFinalStreet(e.target.value)} style={inp}><option value="">—</option>{STREETS.map(s=><option key={s}>{s}</option>)}</select></div>
          <div><label style={lbl}>Action finale</label><select value={action} onChange={e=>setAction(e.target.value)} style={inp}><option value="">—</option>{ACTIONS.map(a=><option key={a}>{a}</option>)}</select></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:10}}>
          <div>
            <label style={lbl}>Petite Blinde</label>
            <input value={sb} onChange={e=>{
              const v=e.target.value;
              setSb(v);
              const n=parseFloat(v);
              if(!isNaN(n)&&n>0){
                const bbVal=n*2;
                setBb(String(bbVal%1===0?bbVal:bbVal.toFixed(2)));
                setAnte(String(bbVal%1===0?bbVal:bbVal.toFixed(2)));
              }
            }} placeholder="ex: 100" style={inp}/>
          </div>
          <div>
            <label style={lbl}>Grosse Blinde</label>
            <input value={bb} onChange={e=>{
              const v=e.target.value;
              setBb(v);
              setAnte(v);
            }} placeholder="ex: 200" style={inp}/>
          </div>
          <div>
            <label style={lbl}>Ante</label>
            <input value={ante} onChange={e=>setAnte(e.target.value)} placeholder="ex: 200" style={inp}/>
          </div>
        </div>
      </div>

      {/* ── Gain & Stack ── */}
      <div>
        <SectionTitle emoji="💰" title="Gain / Perte & Stack"/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
          <div>
            <label style={lbl}>Gain / Perte (jetons) <span style={{color:C.loss}}>*</span></label>
            <input type="number" value={gain} onChange={e=>{
              const v=e.target.value;
              setGain(v);
              const g=parseFloat(v);
              const base=parseFloat(defaultStack)||0;
              if(!isNaN(g)&&base) setStackAfter(String(base+g));
            }} placeholder="ex: +2500 ou -800"
              style={{...inp,fontSize:20,fontWeight:800,textAlign:"center",
                borderColor:gain===""?C.border:parseFloat(gain)>0?C.win:parseFloat(gain)<0?C.loss:C.muted,
                background:gain===""?"#FAFAFA":parseFloat(gain)>0?"#F0FDF4":parseFloat(gain)<0?"#FEF2F2":"#FAFAFA",
                color:gain===""?C.muted:parseFloat(gain)>0?C.win:parseFloat(gain)<0?C.loss:C.muted}}/>
          </div>
          <div>
            <label style={lbl}>Mon stack après la main</label>
            <input type="number" value={stackAfter} onChange={e=>setStackAfter(e.target.value)} placeholder="ex: 42000"
              style={{...inp,fontSize:20,fontWeight:800,textAlign:"center",
                borderColor:stackAfter?C.primary:C.border,
                color:stackAfter?C.navy:C.muted}}/>
          </div>
        </div>
        <label style={lbl}>Note / analyse</label>
        <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Décris la main, tes reads, ce que tu aurais dû faire…" rows={2} style={{...inp,resize:"vertical"}}/>
      </div>

      <button onClick={save} disabled={!canSave} style={{width:"100%",padding:"13px 0",background:canSave?"linear-gradient(135deg,#7C3AED,#06B6D4)":"#F3F4F6",border:"none",borderRadius:10,color:canSave?"#fff":"#9CA3AF",fontSize:15,fontWeight:700,cursor:canSave?"pointer":"not-allowed",fontFamily:FF,boxShadow:canSave?"0 4px 18px rgba(124,58,237,0.3)":"none",transition:"all .2s"}}>
        Enregistrer la main
      </button>
    </div>
  );
}

// ── Tag ───────────────────────────────────────────────────────
function Tag({children,color="#F0FDF4",text="#166534"}){
  return <span style={{background:color,color:text,fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:20,textTransform:"uppercase",letterSpacing:.5}}>{children}</span>;
}

// ── HandCard ──────────────────────────────────────────────────
function HandCard({hand,onShare,onEdit}){
  const won=hand.result>0,lost=hand.result<0;
  const rc=won?C.win:lost?C.loss:C.muted;
  const rb=won?"#F0FDF4":lost?"#FEF2F2":"#F9FAFB";
  const villains=hand.villains||[];
  return (
    <div style={{background:C.bgCard,border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:"12px 14px",boxShadow:"0 2px 10px rgba(124,58,237,0.05)",borderLeft:`4px solid ${rc}`}}>
      <div style={{display:"flex",alignItems:"flex-start",gap:10,flexWrap:"wrap"}}>
        {/* Hero */}
        <div style={{display:"flex",flexDirection:"column",gap:3,flexShrink:0}}>
          <div style={{fontSize:9,color:C.primary,fontWeight:700,textTransform:"uppercase"}}>Moi{hand.position?` · ${hand.position}`:""}</div>
          <div style={{display:"flex",gap:4}}><MiniCard card={hand.card1} size="sm"/><MiniCard card={hand.card2} size="sm"/></div>
        </div>
        {/* Villains */}
        {villains.filter(v=>v.cards&&v.cards.some(Boolean)).map((v,i)=>(
          <div key={i} style={{display:"flex",flexDirection:"column",gap:3,flexShrink:0}}>
            <div style={{fontSize:9,color:"#0369A1",fontWeight:700,textTransform:"uppercase"}}>V{villains.length>1?i+1:""}{v.position?` · ${v.position}`:""}</div>
            <div style={{display:"flex",gap:4}}><MiniCard card={v.cards[0]} size="sm"/><MiniCard card={v.cards[1]} size="sm"/></div>
          </div>
        ))}
        {/* Board */}
        {hand.board?.some(Boolean)&&(
          <div style={{display:"flex",flexDirection:"column",gap:3,flexShrink:0}}>
            <div style={{fontSize:9,color:C.textMid,fontWeight:700,textTransform:"uppercase"}}>Board</div>
            <div style={{display:"flex",gap:3}}>{hand.board.filter(Boolean).map((c,i)=><MiniCard key={i} card={c} size="sm"/>)}</div>
          </div>
        )}
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:3}}>
            {hand.finalStreet&&<Tag color="#E0F2FE" text="#0369A1">{hand.finalStreet}</Tag>}
            {hand.action&&<Tag color="#F3E8FF" text="#7C3AED">{hand.action}</Tag>}
            {hand.nbPlayers&&<Tag color="#FEF3C7" text="#92400E">{hand.nbPlayers}P</Tag>}
            {(()=>{
              const r=parseInt(hand.remaining)||0;
              const p=parseInt(hand.paidPlaces)||0;
              if(!r||!p) return hand.remaining?<Tag color="#F0FDF4" text="#166534">👥 {hand.remaining}</Tag>:null;
              const threshold=Math.max(1,Math.round(p*0.1));
              if(r===p+1) return <Tag color="#FEF2F2" text="#EF4444">🫧 BULLE</Tag>;
              if(r>p+1&&r<=p+threshold) return <Tag color="#FEF3C7" text="#D97706">🫧 Proche bulle · {r}</Tag>;
              if(r<=p) return <Tag color="#F0FDF4" text="#16A34A">💰 ITM · {r}</Tag>;
              return <Tag color="#F0FDF4" text="#166834">👥 {r} restants</Tag>;
            })()}
          </div>
          {hand.note&&<div style={{color:C.textMid,fontSize:11,fontStyle:"italic",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{hand.note}</div>}
          <div style={{color:"#D1D5DB",fontSize:10,marginTop:3}}>{fmtDate(hand.ts)}</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6,flexShrink:0}}>
          <div style={{background:rb,borderRadius:10,padding:"6px 12px",color:rc,fontWeight:800,fontSize:16,fontVariantNumeric:"tabular-nums"}}>{fmtChips(hand.result)}</div>
          {hand.stackAfter&&<div style={{fontSize:10,color:C.textMid,fontWeight:600}}>Stack : {hand.stackAfter.toLocaleString()}</div>}
          <div style={{display:"flex",gap:5}}>
            <button onClick={()=>onEdit&&onEdit(hand)} style={{background:"#1A1A1A",border:"none",borderRadius:8,padding:"5px 8px",color:C.primary,fontSize:11,cursor:"pointer",fontWeight:700}}>✏️</button>
            <button onClick={()=>onShare(hand)} style={{background:"#1A1A1A",border:"none",borderRadius:8,padding:"5px 8px",color:C.primary,fontSize:11,cursor:"pointer",fontWeight:700}}>📸</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ShareStudio ───────────────────────────────────────────────
function ShareStudio({hand,session,onClose,initialMode="hand"}){
  const [mode,setMode]=useState(initialMode); // "hand" | "table"
  const [dealerSeat,setDealerSeat]=useState(0);
  const canvasRef=useRef();
  const W=1080,H=1920;

  // ── Canvas helpers ────────────────────────────────────────
  function rr(ctx,x,y,w,h,r){
    ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);
    ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);
    ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();
  }

  function drawBackground(ctx){
    // Deep dark gradient
    const bg=ctx.createLinearGradient(0,0,0,H);
    bg.addColorStop(0,"#0a0612");bg.addColorStop(1,"#0d0a1a");
    ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
    // Subtle radial glow top
    const g=ctx.createRadialGradient(W/2,H*.15,0,W/2,H*.15,W*.6);
    g.addColorStop(0,"rgba(124,58,237,0.12)");g.addColorStop(1,"transparent");
    ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  }

  function drawTable(ctx,cx,cy,rx,ry){
    // Outer shadow glow
    ctx.shadowColor="rgba(0,0,0,0.8)";ctx.shadowBlur=60;
    // Rail — metallic gray
    const rail=ctx.createLinearGradient(cx-rx,cy,cx+rx,cy);
    rail.addColorStop(0,"#555");rail.addColorStop(0.3,"#aaa");rail.addColorStop(0.5,"#ddd");
    rail.addColorStop(0.7,"#aaa");rail.addColorStop(1,"#555");
    ctx.fillStyle=rail;
    ctx.beginPath();ctx.ellipse(cx,cy,rx+22,ry+22,0,0,Math.PI*2);ctx.fill();
    ctx.shadowBlur=0;
    // Inner rail dark border
    ctx.fillStyle="#222";
    ctx.beginPath();ctx.ellipse(cx,cy,rx+14,ry+14,0,0,Math.PI*2);ctx.fill();
    // Felt
    const felt=ctx.createRadialGradient(cx,cy-ry*.2,0,cx,cy,rx);
    felt.addColorStop(0,"#1e7a3a");felt.addColorStop(0.6,"#166534");felt.addColorStop(1,"#0f4d27");
    ctx.fillStyle=felt;
    ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);ctx.fill();
    // Inner felt line
    ctx.strokeStyle="rgba(255,255,255,0.06)";ctx.lineWidth=3;
    ctx.beginPath();ctx.ellipse(cx,cy,rx-18,ry-18,0,0,Math.PI*2);ctx.stroke();
  }

  function drawPlayingCard(ctx,x,y,cw,ch,card,faceDown=false){
    const r=Math.round(cw*.12);
    ctx.shadowColor="rgba(0,0,0,0.5)";ctx.shadowBlur=12;ctx.shadowOffsetY=4;
    if(faceDown||!card){
      ctx.fillStyle="#1a3a6a";rr(ctx,x,y,cw,ch,r);ctx.fill();
      ctx.shadowBlur=0;ctx.shadowOffsetY=0;
      ctx.strokeStyle="rgba(255,255,255,0.15)";ctx.lineWidth=1.5;rr(ctx,x,y,cw,ch,r);ctx.stroke();
      // pattern
      ctx.fillStyle="rgba(255,255,255,0.05)";
      for(let i=0;i<5;i++) for(let j=0;j<8;j++){
        ctx.fillText("♦",x+cw*.15+i*(cw*.18),y+ch*.1+j*(ch*.12));
      }
      return;
    }
    ctx.fillStyle="#ffffff";rr(ctx,x,y,cw,ch,r);ctx.fill();
    ctx.shadowBlur=0;ctx.shadowOffsetY=0;
    ctx.strokeStyle="#e5e7eb";ctx.lineWidth=1.5;rr(ctx,x,y,cw,ch,r);ctx.stroke();
    const sc=suitColor(card[1]);
    // Top-left rank+suit
    ctx.fillStyle=sc;
    ctx.font=`bold ${Math.round(cw*.28)}px system-ui`;
    ctx.textAlign="left";ctx.textBaseline="top";
    ctx.fillText(card[0],x+cw*.1,y+cw*.08);
    ctx.font=`${Math.round(cw*.26)}px serif`;
    ctx.fillText(card[1],x+cw*.1,y+cw*.35);
    // Big center suit
    ctx.font=`${Math.round(cw*.48)}px serif`;
    ctx.textAlign="center";ctx.textBaseline="middle";
    ctx.fillText(card[1],x+cw/2,y+ch*.65);
  }

  function drawPlayerBadge(ctx,cx,cy,label,stack,cards,isHero,faceDown=false){
    const cw=Math.round(W*.085),ch=Math.round(cw*1.4),gap=Math.round(W*.012);
    const totalCW=cw*2+gap;
    // Cards
    const cardY=cy-(isHero?ch+10:-10);
    drawPlayingCard(ctx,cx-totalCW/2,cardY,cw,ch,cards[0],faceDown&&!isHero);
    drawPlayingCard(ctx,cx-totalCW/2+cw+gap,cardY,cw,ch,cards[1],faceDown&&!isHero);
    // Name badge
    const badgeY=isHero?cy-ch-10-32:cy+ch*.9+6;
    const badgeW=Math.max(160,totalCW+20),badgeH=30;
    ctx.fillStyle=isHero?"rgba(124,58,237,0.9)":"rgba(0,0,0,0.75)";
    rr(ctx,cx-badgeW/2,badgeY,badgeW,badgeH,badgeH/2);ctx.fill();
    ctx.strokeStyle=isHero?"#a78bfa":"rgba(255,255,255,0.2)";ctx.lineWidth=isHero?2:1;
    rr(ctx,cx-badgeW/2,badgeY,badgeW,badgeH,badgeH/2);ctx.stroke();
    ctx.fillStyle="#fff";ctx.font=`bold ${isHero?14:12}px system-ui`;
    ctx.textAlign="center";ctx.textBaseline="middle";
    ctx.fillText(label,cx,badgeY+badgeH/2);
    // Stack badge
    if(stack){
      const sY=badgeY+(isHero?-34:badgeH+4);
      ctx.fillStyle="rgba(0,0,0,0.6)";
      const sW=120,sH=24;
      rr(ctx,cx-sW/2,sY,sW,sH,sH/2);ctx.fill();
      ctx.fillStyle="#f59e0b";ctx.font=`bold 13px system-ui`;
      ctx.textAlign="center";ctx.textBaseline="middle";
      ctx.fillText(typeof stack==="number"?stack.toLocaleString():stack,cx,sY+sH/2);
    }
  }

  function drawDealerButton(ctx,x,y){
    ctx.fillStyle="#e5e7eb";
    ctx.shadowColor="rgba(0,0,0,0.4)";ctx.shadowBlur=8;
    ctx.beginPath();ctx.arc(x,y,18,0,Math.PI*2);ctx.fill();
    ctx.shadowBlur=0;
    ctx.strokeStyle="#9ca3af";ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,18,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle="#1e1b4b";ctx.font=`bold 13px system-ui`;
    ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText("D",x,y);
  }

  // ── Seat positions around oval ───────────────────────────
  function getSeatPositions(n,cx,cy,rx,ry){
    // Seat 0 = bottom center (hero), then clockwise
    return Array.from({length:n},(_,i)=>{
      const angle=(Math.PI/2)+((2*Math.PI/n)*i); // start bottom, go clockwise
      return {
        x:cx+Math.cos(angle)*rx,
        y:cy+Math.sin(angle)*ry
      };
    });
  }

  // ── Draw player positioned relative to table edge ────────
  function drawPlayerOnTable(ctx,px,py,cards,label,stack,isHero,W,trx,try_,tcx,tcy,angle){
    const cw=Math.round(W*.088),ch=Math.round(cw*1.4),gap=8;
    const totalCW=cw*2+gap;

    // Cards above or below player based on angle (top half = cards below badge, bottom = above)
    const isBottom=Math.sin(angle)>0.3; // hero zone
    const isTop=Math.sin(angle)<-0.3;

    const cardOffY=isBottom?-(ch+40):(ch*.1+8);
    const labelOffY=isBottom?0:ch+8;

    // Cards
    drawPlayingCard(ctx,px-totalCW/2,py+cardOffY,cw,ch,cards[0],!isHero&&!cards[0]);
    drawPlayingCard(ctx,px-totalCW/2+cw+gap,py+cardOffY,cw,ch,cards[1],!isHero&&!cards[1]);

    // Name badge
    const bw=Math.max(180,totalCW+24),bh=32;
    const by=py+labelOffY;
    ctx.fillStyle=isHero?"rgba(124,58,237,0.92)":"rgba(0,0,0,0.78)";
    ctx.shadowColor=isHero?"rgba(124,58,237,0.6)":"rgba(0,0,0,0.4)";
    ctx.shadowBlur=isHero?16:8;
    rr(ctx,px-bw/2,by,bw,bh,bh/2);ctx.fill();
    ctx.shadowBlur=0;
    ctx.strokeStyle=isHero?"#a78bfa":"rgba(255,255,255,0.18)";
    ctx.lineWidth=isHero?2:1;
    rr(ctx,px-bw/2,by,bw,bh,bh/2);ctx.stroke();

    ctx.fillStyle="#fff";ctx.font=`bold ${isHero?15:13}px system-ui`;
    ctx.textAlign="center";ctx.textBaseline="middle";
    ctx.fillText(label,px,by+bh/2);

    // Stack
    if(stack){
      const sw=130,sh=26;
      const sy=isBottom?by+bh+6:by-sh-6;
      ctx.fillStyle="rgba(0,0,0,0.65)";rr(ctx,px-sw/2,sy,sw,sh,sh/2);ctx.fill();
      ctx.fillStyle="#f59e0b";ctx.font=`bold 14px system-ui`;
      ctx.textAlign="center";ctx.textBaseline="middle";
      ctx.fillText(typeof stack==="number"?stack.toLocaleString():stack,px,sy+sh/2);
    }
  }

  // ── Download: HAND ──────────────────────────────────────
  const downloadHand=useCallback((previewOnly=false)=>{
    const canvas=canvasRef.current;
    canvas.width=W;canvas.height=H;
    const ctx=canvas.getContext("2d");
    drawBackground(ctx);

    const won=hand.result>0,lost=hand.result<0;
    const rc=won?"#10B981":lost?"#EF4444":"#9CA3AF";
    const board=(hand.board?.filter(Boolean))||[];
    const villains=(hand.villains||[]).filter(v=>v.cards?.some(Boolean)||v.position);

    // ── Layout zones ──
    // Top zone: header + result
    // Middle: table (big, dominant)
    // Bottom: street/note/footer

    const headerH=280;
    const footerH=180;
    const tableZoneH=H-headerH-footerH;
    const tcx=W/2;
    const tcy=headerH+tableZoneH/2;
    const trx=W*.43;   // horizontal radius
    const try_=tableZoneH*.36; // vertical radius — taller than Winamax since story is tall

    // ── Header: result ──
    ctx.fillStyle="rgba(255,255,255,0.2)";ctx.font=`bold 24px system-ui`;
    ctx.textAlign="center";ctx.textBaseline="top";ctx.fillText("🃏 Poker Log",W/2,48);

    // Big result with glow
    ctx.font=`900 128px system-ui`;ctx.fillStyle=rc;
    ctx.shadowColor=rc;ctx.shadowBlur=60;ctx.textBaseline="top";
    ctx.fillText((won?"+":"")+fmtChips(hand.result),W/2,100);
    ctx.shadowBlur=0;
    ctx.font=`bold 34px system-ui`;ctx.fillStyle="rgba(255,255,255,0.55)";
    ctx.fillText(won?"VICTOIRE 🏆":lost?"DÉFAITE 💀":"BREAKEVEN 🤝",W/2,254);

    // ── Table ──
    drawTable(ctx,tcx,tcy,trx,try_);

    // ── Board — center of table ──
    if(board.length>0){
      const bcw=Math.round(W*.1),bch=Math.round(bcw*1.4),bgap=8;
      const totBW=board.length*(bcw+bgap)-bgap;
      let bx=tcx-totBW/2;const by=tcy-bch/2;
      board.forEach(c=>{drawPlayingCard(ctx,bx,by,bcw,bch,c);bx+=bcw+bgap;});
    }

    // Blindes on felt (below board)
    if(hand.sb&&hand.bb){
      ctx.fillStyle="rgba(255,255,255,0.18)";ctx.font=`bold 20px system-ui`;
      ctx.textAlign="center";ctx.textBaseline="middle";
      ctx.fillText(`${hand.sb} / ${hand.bb}${hand.ante?` · Ante ${hand.ante}`:""}`,tcx,tcy+(board.length?try_*.55:0));
    }

    // ── Player positions around oval using POKER positions ──
    // Map position names to angles (0 = right, clockwise)
    // Hero always at bottom (angle = PI/2 = bottom)
    // We place players based on declared positions if available

    const POSITION_ANGLES={
      "BTN": Math.PI*0.5,      // bottom-right
      "SB":  Math.PI*0.65,     // bottom-right-ish
      "BB":  Math.PI*0.82,     // bottom-left-ish
      "UTG": Math.PI*1.15,     // top-left
      "UTG+1": Math.PI*1.3,
      "MP":  Math.PI*1.5,      // top center
      "HJ":  Math.PI*1.65,
      "CO":  Math.PI*1.82,     // top-right
    };

    // Hero: always bottom center
    const heroAngle=Math.PI*0.5; // straight down
    const heroX=tcx+Math.cos(heroAngle)*(trx+100);
    const heroY=tcy+Math.sin(heroAngle)*(try_+100);
    const heroLabel=hand.position?`Moi · ${hand.position}`:"Moi";
    drawPlayerOnTable(ctx,heroX,heroY,[hand.card1,hand.card2],heroLabel,hand.stackAfter,true,W,trx,try_,tcx,tcy,heroAngle);

    // Villains: position based on declared position or spread around top
    if(villains.length===1){
      const v=villains[0];
      const vAngle=v.position&&POSITION_ANGLES[v.position]
        ? POSITION_ANGLES[v.position]-Math.PI // opposite side from default
        : Math.PI*1.5; // top center
      const va=vAngle;
      const vx=tcx+Math.cos(va)*(trx+100);
      const vy=tcy+Math.sin(va)*(try_+100);
      drawPlayerOnTable(ctx,vx,vy,v.cards,v.position?`Villain · ${v.position}`:"Villain",null,false,W,trx,try_,tcx,tcy,va);
    } else if(villains.length>=2){
      // Spread villains evenly in the top arc
      const n=Math.min(villains.length,6);
      villains.slice(0,n).forEach((v,i)=>{
        // Spread from top-left to top-right
        const spread=Math.PI*.7; // arc to use
        const startA=Math.PI*1.5-spread/2;
        const va=startA+(spread/(n-1||1))*i;
        const vx=tcx+Math.cos(va)*(trx+100);
        const vy=tcy+Math.sin(va)*(try_+100);
        const lbl=v.position?`V${i+1} · ${v.position}`:`V${i+1}`;
        drawPlayerOnTable(ctx,vx,vy,v.cards,lbl,null,false,W,trx,try_,tcx,tcy,va);
      });
    }

    // ── Bottom info ──
    const botY=tcy+try_+260;

    // Street + Action tags
    const tags=[[hand.finalStreet,"#7C3AED"],[hand.action,"#0369A1"]].filter(([v])=>v);
    if(tags.length){
      let tx=W/2-(tags.length-1)*120;
      tags.forEach(([label,color])=>{
        const tw=200,th=44;
        ctx.fillStyle=color+"99";rr(ctx,tx-tw/2,botY,tw,th,22);ctx.fill();
        ctx.strokeStyle=color;ctx.lineWidth=2;rr(ctx,tx-tw/2,botY,tw,th,22);ctx.stroke();
        ctx.fillStyle="#fff";ctx.font=`bold 20px system-ui`;
        ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(label,tx,botY+th/2);
        tx+=240;
      });
    }

    // Note
    if(hand.note){
      const ny=botY+(tags.length?60:0);
      ctx.fillStyle="rgba(255,255,255,0.35)";ctx.font=`italic 24px serif`;
      ctx.textAlign="center";ctx.textBaseline="middle";
      const n=hand.note.length>65?hand.note.slice(0,62)+"…":hand.note;
      ctx.fillText(`"${n}"`,W/2,ny+20);
    }

    // Footer
    ctx.fillStyle="rgba(255,255,255,0.15)";ctx.font=`18px system-ui`;
    ctx.textAlign="center";ctx.textBaseline="bottom";ctx.fillText("🃏 Poker Log",W/2,H-28);

    const link=document.createElement("a");
    link.download=`poker-hand-${hand.id}.png`;
    link.href=canvas.toDataURL("image/png");
    if(!previewOnly) link.click();
    const preview=previewRef.current;
    if(preview){
      const ctx2=preview.getContext("2d");
      preview.height=Math.round(1920*(preview.width/1080));
      ctx2.drawImage(canvas,0,0,preview.width,preview.height);
    }
  },[hand]);

  // ── Download: TABLE COMPOSITION ─────────────────────────
  const downloadTable=useCallback((previewOnly=false)=>{
    const canvas=canvasRef.current;
    canvas.width=W;canvas.height=H;
    const ctx=canvas.getContext("2d");
    drawBackground(ctx);

    const seats=session?.tableSeats||[];
    const n=Math.max(seats.length,2);

    // Header
    ctx.fillStyle="rgba(255,255,255,0.3)";ctx.font=`bold 28px system-ui`;
    ctx.textAlign="center";ctx.textBaseline="top";ctx.fillText("🃏 Poker Log",W/2,60);
    ctx.fillStyle="#fff";ctx.font=`bold 48px system-ui`;ctx.textBaseline="top";
    ctx.fillText("🪑 Composition de table",W/2,110);
    if(session?.name){
      ctx.fillStyle="rgba(255,255,255,0.4)";ctx.font=`24px system-ui`;
      ctx.fillText(session.name,W/2,172);
    }

    // Table
    const tcx=W/2,tcy=H*.52;
    const trx=W*.4,try2=H*.26;
    drawTable(ctx,tcx,tcy,trx,try2);

    // Seat positions
    const positions=getSeatPositions(n,tcx,tcy,trx+80,try2+90);

    seats.forEach((seat,i)=>{
      const pos=positions[i];
      if(!pos) return;
      const isMe=seat.isMe;
      const isDealer=i===dealerSeat;

      // Seat circle
      const r=isMe?42:36;
      ctx.fillStyle=isMe?"rgba(124,58,237,0.9)":"rgba(0,0,0,0.7)";
      ctx.shadowColor=isMe?"rgba(124,58,237,0.5)":"transparent";ctx.shadowBlur=isMe?20:0;
      ctx.beginPath();ctx.arc(pos.x,pos.y,r,0,Math.PI*2);ctx.fill();
      ctx.shadowBlur=0;
      ctx.strokeStyle=isMe?"#a78bfa":"rgba(255,255,255,0.25)";ctx.lineWidth=isMe?3:1.5;
      ctx.beginPath();ctx.arc(pos.x,pos.y,r,0,Math.PI*2);ctx.stroke();
      // Seat number
      ctx.fillStyle="#fff";ctx.font=`bold ${isMe?22:18}px system-ui`;
      ctx.textAlign="center";ctx.textBaseline="middle";
      ctx.fillText(i+1,pos.x,pos.y);

      // Info card positioned away from center
      const angle=Math.atan2(pos.y-tcy,pos.x-tcx);
      const labelDist=r+16;
      const lx=pos.x+Math.cos(angle)*labelDist;
      const ly=pos.y+Math.sin(angle)*labelDist;

      // Determine card direction (push outward)
      const outX=Math.cos(angle)*160;
      const outY=Math.sin(angle)*80;
      const cardX=pos.x+outX;
      const cardY=pos.y+outY;

      if(isMe){
        // Just show "Moi" label
        ctx.fillStyle="rgba(124,58,237,0.8)";
        const tw=100,th=28;
        rr(ctx,cardX-tw/2,cardY-th/2,tw,th,th/2);ctx.fill();
        ctx.fillStyle="#fff";ctx.font=`bold 16px system-ui`;
        ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText("Moi",cardX,cardY);
      } else if(seat.name){
        // Info pill
        const lines=[];
        const nat=seat.nationality&&seat.nationality!=="—"?seat.nationality.split(" ")[0]:""; // just flag
        const name=`${nat?nat+" ":""}${seat.name}`;
        lines.push(name);
        if(seat.type&&seat.type!=="—") lines.push(seat.type);
        if(seat.notes) lines.push(seat.notes.length>20?seat.notes.slice(0,18)+"…":seat.notes);

        const pillH=lines.length*26+16;const pillW=220;
        ctx.fillStyle="rgba(0,0,0,0.8)";
        rr(ctx,cardX-pillW/2,cardY-pillH/2,pillW,pillH,12);ctx.fill();
        ctx.strokeStyle="rgba(255,255,255,0.15)";ctx.lineWidth=1;
        rr(ctx,cardX-pillW/2,cardY-pillH/2,pillW,pillH,12);ctx.stroke();

        lines.forEach((line,li)=>{
          const isName=li===0;
          ctx.fillStyle=isName?"#fff":li===1?"#a78bfa":"rgba(255,255,255,0.5)";
          ctx.font=`${isName?"bold ":""}${isName?16:13}px system-ui`;
          ctx.textAlign="center";ctx.textBaseline="middle";
          ctx.fillText(line,cardX,cardY-pillH/2+16+li*26);
        });
      }

      // Dealer button
      if(isDealer){
        const dx=pos.x+Math.cos(angle+Math.PI*.25)*50;
        const dy=pos.y+Math.sin(angle+Math.PI*.25)*50;
        drawDealerButton(ctx,dx,dy);
      }
    });

    // Blindes if known
    if(session?.currentSb&&session?.currentBb){
      ctx.fillStyle="rgba(255,255,255,0.15)";ctx.font=`20px system-ui`;
      ctx.textAlign="center";ctx.textBaseline="middle";
      ctx.fillText(`Blindes : ${session.currentSb} / ${session.currentBb}${session.currentAnte?` · Ante ${session.currentAnte}`:""}`,tcx,tcy);
    }

    // Footer
    ctx.fillStyle="rgba(255,255,255,0.15)";ctx.font=`16px system-ui`;
    ctx.textAlign="center";ctx.textBaseline="bottom";ctx.fillText("🃏 Poker Log",W/2,H-30);

    const link=document.createElement("a");
    link.download=`table-${session?.id||"composition"}.png`;
    link.href=canvas.toDataURL("image/png");
    if(!previewOnly) link.click();
    const preview=previewRef.current;
    if(preview){
      const ctx2=preview.getContext("2d");
      preview.height=Math.round(1920*(preview.width/1080));
      ctx2.drawImage(canvas,0,0,preview.width,preview.height);
    }
  },[session,dealerSeat]);

  const won=hand.result>0,lost=hand.result<0;
  const board=hand.board?.filter(Boolean)||[];
  const seats=session?.tableSeats||[];
  const hasTable=seats.some(s=>s.name);
  const previewRef=useRef();
  const [previewing,setPreviewing]=useState(false);

  const renderPreview=useCallback(()=>{
    const fn=mode==="hand"?downloadHand:downloadTable;
    // Render to hidden canvas then copy to preview canvas at scaled size
    const hidden=canvasRef.current;
    if(mode==="hand") downloadHand(true);
    else downloadTable(true);
  },[mode,downloadHand,downloadTable]);

  // Draw to preview canvas on open / mode change
  useEffect(()=>{
    const preview=previewRef.current;
    if(!preview) return;
    const hidden=canvasRef.current;
    // trigger draw
    const fn=mode==="hand"?downloadHand:downloadTable;
    fn(true); // true = preview only, no download
    // After draw, copy hidden (1080x1920) to preview scaled
    requestAnimationFrame(()=>{
      const ctx2=preview.getContext("2d");
      const scale=preview.width/1080;
      preview.height=Math.round(1920*scale);
      ctx2.drawImage(hidden,0,0,preview.width,preview.height);
      setPreviewing(true);
    });
  },[mode,hand,session,dealerSeat]);

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(30,27,75,0.7)",backdropFilter:"blur(8px)",zIndex:1000,display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"16px",overflowY:"auto"}}>
      <canvas ref={canvasRef} style={{display:"none"}}/>
      <div style={{background:C.bgCard,borderRadius:20,padding:20,width:"100%",maxWidth:440,fontFamily:FF,boxShadow:"0 24px 80px rgba(124,58,237,0.25)"}}>

        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <h3 style={{margin:0,color:C.text,fontSize:18,fontWeight:800}}>📸 Share Studio</h3>
          <button onClick={onClose} style={{background:"#1A1A1A",border:"none",borderRadius:8,width:32,height:32,cursor:"pointer",color:C.primary,fontSize:16}}>×</button>
        </div>

        {/* Mode toggle */}
        <div style={{display:"flex",background:"#1A1A1A",borderRadius:10,padding:4,marginBottom:14,gap:0}}>
          <button onClick={()=>setMode("hand")} style={{flex:1,padding:"8px 0",borderRadius:8,border:"none",background:mode==="hand"?"linear-gradient(135deg,#7C3AED,#06B6D4)":"transparent",color:mode==="hand"?"#fff":C.muted,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:FF}}>🃏 Main</button>
          <button onClick={()=>setMode("table")} disabled={!hasTable} style={{flex:1,padding:"8px 0",borderRadius:8,border:"none",background:mode==="table"?"linear-gradient(135deg,#7C3AED,#06B6D4)":"transparent",color:mode==="table"?"#fff":!hasTable?"#D1D5DB":C.muted,fontWeight:700,fontSize:13,cursor:hasTable?"pointer":"not-allowed",fontFamily:FF}}>🪑 Ma Table{!hasTable?" (vide)":""}</button>
        </div>

        {/* Dealer selector for table mode */}
        {mode==="table"&&hasTable&&(
          <div style={{marginBottom:12}}>
            <div style={{fontSize:10,color:C.textMid,fontWeight:600,textTransform:"uppercase",letterSpacing:.8,marginBottom:6}}>Position du Dealer</div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
              {seats.map((s,i)=>(
                <button key={i} onClick={()=>setDealerSeat(i)} style={{
                  padding:"4px 10px",borderRadius:16,border:`1.5px solid ${dealerSeat===i?C.gold:C.border}`,
                  background:dealerSeat===i?"#FEF3C7":"#FAFAFA",
                  color:dealerSeat===i?"#92400E":C.muted,
                  fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:FF
                }}>D{i+1} {s.isMe?"— Moi":s.name?`— ${s.name}`:""}</button>
              ))}
            </div>
          </div>
        )}

        {/* Canvas preview — scaled 1080x1920 → fits modal */}
        <div style={{borderRadius:12,overflow:"hidden",marginBottom:14,border:"1px solid rgba(255,255,255,0.08)",background:"#0a0612"}}>
          <canvas ref={previewRef} width={400} style={{width:"100%",display:"block"}}/>
        </div>

        <button
          onClick={()=>{ mode==="hand"?downloadHand(false):downloadTable(false); }}
          style={{width:"100%",padding:"13px 0",background:C.grad,border:"none",borderRadius:10,color:"#0A0A0A",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:FF,boxShadow:"0 4px 18px rgba(124,58,237,0.35)"}}>
          ⬇ Télécharger Story 1080×1920
        </button>
      </div>
    </div>
  );
}


// ── TableModal ────────────────────────────────────────────────
const PLAYER_TYPES=["—","TAG","LAG","Nit","Fish","Maniac","Calling Station","Régulier","Pro","Inconnu"];

const NATIONALITIES=["—","🇫🇷 France","🇩🇿 Algérie","🇩🇪 Allemagne","🇦🇴 Angola","🇸🇦 Arabie Saoudite","🇦🇷 Argentine","🇦🇺 Australie","🇦🇹 Autriche","🇦🇿 Azerbaïdjan","🇧🇪 Belgique","🇧🇷 Brésil","🇧🇬 Bulgarie","🇨🇦 Canada","🇨🇳 Chine","🇭🇷 Croatie","🇩🇰 Danemark","🇪🇸 Espagne","🇺🇸 États-Unis","🇫🇮 Finlande","🇬🇷 Grèce","🇭🇺 Hongrie","🇮🇳 Inde","🇮🇱 Israël","🇮🇹 Italie","🇯🇵 Japon","🇰🇿 Kazakhstan","🇰🇷 Corée du Sud","🇱🇻 Lettonie","🇱🇹 Lituanie","🇱🇺 Luxembourg","🇲🇦 Maroc","🇲🇽 Mexique","🇳🇴 Norvège","🇳🇱 Pays-Bas","🇵🇱 Pologne","🇵🇹 Portugal","🇨🇿 Rép. Tchèque","🇷🇴 Roumanie","🇷🇺 Russie","🇷🇸 Serbie","🇸🇰 Slovaquie","🇸🇪 Suède","🇨🇭 Suisse","🇹🇳 Tunisie","🇹🇷 Turquie","🇺🇦 Ukraine","🇬🇧 Royaume-Uni","Autre"];

function TableModal({session,onUpdate,onClose}){
  const [ppt,setPpt]=useState(parseInt(session.playersPerTable)||9);
  const nbSeats=ppt;
  const saved=session.tableSeats||[];
  const savedMySeat=saved.findIndex(s=>s.isMe);
  const [mySeat,setMySeat]=useState(savedMySeat>=0?savedMySeat:0);
  const initSeats=(n)=>Array.from({length:n},(_,i)=>saved[i]||{name:"",type:"—",nationality:"—",notes:""});
  const [seats,setSeats]=useState(()=>initSeats(ppt));
  const lbl={...labelStyle,fontSize:10};
  const inp={...inputStyle,padding:"7px 10px",fontSize:12};

  // Resize seats when ppt changes
  const handlePpt=(n)=>{
    setPpt(n);
    setSeats(prev=>{
      if(prev.length===n) return prev;
      if(prev.length<n) return [...prev,...Array(n-prev.length).fill(null).map(()=>({name:"",type:"—",nationality:"—",notes:""}))];
      return prev.slice(0,n);
    });
    if(mySeat>=n) setMySeat(0);
  };

  const updateSeat=(i,field,val)=>setSeats(prev=>prev.map((s,idx)=>idx===i?{...s,[field]:val}:s));

  const save=()=>{
    const withMe=seats.map((s,i)=>({...s,isMe:i===mySeat}));
    // Also update playersPerTable in session so InfoPanel stays in sync
    onUpdate({tableSeats:withMe,playersPerTable:String(ppt)});
    onClose();
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(30,27,75,0.65)",backdropFilter:"blur(8px)",zIndex:600,display:"flex",alignItems:"center",justifyContent:"center",padding:"16px",overflowY:"auto"}}>
      <div style={{background:C.bgCard,borderRadius:20,padding:22,width:"100%",maxWidth:500,fontFamily:FF,boxShadow:"0 24px 60px rgba(0,0,0,0.3)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontWeight:900,fontSize:16,color:C.text}}>🪑 Ma Table</div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:2}}>
              <span style={{fontSize:9,color:C.textMid,fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>Joueurs / table</span>
              <div style={{display:"flex",gap:4}}>
                {[2,6,7,8,9,10].map(n=>(
                  <button key={n} onClick={()=>handlePpt(n)} style={{
                    width:28,height:28,borderRadius:6,border:"none",cursor:"pointer",
                    background:ppt===n?"linear-gradient(135deg,#7C3AED,#06B6D4)":"#F5F3FF",
                    color:ppt===n?"#fff":C.muted,fontWeight:700,fontSize:11,
                    fontFamily:FF
                  }}>{n}</button>
                ))}
              </div>
            </div>
            <button onClick={onClose} style={{background:"#1A1A1A",border:"none",borderRadius:8,width:30,height:30,cursor:"pointer",color:C.primary,fontSize:15}}>×</button>
          </div>
        </div>

        {/* My seat selector */}
        <div style={{background:"#1A1A1A",borderRadius:12,padding:"10px 14px",marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:16}}>🙋</span>
          <div style={{flex:1}}>
            <div style={{fontSize:10,color:C.primary,fontWeight:700,textTransform:"uppercase",letterSpacing:.8,marginBottom:4}}>Mon siège</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {Array.from({length:nbSeats},(_,i)=>(
                <button key={i} onClick={()=>setMySeat(i)} style={{
                  width:32,height:32,borderRadius:"50%",border:"none",cursor:"pointer",
                  background:mySeat===i?"linear-gradient(135deg,#7C3AED,#06B6D4)":"rgba(255,255,255,0.7)",
                  color:mySeat===i?"#fff":C.muted,fontWeight:800,fontSize:12,
                  fontFamily:FF,
                  boxShadow:mySeat===i?"0 2px 8px rgba(124,58,237,0.4)":"none"
                }}>{i+1}</button>
              ))}
            </div>
          </div>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16,maxHeight:"55vh",overflowY:"auto"}}>
          {seats.map((seat,i)=>{
            const isMe=i===mySeat;
            return (
              <div key={i} style={{
                background:isMe?C.lavender:"#FAFAFA",
                border:`1.5px solid ${isMe?C.primary:C.border}`,
                borderRadius:12,padding:"10px 12px"
              }}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:isMe?0:6}}>
                  <div style={{
                    width:26,height:26,borderRadius:"50%",flexShrink:0,
                    background:isMe?"linear-gradient(135deg,#7C3AED,#06B6D4)":"#E5E7EB",
                    display:"flex",alignItems:"center",justifyContent:"center",
                    color:isMe?"#fff":C.muted,fontSize:11,fontWeight:800
                  }}>{i+1}</div>
                  {isMe
                    ? <span style={{fontWeight:800,color:C.primary,fontSize:13}}>Moi 🙋</span>
                    : <>
                      <input value={seat.name} onChange={e=>updateSeat(i,"name",e.target.value)}
                        placeholder={`Siège ${i+1} — Pseudo`}
                        style={{...inp,flex:1,margin:0,alignSelf:"flex-end"}}/>
                      <div style={{display:"flex",flexDirection:"column",gap:2}}>
                        <span style={{fontSize:9,color:C.textMid,fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>Pays</span>
                        <select value={seat.nationality||"—"} onChange={e=>updateSeat(i,"nationality",e.target.value)}
                          style={{...inp,width:130,margin:0,fontSize:11}}>
                          {NATIONALITIES.map(n=><option key={n}>{n}</option>)}
                        </select>
                      </div>
                      <div style={{display:"flex",flexDirection:"column",gap:2}}>
                        <span style={{fontSize:9,color:C.textMid,fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>Style</span>
                        <select value={seat.type} onChange={e=>updateSeat(i,"type",e.target.value)}
                          style={{...inp,width:110,margin:0,color:seat.type==="—"?C.muted:C.navy}}>
                          {PLAYER_TYPES.map(t=><option key={t}>{t}</option>)}
                        </select>
                      </div>
                    </>
                  }
                </div>
                {!isMe&&(
                  <input value={seat.notes} onChange={e=>updateSeat(i,"notes",e.target.value)}
                    placeholder="Notes (ex: 3-bet light, call trop large…)"
                    style={{...inp,width:"100%",boxSizing:"border-box",marginTop:4,fontSize:11,color:C.textMid}}/>
                )}
              </div>
            );
          })}
        </div>

        <button onClick={save} style={{width:"100%",padding:"12px 0",background:C.grad,border:"none",borderRadius:10,color:"#0A0A0A",fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:FF,boxShadow:"0 4px 16px rgba(124,58,237,0.35)"}}>
          Sauvegarder la table
        </button>
      </div>
    </div>
  );
}

// ── SessionInfoPanel ──────────────────────────────────────────
function SessionInfoPanel({session,onUpdate}){
  const [open,setOpen]=useState(false);
  const [sb,setSb]=useState(session.currentSb||"");
  const [bb,setBb]=useState(session.currentBb||"");
  const [ante,setAnte]=useState(session.currentAnte||session.currentBb||"");
  const [ppt,setPpt]=useState(session.playersPerTable||"");
  const [stack,setStack]=useState(session.currentStack||session.startingStack||"");
  const [registered,setRegistered]=useState(session.registered||session.nbPlayers||"");
  const [remaining,setRemaining]=useState(session.remaining||"");
  const [paidPlaces,setPaidPlaces]=useState(session.paidPlaces||"");

  // Sync stack whenever currentStack changes (e.g. after a hand is saved)
  useEffect(()=>{
    if(!open && session.currentStack) setStack(String(session.currentStack));
  },[session.currentStack,open]);

  // Sync ppt when changed from TableModal
  useEffect(()=>{
    if(!open) setPpt(session.playersPerTable||"");
  },[session.playersPerTable,open]);
  const inp={...inputStyle,padding:"9px 12px",fontSize:13};
  const lbl={...labelStyle,fontSize:10};

  const save=()=>{
    onUpdate({currentSb:sb,currentBb:bb,currentAnte:ante,playersPerTable:ppt,startingStack:stack,currentStack:stack,registered,remaining,paidPlaces});
    setOpen(false);
  };

  const remainingN=parseInt(remaining)||0;
  const paidN=parseInt(paidPlaces)||0;
  const threshold=paidN?Math.max(1,Math.round(paidN*0.1)):0;
  const onBubble = remainingN>0&&paidN>0 && remainingN===paidN+1;
  const nearBubble = remainingN>0&&paidN>0 && remainingN>paidN+1 && remainingN<=paidN+threshold;
  const inItm = remainingN>0&&paidN>0 && remainingN<=paidN;

  return !open ? (
    <button onClick={()=>setOpen(true)} style={{display:"flex",alignItems:"center",gap:6,background:onBubble?"rgba(239,68,68,0.2)":nearBubble?"rgba(245,158,11,0.2)":inItm?"rgba(16,185,129,0.2)":"rgba(255,255,255,0.12)",border:`1px solid ${onBubble?"rgba(239,68,68,0.5)":nearBubble?"rgba(245,158,11,0.5)":inItm?"rgba(16,185,129,0.5)":"rgba(255,255,255,0.25)"}`,borderRadius:8,color:"#0A0A0A",padding:"5px 10px",cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:FF}}>
      ⚙️ Infos tournoi
      {onBubble&&<span style={{background:"rgba(239,68,68,0.35)",color:"#fca5a5",borderRadius:6,padding:"1px 7px",fontSize:11,fontWeight:900,letterSpacing:.3}}>🫧 BULLE</span>}
      {nearBubble&&!onBubble&&<span style={{background:"rgba(245,158,11,0.3)",color:"#fde68a",borderRadius:6,padding:"1px 7px",fontSize:11,fontWeight:800}}>🫧 Proche bulle</span>}
      {inItm&&<span style={{background:"rgba(16,185,129,0.3)",color:"#6ee7b7",borderRadius:6,padding:"1px 7px",fontSize:11,fontWeight:800}}>💰 ITM</span>}
      {sb&&bb&&<span style={{background:"rgba(255,255,255,0.2)",borderRadius:4,padding:"1px 6px",fontSize:10}}>{sb}/{bb}</span>}
      {remaining&&<span style={{background:"rgba(255,255,255,0.15)",borderRadius:4,padding:"1px 6px",fontSize:10}}>{remaining}↓</span>}
    </button>
  ) : (
    <div style={{position:"fixed",inset:0,background:"rgba(30,27,75,0.55)",backdropFilter:"blur(6px)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 16px"}}>
      <div style={{background:C.bgCard,borderRadius:20,padding:24,width:"100%",maxWidth:380,boxShadow:"0 24px 60px rgba(0,0,0,0.3)",fontFamily:FF}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <div style={{fontWeight:900,fontSize:16,color:C.text}}>⚙️ Infos tournoi</div>
          <button onClick={()=>setOpen(false)} style={{background:"#1A1A1A",border:"none",borderRadius:8,width:30,height:30,cursor:"pointer",color:C.primary,fontSize:15}}>×</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:10}}>
          <div><label style={lbl}>Petite blinde</label><input style={inp} type="number" value={sb} onChange={e=>{const v=e.target.value;setSb(v);const n=parseFloat(v);if(!isNaN(n)&&n>0){const bv=n*2;setBb(String(bv));setAnte(String(bv));}}}/></div>
          <div><label style={lbl}>Grosse blinde</label><input style={inp} type="number" value={bb} onChange={e=>{setBb(e.target.value);setAnte(e.target.value);}}/></div>
          <div><label style={lbl}>Ante</label><input style={inp} type="number" value={ante} onChange={e=>setAnte(e.target.value)} placeholder="= BB"/></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
          <div><label style={lbl}>Joueurs / table</label><input style={inp} type="number" value={ppt} onChange={e=>setPpt(e.target.value)} placeholder="Ex: 9"/></div>
          <div><label style={lbl}>Stack actuel</label><input style={inp} type="number" value={stack} onChange={e=>setStack(e.target.value)} placeholder="Ex: 45000"/></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:18}}>
          <div>
            <label style={lbl}>Inscrits</label>
            <input style={inp} type="number" value={registered} onChange={e=>setRegistered(e.target.value)} placeholder="Ex: 312"/>
          </div>
          <div>
            <label style={lbl}>Restants</label>
            <input style={inp} type="number" value={remaining} onChange={e=>setRemaining(e.target.value)} placeholder="Ex: 48"/>
          </div>
          <div>
            <label style={lbl}>Places payées</label>
            <input style={inp} type="number" value={paidPlaces} onChange={e=>setPaidPlaces(e.target.value)} placeholder="Ex: 27"/>
          </div>
        </div>
        <button onClick={save} style={{width:"100%",padding:"12px 0",background:C.grad,border:"none",borderRadius:10,color:"#0A0A0A",fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:FF,boxShadow:"0 4px 16px rgba(124,58,237,0.35)"}}>
          Mettre à jour
        </button>
      </div>
    </div>
  );
}

// ── Stats Screen ──────────────────────────────────────────────
function StatsScreen({sessions,sessionBankroll,onBack}){
  const F="'Nunito',system-ui,sans-serif";

  // Closed sessions only for bankroll
  const closed=sessions.filter(s=>s.closed);
  const allHands=sessions.flatMap(s=>s.hands).sort((a,b)=>a.ts-b.ts);

  // Bankroll curve (cumulative over closed sessions)
  const bankrollCurve=closed.reduce((acc,s,i)=>{
    const br=sessionBankroll(s)||0;
    const prev=acc[i-1]?.cumul||0;
    acc.push({name:s.name.slice(0,12),cumul:prev+br,gain:br,itm:s.itm});
    return acc;
  },[]);

  // Per-session bar chart
  const sessionBars=closed.map(s=>({
    name:s.name.slice(0,10),
    gain:sessionBankroll(s)||0,
    type:s.type
  }));

  // Global stats
  const totalSessions=closed.length;
  const itmSessions=closed.filter(s=>s.itm).length;
  const totalHands=allHands.length;
  const winHands=allHands.filter(h=>h.result>0).length;
  const grandBankroll=bankrollCurve[bankrollCurve.length-1]?.cumul||0;
  const bestSession=closed.length?Math.max(...closed.map(s=>sessionBankroll(s)||0)):0;
  const worstSession=closed.length?Math.min(...closed.map(s=>sessionBankroll(s)||0)):0;

  const Card=({label,value,color,sub})=>(
    <div style={{background:C.bgCard,borderRadius:14,padding:"14px 16px",border:"1px solid rgba(255,255,255,0.08)",flex:1,minWidth:0}}>
      <div style={{fontSize:10,color:C.textMid,fontWeight:700,textTransform:"uppercase",letterSpacing:.8,marginBottom:4}}>{label}</div>
      <div style={{fontSize:22,fontWeight:900,color:color||C.navy,fontVariantNumeric:"tabular-nums"}}>{value}</div>
      {sub&&<div style={{fontSize:10,color:C.textMid,marginTop:2}}>{sub}</div>}
    </div>
  );

  const CustomTooltip=({active,payload,label})=>{
    if(!active||!payload?.length) return null;
    const d=payload[0];
    return (
      <div style={{background:C.bgCard,border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,padding:"8px 12px",boxShadow:"0 4px 20px rgba(0,0,0,0.12)",fontFamily:F}}>
        <div style={{fontWeight:800,color:C.text,fontSize:12,marginBottom:4}}>{label}</div>
        {payload.map((p,i)=>(
          <div key={i} style={{fontSize:12,color:p.color,fontWeight:700}}>{p.name} : {p.value>0?"+":""}{p.value?.toLocaleString("fr-FR")} €</div>
        ))}
      </div>
    );
  };

  return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:F}}>
      {/* Header */}
      <div style={{background:"#0E0E0E",padding:"14px 20px",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
        <div style={{maxWidth:700,margin:"0 auto"}}>
          <button onClick={onBack} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:8,color:"#0A0A0A",padding:"4px 10px",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:F,marginBottom:6}}>← Accueil</button>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
            <div>
              <div style={{fontWeight:900,fontSize:18,color:"#0A0A0A"}}>📊 Mes Statistiques</div>
              <div style={{color:"rgba(255,255,255,0.65)",fontSize:12,marginTop:2}}>{totalSessions} sessions · {totalHands} mains</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.5)",fontWeight:700,textTransform:"uppercase",letterSpacing:.8}}>Bankroll</div>
              <div style={{fontWeight:900,fontSize:26,color:grandBankroll>0?"#4ade80":grandBankroll<0?"#f87171":"#fff",lineHeight:1.1}}>
                {grandBankroll>0?"+":""}{grandBankroll.toLocaleString("fr-FR")} €
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{maxWidth:700,margin:"0 auto",padding:"16px 14px 40px",display:"flex",flexDirection:"column",gap:16}}>

        {sessions.length===0?(
          <div style={{background:C.bgCard,border:`2px dashed ${C.border}`,borderRadius:16,padding:48,textAlign:"center"}}>
            <div style={{fontSize:48,marginBottom:12}}>📊</div>
            <div style={{color:C.textMid,fontSize:15}}>Joue ta première session pour voir tes stats !</div>
          </div>
        ):<>

        {/* KPIs */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <Card label="Bankroll" value={`${grandBankroll>0?"+":""}${grandBankroll.toLocaleString("fr-FR")} €`} color={grandBankroll>0?C.win:grandBankroll<0?C.loss:C.muted}/>
          <Card label="ITM Rate" value={totalSessions?`${Math.round(itmSessions/totalSessions*100)}%`:"—"} color={C.primary} sub={`${itmSessions}/${totalSessions} tournois`}/>
          <Card label="Winrate mains" value={totalHands?`${Math.round(winHands/totalHands*100)}%`:"—"} color={winHands/totalHands>=0.5?C.win:C.loss} sub={`${winHands}/${totalHands} mains`}/>
          <Card label="Meilleure session" value={`${bestSession>0?"+":""}${bestSession.toLocaleString("fr-FR")} €`} color={C.win}/>
        </div>

        {/* Courbe bankroll cumulative */}
        {bankrollCurve.length>=2&&(
          <div style={{background:C.bgCard,border:"1px solid rgba(255,255,255,0.08)",borderRadius:16,padding:20}}>
            <div style={{fontWeight:800,color:C.text,fontSize:14,marginBottom:16}}>📈 Courbe Bankroll</div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={bankrollCurve} margin={{top:5,right:10,left:0,bottom:5}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0D9FF" vertical={false}/>
                <XAxis dataKey="name" tick={{fontSize:10,fill:C.muted,fontFamily:F}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:C.muted,fontFamily:F}} axisLine={false} tickLine={false} tickFormatter={v=>`${v>0?"+":""}${v}€`} width={48}/>
                <ReferenceLine y={0} stroke="#E0D9FF" strokeDasharray="4 4"/>
                <Tooltip content={<CustomTooltip/>}/>
                <Line type="monotone" dataKey="cumul" name="Bankroll" stroke={C.primary} strokeWidth={2.5} dot={{fill:C.primary,r:4}} activeDot={{r:6}}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Bar chart par session */}
        {sessionBars.length>=1&&(
          <div style={{background:C.bgCard,border:"1px solid rgba(255,255,255,0.08)",borderRadius:16,padding:20}}>
            <div style={{fontWeight:800,color:C.text,fontSize:14,marginBottom:16}}>🎯 Gain / Perte par Session</div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={sessionBars} margin={{top:5,right:10,left:0,bottom:5}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0D9FF" vertical={false}/>
                <XAxis dataKey="name" tick={{fontSize:10,fill:C.muted,fontFamily:F}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:C.muted,fontFamily:F}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}€`} width={42}/>
                <ReferenceLine y={0} stroke="#9CA3AF"/>
                <Tooltip content={<CustomTooltip/>}/>
                <Bar dataKey="gain" name="Gain" radius={[6,6,0,0]}>
                  {sessionBars.map((s,i)=><Cell key={i} fill={s.gain>=0?C.win:C.loss}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Stats position */}
        {(()=>{
          const posByPos={};
          allHands.forEach(h=>{
            if(!h.position) return;
            if(!posByPos[h.position]) posByPos[h.position]={pos:h.position,hands:0,wins:0,total:0};
            posByPos[h.position].hands++;
            if(h.result>0) posByPos[h.position].wins++;
            posByPos[h.position].total+=h.result;
          });
          const posData=Object.values(posByPos).sort((a,b)=>b.hands-a.hands);
          if(posData.length<2) return null;
          return (
            <div style={{background:C.bgCard,border:"1px solid rgba(255,255,255,0.08)",borderRadius:16,padding:20}}>
              <div style={{fontWeight:800,color:C.text,fontSize:14,marginBottom:14}}>🎴 Stats par Position</div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {posData.map(p=>{
                  const wr=Math.round(p.wins/p.hands*100);
                  return (
                    <div key={p.pos} style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:44,fontWeight:800,fontSize:12,color:C.primary}}>{p.pos}</div>
                      <div style={{flex:1,background:"#1A1A1A",borderRadius:6,height:8,overflow:"hidden"}}>
                        <div style={{width:`${wr}%`,height:"100%",background:`linear-gradient(90deg,${C.primary},${C.cyan})`,borderRadius:6,transition:"width .5s"}}/>
                      </div>
                      <div style={{width:36,fontSize:11,fontWeight:700,color:wr>=50?C.win:C.loss,textAlign:"right"}}>{wr}%</div>
                      <div style={{width:50,fontSize:11,color:C.textMid,textAlign:"right"}}>{p.hands}m</div>
                      <div style={{width:60,fontSize:11,fontWeight:700,color:p.total>0?C.win:C.loss,textAlign:"right"}}>{fmtChips(p.total)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        </>}
      </div>
    </div>
  );
}

// ── Session Options Modal ─────────────────────────────────────
function SessionOptionsModal({session,onRename,onDelete,onClose}){
  const [name,setName]=useState(session.name);
  const [confirmDelete,setConfirmDelete]=useState(false);
  const inp={...inputStyle,fontSize:15,fontWeight:700};
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(30,27,75,0.65)",backdropFilter:"blur(8px)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:"16px"}}>
      <div style={{background:C.bgCard,borderRadius:20,padding:24,width:"100%",maxWidth:380,fontFamily:FF,boxShadow:"0 24px 60px rgba(0,0,0,0.3)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div style={{fontWeight:900,fontSize:16,color:C.text}}>⚙️ Options de session</div>
          <button onClick={onClose} style={{background:"#1A1A1A",border:"none",borderRadius:8,width:30,height:30,cursor:"pointer",color:C.primary,fontSize:15}}>×</button>
        </div>

        {/* Rename */}
        <div style={{marginBottom:20}}>
          <label style={{...labelStyle,fontSize:11}}>Nom de la session</label>
          <div style={{display:"flex",gap:8}}>
            <input value={name} onChange={e=>setName(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&name.trim()&&(onRename(name.trim()),onClose())}
              style={{...inp,flex:1}}/>
            <button onClick={()=>{if(name.trim()){onRename(name.trim());onClose();}}} style={{
              background:C.grad,border:"none",
              borderRadius:10,color:"#0A0A0A",padding:"0 16px",cursor:"pointer",
              fontWeight:700,fontSize:13,fontFamily:FF,
              whiteSpace:"nowrap"
            }}>Renommer</button>
          </div>
        </div>

        {/* Divider */}
        <div style={{height:1,background:C.border,marginBottom:16}}/>

        {/* Delete */}
        {!confirmDelete?(
          <button onClick={()=>setConfirmDelete(true)} style={{
            width:"100%",padding:"11px 0",background:"rgba(255,61,61,0.1)",
            border:`1.5px solid #FECACA`,borderRadius:10,
            color:C.loss,fontSize:14,fontWeight:700,cursor:"pointer",
            fontFamily:FF,
            display:"flex",alignItems:"center",justifyContent:"center",gap:8
          }}>🗑 Supprimer cette session</button>
        ):(
          <div style={{background:"rgba(255,61,61,0.1)",borderRadius:12,padding:14,textAlign:"center"}}>
            <div style={{color:C.loss,fontWeight:700,fontSize:14,marginBottom:12}}>
              Supprimer "{session.name}" et ses {session.hands.length} mains ?
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setConfirmDelete(false)} style={{flex:1,padding:"10px 0",background:"#1A1A1A",border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,color:C.textMid,cursor:"pointer",fontWeight:700,fontFamily:FF}}>Annuler</button>
              <button onClick={()=>{onDelete();onClose();}} style={{flex:1,padding:"10px 0",background:C.loss,border:"none",borderRadius:8,color:"#0A0A0A",cursor:"pointer",fontWeight:800,fontFamily:FF}}>Confirmer</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── End Session Modal ─────────────────────────────────────────
function EndSessionModal({session,hands,onConfirm,onCancel}){
  const total=hands.reduce((a,h)=>a+h.result,0);
  const won=total>0,lost=total<0;
  const wins=hands.filter(h=>h.result>0).length;
  const duration=session.startTs?Math.round((Date.now()-session.startTs)/60000):null;
  const lastStack=hands[0]?.stackAfter||null;
  const [note,setNote]=useState("");
  const [placement,setPlacement]=useState("");
  const [itm,setItm]=useState(false);
  const [itmGain,setItmGain]=useState("");

  const fmt=m=>{
    if(!m) return "—";
    const h=Math.floor(m/60),mn=m%60;
    return h>0?`${h}h${mn>0?` ${mn}min`:""}`:`${mn} min`;
  };

  const isTournoi=session.type==="tournoi";
  const lbl={...labelStyle,fontSize:11};
  const inp={...inputStyle,fontSize:13};

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(30,27,75,0.65)",backdropFilter:"blur(8px)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:"16px",overflowY:"auto"}}>
      <div style={{background:C.bgCard,borderRadius:24,padding:28,width:"100%",maxWidth:400,fontFamily:FF,boxShadow:"0 32px 80px rgba(0,0,0,0.3)"}}>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:48,marginBottom:8}}>{itm?"🏆":won?"😊":lost?"😔":"🤝"}</div>
          <div style={{fontWeight:900,fontSize:22,color:C.text}}>Fin de session</div>
          <div style={{color:C.textMid,fontSize:13,marginTop:4}}>{session.name}</div>
        </div>

        {/* Résumé stats */}
        <div style={{background:"#1A1A1A",borderRadius:16,padding:16,marginBottom:16}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {[
              ["Mains jouées",hands.length,C.navy],
              ["Winrate",hands.length?Math.round(wins/hands.length*100)+"%":"—",wins/hands.length>=0.5?C.win:C.loss],
              ["Durée",fmt(duration),C.navy],
              ...(lastStack?[["Stack final",lastStack.toLocaleString(),C.primary]]:[]),
            ].map(([l,v,color],i)=>(
              <div key={i} style={{background:C.bgCard,borderRadius:10,padding:"10px 12px"}}>
                <div style={{fontSize:10,color:C.textMid,fontWeight:700,textTransform:"uppercase",letterSpacing:.7}}>{l}</div>
                <div style={{fontWeight:800,fontSize:17,color,marginTop:3}}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tournoi — placement + ITM */}
        {isTournoi&&(
          <div style={{marginBottom:16,display:"flex",flexDirection:"column",gap:12}}>

            {/* Placement */}
            <div>
              <label style={lbl}>Ma place finale</label>
              <input value={placement} onChange={e=>setPlacement(e.target.value)}
                placeholder="ex: 12" type="number" style={inp}/>
            </div>

            {/* ITM toggle */}
            <button onClick={()=>{setItm(v=>!v); if(itm) setItmGain("");}} style={{
              display:"flex",alignItems:"center",gap:12,
              background:itm?"#F0FDF4":"#FAFAFA",
              border:`2px solid ${itm?C.win:C.border}`,
              borderRadius:12,padding:"12px 16px",cursor:"pointer",
              textAlign:"left",fontFamily:FF,
              transition:"all .15s"
            }}>
              <div style={{
                width:24,height:24,borderRadius:6,flexShrink:0,
                background:itm?C.win:C.border,
                display:"flex",alignItems:"center",justifyContent:"center",
                transition:"all .15s"
              }}>
                {itm&&<span style={{color:"#0A0A0A",fontSize:14,fontWeight:900}}>✓</span>}
              </div>
              <div>
                <div style={{fontWeight:800,fontSize:14,color:itm?C.win:C.navy}}>Dans les places payées (ITM)</div>
                <div style={{fontSize:11,color:C.textMid,marginTop:2}}>In The Money — tu as été payé !</div>
              </div>
            </button>

            {/* Gain ITM */}
            {itm&&(
              <div style={{animation:"fadeIn .2s ease"}}>
                <label style={lbl}>Gain net remporté ({session.currency||"€"}) <span style={{color:C.loss}}>*</span></label>
                <input value={itmGain} onChange={e=>setItmGain(e.target.value)}
                  placeholder={`ex: 450`} type="number"
                  style={{...inp,fontSize:22,fontWeight:800,textAlign:"center",
                    borderColor:itmGain?C.win:C.border,
                    background:itmGain?"#F0FDF4":"#FAFAFA",
                    color:itmGain?C.win:C.muted}}/>
                {itmGain&&session.buyin&&(
                  <div style={{textAlign:"center",marginTop:6,fontSize:12,color:C.win,fontWeight:700}}>
                    ROI : +{Math.round((parseFloat(itmGain)/parseFloat(session.buyin)-1)*100)}%
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Note de session */}
        <div style={{marginBottom:16}}>
          <label style={lbl}>Note de session (optionnel)</label>
          <textarea value={note} onChange={e=>setNote(e.target.value)}
            placeholder="Ton ressenti, tes leçons du jour…"
            rows={2} style={{...inp,resize:"vertical"}}/>
        </div>

        <div style={{display:"flex",gap:10}}>
          <button onClick={onCancel} style={{flex:1,padding:"12px 0",background:"#1A1A1A",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,color:C.textMid,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:FF}}>
            Continuer
          </button>
          <button onClick={()=>onConfirm({
            endTime:new Date().toLocaleString("fr-FR",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}),
            endTs:Date.now(),sessionNote:note,finalStack:lastStack,closed:true,
            placement:placement||null,
            itm,
            itmGain:itm&&itmGain?parseFloat(itmGain):null,
          })} style={{flex:1,padding:"12px 0",background:C.grad,border:"none",borderRadius:10,color:"#0A0A0A",fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:FF,boxShadow:"0 4px 16px rgba(124,58,237,0.35)"}}>
            Terminer ✓
          </button>
        </div>
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

// ── Edit Hand Modal ───────────────────────────────────────────
function EditHandModal({hand,onSave,onDelete,onClose}){
  const [gain,setGain]=useState(String(hand.result||""));
  const [stackAfter,setStackAfter]=useState(String(hand.stackAfter||""));
  const [note,setNote]=useState(hand.note||"");
  const [finalStreet,setFinalStreet]=useState(hand.finalStreet||"");
  const [action,setAction]=useState(hand.action||"");
  const [confirmDelete,setConfirmDelete]=useState(false);
  const inp={...inputStyle,fontSize:14};
  const lbl=labelStyle;

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(30,27,75,0.65)",backdropFilter:"blur(8px)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 16px"}}>
      <div style={{background:C.bgCard,borderRadius:20,padding:24,width:"100%",maxWidth:400,fontFamily:FF,boxShadow:"0 24px 60px rgba(0,0,0,0.3)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <div style={{fontWeight:900,fontSize:16,color:C.text}}>✏️ Modifier la main</div>
          <button onClick={onClose} style={{background:"#1A1A1A",border:"none",borderRadius:8,width:30,height:30,cursor:"pointer",color:C.primary,fontSize:15}}>×</button>
        </div>

        {/* Cards preview */}
        <div style={{display:"flex",gap:6,marginBottom:16,alignItems:"center"}}>
          <MiniCard card={hand.card1}/><MiniCard card={hand.card2}/>
          {hand.board?.some(Boolean)&&<>
            <span style={{color:C.textMid,fontSize:12}}>|</span>
            {hand.board.filter(Boolean).map((c,i)=><MiniCard key={i} card={c} size="sm"/>)}
          </>}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
          <div>
            <label style={lbl}>Gain / Perte</label>
            <input type="number" value={gain} onChange={e=>setGain(e.target.value)}
              style={{...inp,fontWeight:800,textAlign:"center",
                borderColor:gain===""?C.border:parseFloat(gain)>0?C.win:parseFloat(gain)<0?C.loss:C.muted,
                color:parseFloat(gain)>0?C.win:parseFloat(gain)<0?C.loss:C.muted}}/>
          </div>
          <div>
            <label style={lbl}>Stack après</label>
            <input type="number" value={stackAfter} onChange={e=>setStackAfter(e.target.value)} style={{...inp,textAlign:"center"}}/>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
          <div><label style={lbl}>Street finale</label><select value={finalStreet} onChange={e=>setFinalStreet(e.target.value)} style={inp}><option value="">—</option>{STREETS.map(s=><option key={s}>{s}</option>)}</select></div>
          <div><label style={lbl}>Action</label><select value={action} onChange={e=>setAction(e.target.value)} style={inp}><option value="">—</option>{ACTIONS.map(a=><option key={a}>{a}</option>)}</select></div>
        </div>
        <div style={{marginBottom:16}}>
          <label style={lbl}>Note</label>
          <textarea value={note} onChange={e=>setNote(e.target.value)} rows={2} style={{...inp,resize:"vertical"}}/>
        </div>

        <div style={{display:"flex",gap:10}}>
          {!confirmDelete
            ? <button onClick={()=>setConfirmDelete(true)} style={{padding:"11px 16px",background:"rgba(255,61,61,0.1)",border:`1.5px solid #FECACA`,borderRadius:10,color:C.loss,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:FF}}>🗑</button>
            : <button onClick={()=>onDelete(hand.id)} style={{padding:"11px 16px",background:C.loss,border:"none",borderRadius:10,color:"#0A0A0A",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:FF}}>Confirmer</button>
          }
          <button onClick={()=>onSave({...hand,result:parseFloat(gain)||0,stackAfter:parseFloat(stackAfter)||null,note,finalStreet,action})} style={{flex:1,padding:"11px 0",background:C.grad,border:"none",borderRadius:10,color:"#0A0A0A",fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:FF,boxShadow:"0 4px 16px rgba(124,58,237,0.3)"}}>
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────
export default function App(){
  const [user,setUser]=useState(null); // Supabase user object
  const [screen,setScreen]=useState("home");
  const [sessions,setSessions]=useState([]);
  const [activeSessionId,setActiveSessionId]=useState(null);
  const [shareHand,setShareHand]=useState(null);
  const [shareTable,setShareTable]=useState(false);
  const [showTableModal,setShowTableModal]=useState(false);
  const [sessionOptions,setSessionOptions]=useState(null);
  const [tab,setTab]=useState("add");
  const [showEndSession,setShowEndSession]=useState(false);
  const [editHand,setEditHand]=useState(null);
  const [loading,setLoading]=useState(true);

  // ── Auth listener ─────────────────────────────────────────
  useEffect(()=>{
    // Check current session
    supabase.auth.getSession().then(({data:{session}})=>{
      setUser(session?.user||null);
      setLoading(false);
    });
    // Listen for auth changes
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_,session)=>{
      setUser(session?.user||null);
      if(!session?.user) setSessions([]);
    });
    return ()=>subscription.unsubscribe();
  },[]);

  // ── Load sessions when user logs in ──────────────────────
  useEffect(()=>{
    if(!user) return;
    loadSessions();
  },[user]);

  const loadSessions=async()=>{
    const {data:sessionData}=await supabase.from("sessions").select("*").order("created_at",{ascending:false});
    if(!sessionData) return;
    // Load hands for each session
    const {data:handsData}=await supabase.from("hands").select("*").order("ts",{ascending:false});
    const sessionsWithHands=sessionData.map(s=>({
      ...s,
      // Map snake_case to camelCase
      startTime:s.start_time,
      startTs:s.start_ts,
      endTime:s.end_time,
      endTs:s.end_ts,
      currentSb:s.current_sb,
      currentBb:s.current_bb,
      currentAnte:s.current_ante,
      currentStack:s.current_stack,
      startingStack:s.starting_stack,
      playersPerTable:s.players_per_table,
      paidPlaces:s.paid_places,
      nbPlayers:s.nb_players,
      sessionNote:s.session_note,
      finalStack:s.final_stack,
      itmGain:s.itm_gain,
      tableSeats:s.table_seats||[],
      hands:(handsData||[]).filter(h=>h.session_id===s.id).map(h=>({
        ...h,
        result:h.result,
        stackAfter:h.stack_after,
        finalStreet:h.final_street,
        sessionName:h.session_name,
        sessionType:h.session_type,
        paidPlaces:h.paid_places,
        nbPlayers:h.nb_players,
      }))
    }));
    setSessions(sessionsWithHands);
  };

  if(loading) return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:FF}}>
      <div style={{textAlign:"center"}}>
        <EdgyLogo size={40}/>
        <div style={{color:C.textDim,marginTop:16,fontSize:14}}>Chargement...</div>
      </div>
    </div>
  );

  if(!user) return <LoginScreen onLogin={()=>loadSessions()}/>;

  // ── Data helpers ──────────────────────────────────────────
  const sessionBankroll=s=>{
    if(!s.closed) return null;
    if(s.type==="cash") return s.hands.reduce((a,h)=>a+h.result,0);
    if(s.itm&&s.itmGain!=null) return s.itmGain-parseFloat(s.buyin||0);
    if(s.closed) return -(parseFloat(s.buyin||0));
    return null;
  };

  const grandBankroll=sessions.reduce((t,s)=>{const b=sessionBankroll(s);return b!=null?t+b:t;},0);
  const totalHands=sessions.reduce((t,s)=>t+s.hands.length,0);
  const activeSession=sessions.find(s=>s.id===activeSessionId);
  const hands=activeSession?.hands||[];
  const sessionTotal=hands.reduce((a,h)=>a+h.result,0);

  // ── CRUD ──────────────────────────────────────────────────
  const handleSessionStart=async config=>{
    const {data,error}=await supabase.from("sessions").insert([{
      user_id:user.id,
      name:config.name,
      type:config.type,
      start_time:config.startTime,
      start_ts:config.startTs,
      buyin:config.buyin,
      currency:config.currency,
      format:config.format,
      starting_stack:config.startingStack,
      current_stack:config.startingStack,
      current_sb:config.currentSb,
      current_bb:config.currentBb,
      players_per_table:config.playersPerTable,
      nb_players:config.nbPlayers,
      cave:config.cave,
      blinds:config.blinds,
      table_seats:config.tableSeats||[],
    }]).select().single();
    if(error){console.error(error);return;}
    const newSession={...data,...config,id:data.id,hands:[]};
    setSessions(prev=>[newSession,...prev]);
    setActiveSessionId(data.id);
    setTab("add");
    setScreen("session");
  };

  const addHand=async hand=>{
    const {data,error}=await supabase.from("hands").insert([{
      session_id:activeSessionId,
      user_id:user.id,
      ts:hand.ts,
      card1:hand.card1,
      card2:hand.card2,
      board:hand.board,
      position:hand.position,
      nb_players:hand.nbPlayers,
      villains:hand.villains,
      sb:hand.sb,
      bb:hand.bb,
      ante:hand.ante,
      remaining:hand.remaining,
      paid_places:hand.paidPlaces,
      result:hand.result,
      stack_after:hand.stackAfter,
      final_street:hand.finalStreet,
      action:hand.action,
      note:hand.note,
      session_name:hand.sessionName,
      session_type:hand.sessionType,
    }]).select().single();
    if(error){console.error(error);return;}
    const newHand={...hand,id:data.id};
    // Update currentStack in session
    if(hand.stackAfter){
      await supabase.from("sessions").update({current_stack:hand.stackAfter}).eq("id",activeSessionId);
    }
    setSessions(prev=>prev.map(s=>{
      if(s.id!==activeSessionId) return s;
      const updated={...s,hands:[newHand,...s.hands]};
      if(hand.stackAfter) updated.currentStack=hand.stackAfter;
      return updated;
    }));
    setTab("history");
  };

  const updateSession=async fields=>{
    const dbFields={};
    if(fields.currentSb!==undefined) dbFields.current_sb=fields.currentSb;
    if(fields.currentBb!==undefined) dbFields.current_bb=fields.currentBb;
    if(fields.currentAnte!==undefined) dbFields.current_ante=fields.currentAnte;
    if(fields.currentStack!==undefined) dbFields.current_stack=fields.currentStack;
    if(fields.playersPerTable!==undefined) dbFields.players_per_table=fields.playersPerTable;
    if(fields.startingStack!==undefined) dbFields.starting_stack=fields.startingStack;
    if(fields.registered!==undefined) dbFields.registered=fields.registered;
    if(fields.remaining!==undefined) dbFields.remaining=fields.remaining;
    if(fields.paidPlaces!==undefined) dbFields.paid_places=fields.paidPlaces;
    if(fields.tableSeats!==undefined) dbFields.table_seats=fields.tableSeats;
    if(Object.keys(dbFields).length>0){
      await supabase.from("sessions").update(dbFields).eq("id",activeSessionId);
    }
    setSessions(prev=>prev.map(s=>s.id===activeSessionId?{...s,...fields}:s));
  };

  const endSession=async fields=>{
    await supabase.from("sessions").update({
      closed:true,
      end_time:fields.endTime,
      end_ts:fields.endTs,
      session_note:fields.sessionNote,
      final_stack:fields.finalStack,
      placement:fields.placement,
      itm:fields.itm,
      itm_gain:fields.itmGain,
    }).eq("id",activeSessionId);
    setSessions(prev=>prev.map(s=>s.id===activeSessionId?{...s,...fields}:s));
    setShowEndSession(false);
    setScreen("history");
  };

  const saveEditedHand=async updated=>{
    await supabase.from("hands").update({
      result:updated.result,
      stack_after:updated.stackAfter,
      note:updated.note,
      final_street:updated.finalStreet,
      action:updated.action,
    }).eq("id",updated.id);
    setSessions(prev=>prev.map(s=>{
      if(s.id!==activeSessionId) return s;
      const newHands=s.hands.map(h=>h.id===updated.id?updated:h);
      const latest=newHands[0];
      const updatedSession={...s,hands:newHands};
      if(latest?.stackAfter) updatedSession.currentStack=latest.stackAfter;
      return updatedSession;
    }));
    setEditHand(null);
  };

  const deleteHand=async handId=>{
    await supabase.from("hands").delete().eq("id",handId);
    setSessions(prev=>prev.map(s=>s.id===activeSessionId?{...s,hands:s.hands.filter(h=>h.id!==handId)}:s));
    setEditHand(null);
  };

  const deleteSession=async id=>{
    await supabase.from("sessions").delete().eq("id",id);
    setSessions(prev=>prev.filter(s=>s.id!==id));
    if(activeSessionId===id) setActiveSessionId(null);
  };

  const renameSession=async(id,name)=>{
    await supabase.from("sessions").update({name}).eq("id",id);
    setSessions(prev=>prev.map(s=>s.id===id?{...s,name}:s));
  };

  const handleLogout=async()=>{
    await supabase.auth.signOut();
    setUser(null);
    setSessions([]);
    setScreen("home");
  };

  if(!user) return <LoginScreen onLogin={()=>loadSessions()}/>;


  if(screen==="home") return <HomeScreen user={user?.email?.split("@")[0]||"Joueur"} grandTotal={grandBankroll} totalHands={totalHands} onNewSession={()=>setScreen("config")} onHistory={()=>setScreen("history")} onStats={()=>setScreen("stats")} onLogout={handleLogout}/>;

  if(screen==="config") return <SessionConfig onStart={handleSessionStart} onBack={()=>setScreen("home")}/>;

  if(screen==="stats") return <StatsScreen sessions={sessions} sessionBankroll={sessionBankroll} onBack={()=>setScreen("home")}/>;;

  if(screen==="session") return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:FF}}>
      <div style={{background:"#0E0E0E",padding:"14px 20px",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
        <div style={{maxWidth:680,margin:"0 auto"}}>
          <button onClick={()=>setScreen("home")} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:8,color:"#0A0A0A",padding:"4px 10px",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:FF,marginBottom:6}}>← Accueil</button>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
            <div style={{minWidth:0}}>
              <div style={{fontWeight:900,fontSize:18,color:"#0A0A0A"}}>{activeSession?.name}</div>
              <div style={{color:"rgba(255,255,255,0.65)",fontSize:12,marginTop:2}}>
                {activeSession?.type==="cash"
                  ?`💵 ${activeSession.blinds} · Cave : ${activeSession.cave}€`
                  :`🏆 ${activeSession.format} · Buy-in : ${activeSession.buyin}${activeSession.currency||"€"}${activeSession.currentSb&&activeSession.currentBb?` · ${activeSession.currentSb}/${activeSession.currentBb}`:""}`}
                {" · "}<span style={{fontWeight:700,color:sessionTotal>0?"#A7F3D0":sessionTotal<0?"#FCA5A5":"#fff"}}>{fmtChips(sessionTotal)}</span> · {hands.length} mains
              </div>
            </div>
            <div style={{display:"flex",gap:6,flexShrink:0}}>
              {activeSession?.type==="tournoi"&&<SessionInfoPanel session={activeSession} onUpdate={updateSession}/>}
              <button onClick={()=>setShowTableModal(true)} style={{background:"rgba(255,255,255,0.12)",border:"1px solid rgba(255,255,255,0.25)",borderRadius:8,color:"#0A0A0A",padding:"5px 10px",cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:FF,display:"flex",alignItems:"center",gap:5}}>
                🪑 Ma table {activeSession?.tableSeats?.some(s=>s.name)?"✓":""}
              </button>
              {activeSession?.tableSeats?.some(s=>s.name)&&(
                <button onClick={()=>setShareTable(true)} style={{background:"rgba(124,58,237,0.2)",border:"1px solid rgba(124,58,237,0.4)",borderRadius:8,color:"#c4b5fd",padding:"5px 10px",cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:FF}}>
                  📸 Table
                </button>
              )}
              {!activeSession?.closed&&(
                <button onClick={()=>setShowEndSession(true)} style={{background:"rgba(239,68,68,0.2)",border:"1px solid rgba(239,68,68,0.4)",borderRadius:8,color:"#fca5a5",padding:"5px 10px",cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:FF}}>
                  🏁 Fin
                </button>
              )}
              {activeSession?.closed&&(
                <span style={{background:"rgba(255,255,255,0.1)",borderRadius:8,color:"rgba(255,255,255,0.5)",padding:"5px 10px",fontSize:11,fontWeight:700}}>✓ Terminée</span>
              )}
            </div>
          </div>
        </div>
      </div>
      <div style={{maxWidth:680,margin:"0 auto",padding:"16px 14px 40px"}}>
        <div style={{display:"flex",gap:0,marginBottom:14,background:C.bgCard,borderRadius:10,padding:4,border:"1px solid rgba(255,255,255,0.08)"}}>
          {[["add","✏️ Saisir"],["history","📋 Mains"]].map(([t,l])=>(
            <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:"8px 0",borderRadius:8,background:tab===t?C.grad:"transparent",color:tab===t?"#0A0A0A":C.textMid,border:"none",color:tab===t?"#fff":C.muted,cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:FF,transition:"all .15s"}}>{l}</button>
          ))}
        </div>
        {tab==="history"&&<StatsBar hands={hands}/>}
        {/* Courbe de session — cash game uniquement */}
        {tab==="history"&&activeSession?.type==="cash"&&hands.length>=2&&(
          <div style={{background:C.bgCard,border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:16,marginBottom:14}}>
            <div style={{fontSize:12,color:C.textMid,fontWeight:600,marginBottom:8}}>Courbe de session</div>
            <Sparkline hands={hands} width={Math.min(600,window.innerWidth-60)} height={80}/>
          </div>
        )}
        {/* Évolution du Stack — tournoi uniquement, avec stack moyen */}
        {tab==="history"&&activeSession?.type==="tournoi"&&hands.filter(h=>h.stackAfter).length>=2&&(()=>{
          const handsWithStack=hands.slice().reverse().filter(h=>h.stackAfter);
          const startStack=parseFloat(activeSession?.startingStack)||0;
          const registeredN=parseFloat(activeSession?.registered||activeSession?.nbPlayers)||0;

          const stackData=handsWithStack.map((h,i)=>{
            // Stack moyen = (inscrits * stack de départ) / joueurs restants au moment de la main
            const rem=parseFloat(h.remaining)||0;
            const avgStack=(registeredN&&startStack&&rem)
              ? Math.round((registeredN*startStack)/rem)
              : null;
            return {label:`M${i+1}`, stack:h.stackAfter, avg:avgStack, gain:h.result};
          });
          if(startStack) stackData.unshift({label:"Départ",stack:startStack,avg:startStack,gain:0});

          const hasAvg=stackData.some(d=>d.avg!=null);
          const lastStack=stackData[stackData.length-1]?.stack||0;
          const lastAvg=stackData[stackData.length-1]?.avg||0;
          const ratio=lastAvg?Math.round((lastStack/lastAvg)*100):null;

          return (
            <div style={{background:C.bgCard,border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:16,marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                <div style={{fontSize:12,color:C.textMid,fontWeight:600}}>🏔 Évolution du Stack</div>
                {ratio!=null&&(
                  <div style={{fontSize:11,fontWeight:800,color:ratio>=100?C.win:C.loss,background:ratio>=100?"#F0FDF4":"#FEF2F2",padding:"2px 8px",borderRadius:20}}>
                    {ratio>=100?"▲":"▼"} {ratio}% vs moy.
                  </div>
                )}
              </div>
              <div style={{display:"flex",gap:12,marginBottom:10}}>
                <div style={{fontSize:10,color:C.cyan,fontWeight:700}}>— Mon stack</div>
                {hasAvg&&<div style={{fontSize:10,color:C.gold,fontWeight:700}}>— Stack moyen</div>}
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={stackData} margin={{top:5,right:8,left:0,bottom:5}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0D9FF" vertical={false}/>
                  <XAxis dataKey="label" tick={{fontSize:9,fill:C.muted,fontFamily:FF}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:9,fill:C.muted,fontFamily:FF}} axisLine={false} tickLine={false} tickFormatter={v=>v>=1000?`${(v/1000).toFixed(0)}k`:v} width={36}/>
                  <Tooltip
                    formatter={(v,n)=>[v?.toLocaleString(),n==="stack"?"Mon stack":"Stack moyen"]}
                    labelStyle={{fontWeight:700,color:C.text,fontFamily:FF}}
                    contentStyle={{borderRadius:10,border:"1px solid rgba(255,255,255,0.08)",fontFamily:FF,fontSize:12}}
                  />
                  <Line type="monotone" dataKey="stack" name="stack" stroke={C.cyan} strokeWidth={2.5} dot={{fill:C.cyan,r:3}} activeDot={{r:5}}/>
                  {hasAvg&&<Line type="monotone" dataKey="avg" name="avg" stroke={C.gold} strokeWidth={1.5} strokeDasharray="5 3" dot={false} activeDot={{r:4,fill:C.gold}}/>}
                </LineChart>
              </ResponsiveContainer>
            </div>
          );
        })()}
        {tab==="add"&&!activeSession?.closed&&<HandForm onSave={addHand} sessionName={activeSession?.name} sessionType={activeSession?.type} defaultSb={activeSession?.currentSb||""} defaultBb={activeSession?.currentBb||""} defaultAnte={activeSession?.currentAnte||activeSession?.currentBb||""} defaultStack={activeSession?.currentStack||hands[0]?.stackAfter||activeSession?.startingStack||""} defaultRemaining={activeSession?.remaining||""} defaultPaidPlaces={activeSession?.paidPlaces||""}/>}
        {tab==="add"&&activeSession?.closed&&(
          <div style={{background:C.bgCard,border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:32,textAlign:"center"}}>
            <div style={{fontSize:32,marginBottom:8}}>✓</div>
            <div style={{color:C.textMid,fontSize:14}}>Cette session est terminée.</div>
          </div>
        )}
        {tab==="history"&&(
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {hands.length===0?(
              <div style={{background:C.bgCard,border:`2px dashed ${C.border}`,borderRadius:14,padding:40,textAlign:"center"}}>
                <div style={{fontSize:40,marginBottom:8}}>🃏</div>
                <div style={{color:C.textMid,fontSize:14,marginBottom:12}}>Aucune main pour l'instant</div>
                <button onClick={()=>setTab("add")} style={{background:C.grad,border:"none",borderRadius:8,color:"#0A0A0A",padding:"10px 24px",cursor:"pointer",fontWeight:700,fontFamily:FF}}>Saisir ma première main</button>
              </div>
            ):hands.map(h=><HandCard key={h.id} hand={h} onShare={setShareHand} onEdit={setEditHand}/>)}
          </div>
        )}
      </div>
      {shareHand&&<ShareStudio hand={shareHand} session={activeSession} onClose={()=>setShareHand(null)}/>}
      {shareTable&&<ShareStudio hand={{id:"table",result:0,card1:null,card2:null}} session={activeSession} initialMode="table" onClose={()=>setShareTable(false)}/>}
      {showTableModal&&<TableModal session={activeSession} onUpdate={updateSession} onClose={()=>setShowTableModal(false)}/>}
      {showEndSession&&<EndSessionModal session={activeSession} hands={hands} onConfirm={endSession} onCancel={()=>setShowEndSession(false)}/>}
      {editHand&&<EditHandModal hand={editHand} onSave={saveEditedHand} onDelete={deleteHand} onClose={()=>setEditHand(null)}/>}
    </div>
  );

  if(screen==="history") return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:FF}}>
      <div style={{background:"#0E0E0E",padding:"14px 20px",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
        <div style={{maxWidth:680,margin:"0 auto"}}>
          <button onClick={()=>setScreen("home")} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:8,color:"#0A0A0A",padding:"4px 10px",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:FF,marginBottom:6}}>← Accueil</button>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
            <div>
              <div style={{fontWeight:900,fontSize:18,color:"#0A0A0A"}}>📋 Historique des Sessions</div>
              <div style={{color:"rgba(255,255,255,0.65)",fontSize:12,marginTop:2}}>
                {sessions.length} session{sessions.length>1?"s":""} · {totalHands} mains
              </div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.5)",fontWeight:700,textTransform:"uppercase",letterSpacing:.8}}>Bankroll</div>
              <div style={{fontWeight:900,fontSize:26,color:grandBankroll>0?"#4ade80":grandBankroll<0?"#f87171":"#fff",lineHeight:1.1}}>
                {grandBankroll>0?"+":""}{grandBankroll.toLocaleString("fr-FR")} €
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style={{maxWidth:680,margin:"0 auto",padding:"16px 14px 40px"}}>
        {sessions.length===0?(
          <div style={{background:C.bgCard,border:`2px dashed ${C.border}`,borderRadius:16,padding:48,textAlign:"center"}}>
            <div style={{fontSize:48,marginBottom:12}}>📭</div>
            <div style={{color:C.textMid,fontSize:15,marginBottom:16}}>Aucune session enregistrée</div>
            <button onClick={()=>setScreen("config")} style={{background:C.grad,border:"none",borderRadius:10,color:"#0A0A0A",padding:"12px 28px",cursor:"pointer",fontWeight:800,fontSize:15,fontFamily:FF}}>Démarrer ma première session</button>
          </div>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {sessions.slice().reverse().map(s=>{
              const tot=s.hands.reduce((a,h)=>a+h.result,0);
              const br=sessionBankroll(s);
              const brWon=br!=null&&br>0, brLost=br!=null&&br<0;
              return (
                <div key={s.id} style={{background:C.bgCard,border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,boxShadow:"0 2px 10px rgba(124,58,237,0.05)",borderLeft:`4px solid ${brWon?C.win:brLost?C.loss:C.muted}`,overflow:"hidden"}}>
                  <button onClick={()=>{setActiveSessionId(s.id);setTab("history");setScreen("session");}} style={{width:"100%",padding:"14px 16px",cursor:"pointer",textAlign:"left",background:"transparent",border:"none",fontFamily:FF,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                        <span style={{fontWeight:800,fontSize:15,color:C.text}}>{s.name}</span>
                        {s.closed&&<span style={{background:"rgba(0,230,118,0.1)",color:C.win,fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:10,flexShrink:0}}>✓</span>}
                      </div>
                      <div style={{display:"flex",gap:5,alignItems:"center",flexWrap:"wrap",marginBottom:3}}>
                        <span style={{background:"#1A1A1A",color:C.primary,fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:20}}>{s.type==="cash"?"💵 Cash":"🏆 Tournoi"}</span>
                        {s.type==="tournoi"&&s.format&&<span style={{color:C.textMid,fontSize:11}}>{s.format}</span>}
                        {s.type==="tournoi"&&s.buyin&&<span style={{color:C.textMid,fontSize:11}}>Buy-in : {s.buyin}{s.currency||"€"}</span>}
                        {s.placement&&<span style={{color:C.textMid,fontSize:11}}>#{s.placement}</span>}
                        {s.itm&&<span style={{background:"rgba(0,230,118,0.1)",color:C.win,fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:20}}>💰 ITM</span>}
                        <span style={{color:C.textMid,fontSize:11}}>{s.hands.length} mains</span>
                      </div>
                      <div style={{color:"#D1D5DB",fontSize:10}}>{s.startTime}{s.endTime?` → ${s.endTime}`:""}</div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4,flexShrink:0}}>
                      {br!=null?(
                        <div style={{fontWeight:900,fontSize:20,color:brWon?C.win:brLost?C.loss:C.muted}}>
                          {br>0?"+":""}{br.toLocaleString("fr-FR")} €
                        </div>
                      ):(
                        <div style={{fontWeight:700,fontSize:13,color:C.textMid}}>En cours…</div>
                      )}
                      <div style={{fontSize:11,color:C.textMid,fontWeight:600}}>{fmtChips(tot)} jetons</div>
                    </div>
                  </button>
                  {/* Options bar */}
                  <div style={{borderTop:`1px solid ${C.border}`,padding:"6px 16px",display:"flex",gap:8,background:C.bgElevated}}>
                    <button onClick={e=>{e.stopPropagation();setSessionOptions(s.id);}} style={{background:"none",border:"none",color:C.textMid,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:FF,padding:"2px 6px",borderRadius:6,display:"flex",alignItems:"center",gap:4}}>✏️ Renommer / Supprimer</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
