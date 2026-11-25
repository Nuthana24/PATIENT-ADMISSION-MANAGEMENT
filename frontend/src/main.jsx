import React, { useEffect, useMemo, useState } from 'react'

import { createRoot } from 'react-dom/client'

import { Activity, BedDouble, CalendarDays, Check, ChevronDown, ClipboardList, Clock3, Download, Filter, LayoutDashboard, Plus, Search, SlidersHorizontal, Stethoscope, Trash2, Users, X, Pencil, LogOut, Menu, MoreHorizontal, ArrowUpRight } from 'lucide-react'

import './style.css'



const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const emptyForm = { name:'', age:'', gender:'', ward:'', department:'', doctor:'', admission_date:new Date().toISOString().slice(0,10), status:'Admitted' }

const prettyDate = d => new Date(`${d}T00:00:00`).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})



function App(){

  const [patients,setPatients]=useState([]), [options,setOptions]=useState({genders:[],wards:[],departments:[],doctors:[]})

  const [search,setSearch]=useState(''), [filters,setFilters]=useState({ward:'',department:'',doctor:''})

  const [modal,setModal]=useState(false), [editing,setEditing]=useState(null), [form,setForm]=useState(emptyForm), [errors,setErrors]=useState({})

  const [loading,setLoading]=useState(true), [error,setError]=useState(''), [notice,setNotice]=useState(''), [mobileNav,setMobileNav]=useState(false)

  const [activeTab,setActiveTab]=useState('All patients')
  const [detailsType,setDetailsType]=useState('')



  async function request(path,opts={}){ const res=await fetch(`${API}${path}`,{headers:{'Content-Type':'application/json',...(opts.headers||{})},...opts}); const data=await res.json().catch(()=>({})); if(!res.ok){let msg=data.detail; if(Array.isArray(msg)) msg=msg.map(x=>x.msg).join(', '); throw new Error(msg||'Something went wrong.');} return data }

  async function load(){ try{setError(''); const [p,o]=await Promise.all([request('/patients'),request('/options')]);setPatients(p);setOptions(o)}catch(e){setError(`Could not connect to the backend. ${e.message} — make sure FastAPI is running on port 8000.`)}finally{setLoading(false)} }

  useEffect(()=>{load()},[])

  useEffect(()=>{if(!notice)return;const t=setTimeout(()=>setNotice(''),3000);return()=>clearTimeout(t)},[notice])



  const visible=useMemo(()=>patients.filter(p=>p.name.toLowerCase().includes(search.toLowerCase())&&(!filters.ward||p.ward===filters.ward)&&(!filters.department||p.department===filters.department)&&(!filters.doctor||p.doctor===filters.doctor)&&(activeTab==='All patients'||p.status===activeTab)),[patients,search,filters,activeTab])

  const admitted=patients.filter(p=>p.status==='Admitted').length, discharged=patients.filter(p=>p.status==='Discharged').length

  function openAdd(){setEditing(null);setForm(emptyForm);setErrors({});setModal(true)}

  function openEdit(p){setEditing(p);setForm({...p,age:String(p.age)});setErrors({});setModal(true)}

  function validate(){const e={};if(!form.name.trim())e.name='Name is required';else if(!/^[A-Za-z ]+$/.test(form.name.trim()))e.name='Use letters and spaces only';if(form.age==='')e.age='Age is required';else if(!/^\d+$/.test(String(form.age))||Number(form.age)<0||Number(form.age)>120)e.age='Age must be between 0 and 120';['gender','ward','department','doctor'].forEach(k=>{if(!form[k])e[k]='Please select an option'});if(!form.admission_date)e.admission_date='Admission date is required';else if(form.admission_date>new Date().toISOString().slice(0,10))e.admission_date='Date cannot be in the future';setErrors(e);return Object.keys(e).length===0}

  async function save(e){e.preventDefault();if(!validate())return;try{const payload={...form,name:form.name.trim(),age:Number(form.age)};if(editing)await request(`/patients/${editing.id}`,{method:'PUT',body:JSON.stringify(payload)});else await request('/patients',{method:'POST',body:JSON.stringify(payload)});setModal(false);setNotice(editing?'Patient details updated':'Patient admitted successfully');await load()}catch(err){setErrors({server:err.message})}}

  async function discharge(p){if(!window.confirm(`Mark ${p.name} as discharged?`))return;try{await request(`/patients/${p.id}/discharge`,{method:'PATCH'});setNotice(`${p.name} marked as discharged`);load()}catch(e){setError(e.message)}}

  async function remove(p){if(!window.confirm(`Delete ${p.name}'s record? This action cannot be undone.`))return;try{await request(`/patients/${p.id}`,{method:'DELETE'});setNotice('Patient record deleted');load()}catch(e){setError(e.message)}}

  function exportCsv(){const rows=[['Name','Age','Gender','Ward','Department','Doctor','Admission Date','Status'],...visible.map(p=>[p.name,p.age,p.gender,p.ward,p.department,p.doctor,p.admission_date,p.status])];const csv=rows.map(r=>r.map(v=>`"${String(v??'').replaceAll('"','""')}"`).join(',')).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='patient-records.csv';a.click();URL.revokeObjectURL(a.href)}

  const field=(key,label,kind='text',choices=[])=> <label className="field"><span>{label}<b>*</b></span>{kind==='select'?<select value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}><option value="">Select {label.toLowerCase()}</option>{choices.map(v=><option key={v}>{v}</option>)}</select>:<input type={kind} value={form[key]} max={kind==='date'?new Date().toISOString().slice(0,10):undefined} min={kind==='number'?0:undefined} maxLength={kind==='text'?100:undefined} onChange={e=>setForm({...form,[key]:e.target.value})} placeholder={key==='name'?'Enter patient full name':key==='age'?'Enter age':''}/>}{errors[key]&&<small className="field-error">{errors[key]}</small>}</label>



  return <div className="app-shell">

    <aside className={`sidebar ${mobileNav?'show':''}`}><div className="brand"><div className="brand-mark"><Activity size={22}/></div><div><strong>Demo<span>.</span></strong><small>HOSPITAL MANAGEMENT</small></div><button className="close-nav" onClick={()=>setMobileNav(false)}><X/></button></div>

      <div className="nav-label">WORKSPACE</div><button className="nav-item active"><LayoutDashboard size={18}/> Overview</button><button className="nav-item"><Users size={18}/> Patients <span className="nav-count">{patients.length}</span></button><button className="nav-item"><CalendarDays size={18}/> Admissions</button><div className="nav-label second">MANAGEMENT</div><button className="nav-item" onClick={()=>setDetailsType('wards')}><BedDouble size={18}/> Wards <span className="nav-count">{options.wards.length}</span></button><button className="nav-item" onClick={()=>setDetailsType('departments')}><Stethoscope size={18}/> Departments <span className="nav-count">{options.departments.length}</span></button><div className="sidebar-bottom"><div className="profile"><div className="avatar">AD</div><div><strong>Hospital Admin</strong><small>Administrator</small></div><MoreHorizontal size={19}/></div></div>

    </aside>

    {mobileNav&&<div className="scrim" onClick={()=>setMobileNav(false)}/>}

    <main className="main"><header className="topbar"><button className="hamburger" onClick={()=>setMobileNav(true)}><Menu/></button><div className="breadcrumb">Workspace <span>/</span> <strong>Overview</strong></div><div className="top-right"><span className="today"><CalendarDays size={15}/>{new Date().toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</span><div className="top-avatar">AD</div></div></header>

      <div className="content"><div className="page-heading"><div><div className="eyebrow">HOSPITAL OVERVIEW</div><h1>Patient admissions</h1><p>Welcome back. Here's what's happening at your hospital today.</p></div><button className="primary-btn" onClick={openAdd}><Plus size={18}/> Admit patient</button></div>

      {error&&<div className="alert"><span>{error}</span><button onClick={()=>{setLoading(true);load()}}>Retry</button></div>}

      <section className="stats-grid"><div className="stat-card"><div className="stat-top"><span>Total patients</span><div className="stat-icon blue"><Users size={19}/></div></div><div className="stat-value">{patients.length.toString().padStart(2,'0')}</div><div className="stat-foot"><span className="dot blue-dot"/>All patient records</div></div><div className="stat-card"><div className="stat-top"><span>Currently admitted</span><div className="stat-icon green"><BedDouble size={19}/></div></div><div className="stat-value">{admitted.toString().padStart(2,'0')}</div><div className="stat-foot"><span className="dot green-dot"/>Active admissions</div></div><div className="stat-card"><div className="stat-top"><span>Discharged</span><div className="stat-icon purple"><LogOut size={19}/></div></div><div className="stat-value">{discharged.toString().padStart(2,'0')}</div><div className="stat-foot"><span className="dot purple-dot"/>Completed stays</div></div><div className="stat-card"><div className="stat-top"><span>Departments</span><div className="stat-icon orange"><Stethoscope size={19}/></div></div><div className="stat-value">{options.departments.length.toString().padStart(2,'0')}</div><div className="stat-foot"><span className="dot orange-dot"/>Available departments</div></div></section>

      <section className="management-section">
        <div className="management-heading"><div><div className="eyebrow">MANAGEMENT</div><h2>Hospital resources</h2><p>Overview of configured wards and departments.</p></div></div>
        <div className="management-grid">
          <div className="management-card"><div className="management-card-icon ward-management-icon"><BedDouble size={19}/></div><div className="management-card-copy"><span>Total wards</span><strong>{options.wards.length.toString().padStart(2,'0')}</strong><small>Available wards</small></div><button className="details-btn" onClick={()=>setDetailsType('wards')}>View details <ArrowUpRight size={14}/></button></div>
          <div className="management-card"><div className="management-card-icon department-management-icon"><Stethoscope size={19}/></div><div className="management-card-copy"><span>Total departments</span><strong>{options.departments.length.toString().padStart(2,'0')}</strong><small>Available departments</small></div><button className="details-btn" onClick={()=>setDetailsType('departments')}>View details <ArrowUpRight size={14}/></button></div>
        </div>
      </section>

      <section className="patients-panel"><div className="panel-heading"><div><h2>Patient directory</h2><p>View and manage all hospital patient records</p></div><button className="export-btn" onClick={exportCsv}><Download size={16}/> Export CSV</button></div>

        <div className="toolbar"><div className="tabs"><button className={activeTab==='All patients'?'selected':''} onClick={()=>setActiveTab('All patients')}>All patients <span>{patients.length}</span></button><button className={activeTab==='Admitted'?'selected':''} onClick={()=>setActiveTab('Admitted')}>Admitted <span>{admitted}</span></button><button className={activeTab==='Discharged'?'selected':''} onClick={()=>setActiveTab('Discharged')}>Discharged <span>{discharged}</span></button></div><div className="search-wrap"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search patient name..."/></div></div>

        <div className="filters"><div className="filter-title"><SlidersHorizontal size={15}/> Filters</div>{[['ward','All wards',options.wards],['department','All departments',options.departments],['doctor','All doctors',options.doctors]].map(([key,label,values])=><div className="filter-select" key={key}><select value={filters[key]} onChange={e=>setFilters({...filters,[key]:e.target.value})}><option value="">{label}</option>{values.map(v=><option key={v}>{v}</option>)}</select><ChevronDown size={14}/></div>)}{Object.values(filters).some(Boolean)&&<button className="clear-filter" onClick={()=>setFilters({ward:'',department:'',doctor:''})}>Clear all</button>}</div>

        <div className="table-wrap"><table><thead><tr><th>PATIENT</th><th>AGE / GENDER</th><th>WARD</th><th>DEPARTMENT</th><th>DOCTOR</th><th>ADMISSION DATE</th><th>STATUS</th><th></th></tr></thead><tbody>{loading?<tr><td colSpan="8" className="empty"><div className="spinner"/>Loading patient records...</td></tr>:visible.length===0?<tr><td colSpan="8" className="empty"><div className="empty-icon"><Users size={22}/></div><strong>No patients found</strong><span>{patients.length?'Try adjusting your search or filters.':'Admit your first patient to get started.'}</span>{!patients.length&&<button className="primary-btn small" onClick={openAdd}><Plus size={15}/> Admit patient</button>}</td></tr>:visible.map(p=><tr key={p.id}><td><div className="patient-cell"><div className={`patient-avatar avatar-${p.id%5}`}>{p.name.split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase()}</div><div><strong>{p.name}</strong><small>PT-{String(p.id).padStart(4,'0')}</small></div></div></td><td><strong className="age">{p.age} yrs</strong><small className="sub-cell">{p.gender}</small></td><td><span className="ward-tag">{p.ward}</span></td><td>{p.department}</td><td><span className="doctor-name">{p.doctor}</span></td><td><span className="date-cell"><CalendarDays size={14}/>{prettyDate(p.admission_date)}</span></td><td><span className={`status ${p.status.toLowerCase()}`}><i/>{p.status}</span></td><td><div className="row-actions"><button title="Edit patient" onClick={()=>openEdit(p)}><Pencil size={15}/></button>{p.status==='Admitted'&&<button title="Mark discharged" onClick={()=>discharge(p)}><Check size={16}/></button>}<button title="Delete patient" className="delete-action" onClick={()=>remove(p)}><Trash2 size={15}/></button></div></td></tr>)}</tbody></table></div>

        <div className="table-footer"><span>Showing <strong>{visible.length}</strong> of <strong>{patients.length}</strong> patients</span><span>Patient Management</span></div>

      </section></div>

    </main>

    {notice&&<div className="toast"><Check size={17}/>{notice}<button onClick={()=>setNotice('')}><X size={15}/></button></div>}

    {detailsType&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setDetailsType('')}}><div className="modal details-modal"><div className="modal-head"><div><div className="eyebrow">MANAGEMENT DETAILS</div><h2>All {detailsType}</h2><p>Read-only list of configured {detailsType}.</p></div><button className="icon-btn" onClick={()=>setDetailsType('')}><X/></button></div><div className="details-list">{(detailsType==='wards'?options.wards:options.departments).length===0?<div className="details-empty">No {detailsType} are currently available.</div>:(detailsType==='wards'?options.wards:options.departments).map((item,index)=><div className="details-list-item" key={`${item}-${index}`}><span className="details-number">{String(index+1).padStart(2,'0')}</span><strong>{item}</strong><span className="details-label">Available</span></div>)}</div><div className="details-footer"><span>{(detailsType==='wards'?options.wards:options.departments).length} total</span><button className="cancel-btn" onClick={()=>setDetailsType('')}>Close</button></div></div></div>}

    {modal&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setModal(false)}}><div className="modal"><div className="modal-head"><div><div className="eyebrow">PATIENT RECORD</div><h2>{editing?'Edit patient details':'Admit a new patient'}</h2><p>Enter the patient's information below.</p></div><button className="icon-btn" onClick={()=>setModal(false)}><X/></button></div><form onSubmit={save}><div className="form-grid">{field('name','Patient name')}{field('age','Age','number')}{field('gender','Gender','select',options.genders)}{field('ward','Ward','select',options.wards)}{field('department','Department','select',options.departments)}{field('doctor','Doctor','select',options.doctors)}{field('admission_date','Admission date','date')}<label className="field"><span>Status<b>*</b></span><select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option>Admitted</option><option>Discharged</option></select></label></div>{errors.server&&<div className="form-server-error">{errors.server}</div>}<div className="modal-actions"><button type="button" className="cancel-btn" onClick={()=>setModal(false)}>Cancel</button><button type="submit" className="primary-btn"><Check size={17}/>{editing?'Save changes':'Admit patient'}</button></div></form></div></div>}

  </div>

}



createRoot(document.getElementById('root')).render(<App/> )
