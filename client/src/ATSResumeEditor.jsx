import { exportToPDF } from "./exportPDF";
import { useState, useEffect, useRef, useCallback } from "react";

const FONTS = [
  { name: "Calibri",         val: "Calibri, sans-serif",        tag: "Best" },
  { name: "Georgia",         val: "Georgia, serif",             tag: "Classic" },
  { name: "Garamond",        val: "Garamond, serif",            tag: "Elegant" },
  { name: "Tahoma",          val: "Tahoma, sans-serif",         tag: "Clean" },
  { name: "Verdana",         val: "Verdana, sans-serif",        tag: "Safe" },
  { name: "Times New Roman", val: "'Times New Roman', serif",   tag: "Formal" },
];

const ACCENT_COLORS = ["#1a365d","#185fa5","#2d6a4f","#6b2737","#4a4e69","#7b3f00","#000000"];

const PAGE_SIZES = [
  { label: "A4",     width: 794 },
  { label: "Letter", width: 816 },
];

const BLOCK_TYPES = [
  { type: "name",       label: "Your Name",       icon: "A" },
  { type: "contact",    label: "Contact Info",     icon: "@" },
  { type: "heading",    label: "Section Heading",  icon: "H" },
  { type: "subheading", label: "Sub Heading",      icon: "h" },
  { type: "text",       label: "Body Text",        icon: "T" },
  { type: "bullet",     label: "Bullet List",      icon: "•" },
  { type: "link",       label: "Link",             icon: "~" },
  { type: "divider",    label: "Divider Line",     icon: "—" },
];

const DEFAULT_TEXT = {
  name:       "Your Name",
  contact:    "email@example.com  |  Phone  |  City",
  heading:    "Section Heading",
  subheading: "Job Title — Company",
  text:       "Start typing here...",
  bullet:     "First bullet point\nSecond bullet point",
  link:       "",
  divider:    "",
};

const uid = () => Math.random().toString(36).slice(2, 8);

const INITIAL_BLOCKS = [
  { id: uid(), type: "name",       text: "Your Full Name" },
  { id: uid(), type: "contact",    text: "email@example.com  |  +91 98765 43210  |  City, India" },
  { id: uid(), type: "divider",    text: "" },
  { id: uid(), type: "heading",    text: "Professional Summary" },
  { id: uid(), type: "text",       text: "Results-driven professional with X years of experience in [your field]." },
  { id: uid(), type: "divider",    text: "" },
  { id: uid(), type: "heading",    text: "Work Experience" },
  { id: uid(), type: "subheading", text: "Job Title — Company Name" },
  { id: uid(), type: "text",       text: "Jan 2022 – Present  |  City, India" },
  { id: uid(), type: "bullet",     text: "Achieved X% improvement in [metric] by implementing [solution].\nLed a team of N engineers to deliver [project] on time.\nCollaborated with stakeholders to define requirements." },
  { id: uid(), type: "divider",    text: "" },
  { id: uid(), type: "heading",    text: "Education" },
  { id: uid(), type: "subheading", text: "B.Tech — Computer Science" },
  { id: uid(), type: "text",       text: "ABC University  |  2018 – 2022  |  GPA: 8.5/10" },
  { id: uid(), type: "divider",    text: "" },
  { id: uid(), type: "heading",    text: "Skills" },
  { id: uid(), type: "text",       text: "JavaScript · React · Node.js · Python · SQL · Git" },
];

// ── Link Modal ─────────────────────────────────────────
function LinkModal({ onAdd, onClose }) {
  const [text, setText] = useState("");
  const [url,  setUrl]  = useState("https://");
  const inp = { width:"100%", padding:"8px 10px", background:"#0f1117", border:"1.5px solid #2d3748", borderRadius:6, color:"#e2e8f0", fontSize:13, outline:"none", marginBottom:8, fontFamily:"inherit" };
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200 }}>
      <div style={{ background:"#1e2330", border:"1px solid #2d3748", borderRadius:10, padding:"22px 26px", width:300, fontFamily:"'Segoe UI',sans-serif" }}>
        <p style={{ fontWeight:700, marginBottom:14, color:"#e2e8f0", fontSize:14 }}>Insert Link</p>
        <input value={text} onChange={e=>setText(e.target.value)} placeholder="Display text (e.g. LinkedIn)" style={inp} />
        <input value={url}  onChange={e=>setUrl(e.target.value)}  placeholder="URL (https://...)" style={inp} />
        <div style={{ display:"flex", gap:8, marginTop:4 }}>
          <button onClick={()=>{ if(url&&url!=="https://") onAdd(text||url,url); }}
            style={{ flex:1, padding:"8px", background:"#185fa5", border:"none", borderRadius:6, color:"#e2e8f0", fontWeight:700, cursor:"pointer", fontSize:13 }}>
            Insert
          </button>
          <button onClick={onClose}
            style={{ flex:1, padding:"8px", background:"#1e2330", border:"1.5px solid #2d3748", borderRadius:6, color:"#e2e8f0", cursor:"pointer", fontSize:13 }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Single Block ───────────────────────────────────────
function Block({ block, isSelected, font, sizes, accentColor, onSelect, onChange, onDelete, onMoveUp, onMoveDown }) {
  const taRef = useRef(null);

  // Auto-resize textarea height
  useEffect(() => {
    if (taRef.current) {
      taRef.current.style.height = "auto";
      taRef.current.style.height = taRef.current.scrollHeight + "px";
    }
  }, [block.text, isSelected]);

  const ta = (extra={}) => ({
    width:"100%", border:"none", outline:"none", resize:"none",
    background:"transparent", fontFamily:font.val,
    lineHeight:1.55, overflow:"hidden", display:"block", ...extra,
  });

  const Controls = () => (
    <div style={{ position:"absolute", top:-1, right:-1, display:"flex", gap:1, background:"#1e2330", border:"1px solid #2d3748", borderRadius:"0 3px 0 5px", padding:"1px 3px" }}>
      {[["↑",onMoveUp],["↓",onMoveDown]].map(([lbl,fn])=>(
        <button key={lbl} onMouseDown={e=>{e.preventDefault();e.stopPropagation();fn();}}
          style={{ background:"none", border:"none", color:"#94a3b8", cursor:"pointer", fontSize:11, padding:"1px 4px" }}>{lbl}</button>
      ))}
      <button onMouseDown={e=>{e.preventDefault();e.stopPropagation();onDelete();}}
        style={{ background:"none", border:"none", color:"#f87171", cursor:"pointer", fontSize:11, padding:"1px 4px" }}>✕</button>
    </div>
  );

  const wrap = (children, extra={}) => (
    <div onClick={onSelect} style={{ position:"relative", border:`1.5px dashed ${isSelected?"#378add":"transparent"}`, borderRadius:3, cursor:"text", ...extra }}>
      {isSelected && <Controls />}
      {children}
    </div>
  );

  switch (block.type) {

    case "name":
      return wrap(
        <textarea ref={taRef} value={block.text} onChange={e=>onChange(e.target.value)} rows={1}
          style={ta({ fontSize:sizes.name+"pt", fontWeight:700, color:accentColor, textAlign:"center" })} />
      );

    case "contact":
      return wrap(
        <textarea ref={taRef} value={block.text} onChange={e=>onChange(e.target.value)} rows={1}
          style={ta({ fontSize:sizes.body+"pt", color:"#555", textAlign:"center" })} />
      );

    case "heading":
      return wrap(
        <textarea ref={taRef} value={block.text} onChange={e=>onChange(e.target.value)} rows={1}
          style={ta({ fontSize:sizes.heading+"pt", fontWeight:700, color:accentColor, textTransform:"uppercase", letterSpacing:"0.5px" })} />,
        { marginTop:6 }
      );

    case "subheading":
      return wrap(
        <textarea ref={taRef} value={block.text} onChange={e=>onChange(e.target.value)} rows={1}
          style={ta({ fontSize:(sizes.body+1)+"pt", fontWeight:700, color:"#1a1a1a" })} />
      );

    case "text":
      return wrap(
        <textarea ref={taRef} value={block.text} onChange={e=>onChange(e.target.value)} rows={1}
          style={ta({ fontSize:sizes.body+"pt", color:"#333" })} />
      );

    case "bullet":
      return wrap(
        isSelected ? (
          <div>
            <p style={{ fontSize:10, color:"#4f8ef7", marginBottom:3, fontFamily:"'Segoe UI',sans-serif" }}>One bullet per line ↵</p>
            <textarea ref={taRef} value={block.text} onChange={e=>onChange(e.target.value)}
              style={ta({ fontSize:sizes.body+"pt", color:"#333", whiteSpace:"pre-wrap" })} />
          </div>
        ) : (
          <ul style={{ paddingLeft:18, margin:0 }}>
            {block.text.split("\n").filter(l=>l.trim()).map((line,i)=>(
              <li key={i} style={{ fontSize:sizes.body+"pt", color:"#333", fontFamily:font.val, lineHeight:1.55, marginBottom:2 }}>{line}</li>
            ))}
          </ul>
        )
      );

    case "link": {
      const [linkText, linkUrl] = block.text.split("|||");
      return wrap(
        <a href={linkUrl} target="_blank" rel="noopener noreferrer"
          style={{ fontSize:sizes.body+"pt", color:accentColor, fontFamily:font.val, textDecoration:"underline" }}>
          {linkText || linkUrl}
        </a>
      );
    }

    case "divider":
      return wrap(
        <div style={{ padding:"4px 0" }}>
          <hr style={{ border:"none", borderTop:`2px solid ${accentColor}`, margin:0 }} />
        </div>
      );

    default: return null;
  }
}

// ── Left Panel ─────────────────────────────────────────
function LeftPanel({ font, setFont, sizes, setSizes, accentColor, setAccentColor, pageSize, setPageSize, onAddBlock, onShowLinkModal }) {
  const sec = (title, children) => (
    <div style={{ padding:"11px 12px 10px", borderBottom:"1px solid #2d3748" }}>
      <p style={{ fontSize:10, fontWeight:700, letterSpacing:"1px", textTransform:"uppercase", color:"#64748b", marginBottom:9 }}>{title}</p>
      {children}
    </div>
  );

  return (
    <div style={{ width:220, minWidth:220, background:"#1a1f2e", borderRight:"1px solid #2d3748", overflowY:"auto", fontFamily:"'Segoe UI',sans-serif" }}>
      <div style={{ padding:"13px 12px", borderBottom:"1px solid #2d3748", display:"flex", gap:9, alignItems:"center" }}>
        <div style={{ width:28, height:28, background:"#185fa5", borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:15, color:"#fff", flexShrink:0 }}>R</div>
        <div>
          <p style={{ fontSize:13, fontWeight:700, color:"#e2e8f0" }}>Resume Builder</p>
          <p style={{ fontSize:10, color:"#34d399", letterSpacing:1 }}>ATS FRIENDLY</p>
        </div>
      </div>

      {sec("Add Block",
        <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
          {BLOCK_TYPES.map(bt=>(
            <button key={bt.type} onClick={()=>bt.type==="link"?onShowLinkModal():onAddBlock(bt.type)}
              style={{ display:"flex", alignItems:"center", gap:8, background:"transparent", border:"1px solid #2d3748", borderRadius:6, padding:"6px 9px", cursor:"pointer", color:"#e2e8f0", fontSize:12, textAlign:"left" }}>
              <span style={{ width:16, textAlign:"center", fontWeight:700 }}>{bt.icon}</span>{bt.label}
            </button>
          ))}
        </div>
      )}

      {sec("Font",
        <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
          {FONTS.map(f=>(
            <button key={f.name} onClick={()=>setFont(f)}
              style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:font.name===f.name?"rgba(24,95,165,0.2)":"transparent", border:`1px solid ${font.name===f.name?"#185fa5":"#2d3748"}`, borderRadius:6, padding:"6px 9px", cursor:"pointer", color:"#e2e8f0", fontFamily:f.val, fontSize:12 }}>
              {f.name}
              <span style={{ fontSize:9, background:"rgba(52,211,153,0.15)", color:"#34d399", padding:"2px 5px", borderRadius:3, fontWeight:700, fontFamily:"'Segoe UI',sans-serif" }}>{f.tag}</span>
            </button>
          ))}
        </div>
      )}

      {sec("Font Size",
        <div>
          {[["Name",sizes.name,18,34,"name"],["Heading",sizes.heading,10,16,"heading"],["Body",sizes.body,9,13,"body"]].map(([lbl,val,mn,mx,key])=>(
            <div key={key} style={{ display:"flex", alignItems:"center", gap:7, marginBottom:7 }}>
              <span style={{ fontSize:11, color:"#94a3b8", width:55, flexShrink:0 }}>{lbl}</span>
              <input type="range" min={mn} max={mx} value={val}
                onChange={e=>setSizes(s=>({...s,[key]:Number(e.target.value)}))}
                style={{ flex:1, accentColor:"#185fa5" }} />
              <span style={{ fontSize:11, width:22, textAlign:"right", color:"#e2e8f0" }}>{val}</span>
            </div>
          ))}
          <p style={{ fontSize:10, color:"#475569" }}>ATS recommended: Body 10–12pt</p>
        </div>
      )}

      {sec("Accent Color",
        <div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:9 }}>
            {ACCENT_COLORS.map(c=>(
              <div key={c} onClick={()=>setAccentColor(c)}
                style={{ width:22, height:22, borderRadius:"50%", background:c, cursor:"pointer", border:accentColor===c?"2.5px solid #e2e8f0":"2px solid transparent", transform:accentColor===c?"scale(1.2)":"scale(1)", transition:"transform .1s" }} />
            ))}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:7 }}>
            <span style={{ fontSize:11, color:"#94a3b8" }}>Custom:</span>
            <input type="color" value={accentColor} onChange={e=>setAccentColor(e.target.value)}
              style={{ width:30, height:22, border:"none", background:"none", cursor:"pointer", padding:0 }} />
            <span style={{ fontSize:11, color:"#64748b" }}>{accentColor}</span>
          </div>
        </div>
      )}

      {sec("Page Size",
        <div>
          <div style={{ display:"flex", gap:6 }}>
            {PAGE_SIZES.map(s=>(
              <button key={s.label} onClick={()=>setPageSize(s)}
                style={{ padding:"4px 12px", borderRadius:20, cursor:"pointer", fontSize:12, fontFamily:"inherit", border:`1px solid ${pageSize.label===s.label?"#185fa5":"#2d3748"}`, background:pageSize.label===s.label?"rgba(24,95,165,0.2)":"transparent", color:pageSize.label===s.label?"#60a5fa":"#e2e8f0", fontWeight:pageSize.label===s.label?700:400 }}>
                {s.label}
              </button>
            ))}
          </div>
          <p style={{ fontSize:10, color:"#475569", marginTop:7 }}>A4 & Letter most ATS-safe</p>
        </div>
      )}
    </div>
  );
}

// ── Root App ───────────────────────────────────────────
export default function ATSResumeBuilder() {
  const [blocks,      setBlocks]      = useState(INITIAL_BLOCKS);
  const [selId,       setSelId]       = useState(null);
  const [font,        setFont]        = useState(FONTS[0]);
  const [sizes,       setSizes]       = useState({ name:24, heading:12, body:11 });
  const [accentColor, setAccentColor] = useState("#1a365d");
  const [pageSize,    setPageSize]    = useState(PAGE_SIZES[0]);
  const [showLink,    setShowLink]    = useState(false);
  const [exporting,   setExporting]   = useState(false); 
   const paperRef = useRef(null); 
  const updateText = useCallback((id, text) => {
    setBlocks(bs=>bs.map(b=>b.id===id?{...b,text}:b));
  }, []);

  const deleteBlock = useCallback((id) => {
    setBlocks(bs=>bs.filter(b=>b.id!==id));
    setSelId(null);
  }, []);

  const moveUp = useCallback((id) => {
    setBlocks(bs=>{ const i=bs.findIndex(b=>b.id===id); if(i<=0) return bs; const n=[...bs]; [n[i-1],n[i]]=[n[i],n[i-1]]; return n; });
  }, []);

  const moveDown = useCallback((id) => {
    setBlocks(bs=>{ const i=bs.findIndex(b=>b.id===id); if(i>=bs.length-1) return bs; const n=[...bs]; [n[i],n[i+1]]=[n[i+1],n[i]]; return n; });
  }, []);

  const addBlock = useCallback((type) => {
    const nb={id:uid(),type,text:DEFAULT_TEXT[type]};
    setBlocks(bs=>{ const i=bs.findIndex(b=>b.id===selId); if(i===-1) return [...bs,nb]; const n=[...bs]; n.splice(i+1,0,nb); return n; });
    setSelId(nb.id);
  }, [selId]);

  const addLink = useCallback((text, url) => {
    const nb={id:uid(),type:"link",text:`${text}|||${url}`};
    setBlocks(bs=>{ const i=bs.findIndex(b=>b.id===selId); if(i===-1) return [...bs,nb]; const n=[...bs]; n.splice(i+1,0,nb); return n; });
    setSelId(nb.id);
    setShowLink(false);
  }, [selId]);

  return (
    <div style={{ display:"flex", height:"100vh", background:"#0f1117", overflow:"hidden", fontFamily:"'Segoe UI',sans-serif" }}>
      <LeftPanel
        font={font} setFont={setFont}
        sizes={sizes} setSizes={setSizes}
        accentColor={accentColor} setAccentColor={setAccentColor}
        pageSize={pageSize} setPageSize={setPageSize}
        onAddBlock={addBlock}
        onShowLinkModal={()=>setShowLink(true)}
      />

      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <div style={{ background:"#1a1f2e", borderBottom:"1px solid #2d3748", padding:"9px 18px", display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
          <span style={{ fontSize:12, color:"#64748b" }}>{blocks.length} blocks · {pageSize.label} · {font.name}</span>
          <div style={{ flex:1 }} />
          <button
  onClick={async () => {
    setExporting(true);
    await exportToPDF(paperRef, "my-resume.pdf");
    setExporting(false);
  }}
  disabled={exporting}
  style={{
    padding: "6px 16px",
    background: exporting ? "#334155" : "#185fa5",
    border: "none",
    borderRadius: 6,
    color: "#e2e8f0",
    fontSize: 12,
    fontWeight: 700,
    cursor: exporting ? "not-allowed" : "pointer",
    minWidth: 130,
  }}
>
  {exporting ? "Generating..." : "Download PDF"}
</button>
        </div>

        <div style={{ flex:1, overflow:"auto", display:"flex", justifyContent:"center", padding:"32px 16px", background:"#0f1117" }}
          onClick={e=>{if(e.target===e.currentTarget)setSelId(null);}}>
          <div

              ref={paperRef} 
            onClick={e=>{if(e.target===e.currentTarget)setSelId(null);}}
            style={{
  width:        pageSize.width + "px",      // just this ONE width line
  minWidth:     pageSize.width + "px",
  minHeight:    pageSize.width * 1.41 + "px",
  background:   "#fff",
  padding:      "48px 56px",
  boxShadow:    "0 6px 32px rgba(0,0,0,0.4)",
  borderRadius: 2,
  display:      "flex",
  flexDirection:"column",
  gap:          3,
  boxSizing:    "border-box",
}}>
            {blocks.map(b=>(
              <Block key={b.id} block={b} isSelected={selId===b.id} font={font} sizes={sizes} accentColor={accentColor}
                onSelect={()=>setSelId(b.id)}
                onChange={text=>updateText(b.id,text)}
                onDelete={()=>deleteBlock(b.id)}
                onMoveUp={()=>moveUp(b.id)}
                onMoveDown={()=>moveDown(b.id)}
              />
            ))}
            {blocks.length===0&&(
              <p style={{ textAlign:"center", color:"#aaa", fontSize:13, padding:"60px 0" }}>Click a block type in the left panel to start.</p>
            )}
          </div>
        </div>
      </div>

      {showLink && <LinkModal onAdd={addLink} onClose={()=>setShowLink(false)} />}
      <style>{`@media print { body > * { display:none!important; } }`}</style>
    </div>
  );
}