import { useState } from 'react'
import { Plus } from 'lucide-react'
import { ProgramCard } from '../programs/ProgramCard.jsx'
import { TemplateCard } from '../programs/TemplateCard.jsx'
import { TemplateEditor } from '../programs/TemplateEditor.jsx'
import useStore from '../../store/index.js'

export function ProgramsTab() {
  const programs = useStore(s => s.programs)
  const templates = useStore(s => s.templates)
  const startWorkout = useStore(s => s.startWorkout)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingTmpl, setEditingTmpl] = useState(null)

  return (
    <div className="pb-nav" style={{ padding:'24px 20px',display:'flex',flexDirection:'column',gap:24 }}>
      <div className="si">
        <h1 style={{ fontSize:28,fontWeight:800,letterSpacing:'-0.04em',color:'var(--text)' }}>Programas</h1>
        <p style={{ fontSize:13,color:'var(--text2)',marginTop:4 }}>Tus planes y plantillas</p>
      </div>
      <div className="si" style={{ animationDelay:'0.05s' }}>
        <div className="section-hd"><span className="t-label">Programas</span><span style={{ fontSize:12,color:'var(--text3)' }}>{programs.length}</span></div>
        <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
          {programs.map((p,i)=>(
            <div key={p.id} className="si" style={{ animationDelay:`${0.05+i*0.04}s` }}><ProgramCard program={p}/></div>
          ))}
        </div>
      </div>
      <div className="si" style={{ animationDelay:'0.10s' }}>
        <div className="section-hd">
          <span className="t-label">Templates</span>
          <button onClick={()=>{setEditingTmpl(null);setEditorOpen(true)}} className="pressable" style={{ display:'flex',alignItems:'center',gap:5,padding:'6px 12px',borderRadius:8,background:'var(--accent)',border:'none',color:'white',fontSize:12,fontWeight:600,cursor:'pointer' }}>
            <Plus size={13}/>Nuevo
          </button>
        </div>
        <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
          {templates.map((t,i)=>(
            <div key={t.id} className="si" style={{ animationDelay:`${0.10+i*0.03}s` }}>
              <TemplateCard template={t} onEdit={t=>{setEditingTmpl(t);setEditorOpen(true)}} onStart={()=>startWorkout({templateId:t.id,programId:null,name:t.name})}/>
            </div>
          ))}
        </div>
      </div>
      <TemplateEditor open={editorOpen} onClose={()=>setEditorOpen(false)} template={editingTmpl}/>
    </div>
  )
}
