import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Activity, ArrowUpRight, Bell, Bot, BriefcaseBusiness, CheckCheck, CircleHelp, Command, Gauge, Layers3, Menu, Moon, PlugZap, Search, Settings2, Sun, X } from 'lucide-react'
import { usePlatformService, usePlatformState } from '../hooks/usePlatform'
import { Button } from './primitives'

const navGroups = [
  { label: 'OPERACIÓN', links: [
    { to: '/', label: 'Resumen', icon: Gauge, end: true },
    { to: '/empleados', label: 'Empleados digitales', icon: Bot },
    { to: '/ejecuciones', label: 'Ejecuciones', icon: Activity },
    { to: '/aprobaciones', label: 'Aprobaciones', icon: CheckCheck, approvals: true },
  ] },
  { label: 'PLATAFORMA', links: [
    { to: '/integraciones', label: 'Integraciones', icon: PlugZap },
    { to: '/configuracion', label: 'Configuración', icon: Settings2 },
  ] },
]

const titles: Record<string, string> = { '/': 'Resumen', '/empleados': 'Empleados digitales', '/ejecuciones': 'Ejecuciones', '/aprobaciones': 'Aprobaciones', '/integraciones': 'Integraciones', '/configuracion': 'Configuración' }

function readSavedTheme(): boolean {
  try { return localStorage.getItem('dep-theme') === 'dark' } catch { return false }
}

export function AppShell() {
  const state = usePlatformState()
  const platform = usePlatformService()
  const location = useLocation()
  const navigate = useNavigate()
  const [dark, setDark] = useState(readSavedTheme)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const pendingCount = state.approvals.filter((approval) => approval.status === 'PENDING').length
  const selectedTitle = location.pathname.startsWith('/empleados/') ? 'Perfil del empleado' : location.pathname.startsWith('/ejecuciones/') ? 'Detalle de ejecución' : titles[location.pathname] ?? 'Plataforma'

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    try { localStorage.setItem('dep-theme', dark ? 'dark' : 'light') } catch { /* Theme preference is session-local when browser storage is unavailable. */ }
  }, [dark])

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        navigate('/ejecuciones?focusSearch=1')
      }
    }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [navigate])

  return <div className="app-shell">
    {mobileOpen && <button className="mobile-scrim" aria-label="Cerrar menú" onClick={() => setMobileOpen(false)} />}
    <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
      <div className="brand-row"><div className="brand-mark"><Layers3 size={19} strokeWidth={2.4} /></div><div className="brand-copy"><strong>digital<span>.</span>employee</strong><small>PLATFORM CONSOLE</small></div><button className="mobile-close icon-button" aria-label="Cerrar menú" onClick={() => setMobileOpen(false)}><X size={18} /></button></div>
      <div className="workspace-switch" aria-label="Espacio de trabajo de demostración"><span className="workspace-avatar">N</span><span className="workspace-text"><strong>Northstar Studio</strong><small>Espacio de trabajo</small></span></div>
      <div className="sidebar-nav">
        {navGroups.map((group) => <div className="nav-group" key={group.label}><div className="nav-label">{group.label}</div>{group.links.map(({ to, label, icon: Icon, end, approvals }) => <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`} onClick={() => setMobileOpen(false)}><Icon size={17} strokeWidth={1.9} /><span>{label}</span>{approvals && pendingCount > 0 && <span className="nav-count">{pendingCount}</span>}</NavLink>)}</div>)}
      </div>
      <div className="sidebar-bottom"><div className="plan-card"><div className="plan-icon"><BriefcaseBusiness size={15} /></div><div><strong>Entorno de demostración</strong><p>Datos sintéticos · sin conexiones</p></div><span className="demo-pulse" /></div><button className="nav-link help-link" onClick={() => setShowHelp(true)}><CircleHelp size={17} /><span>Centro de ayuda</span><ArrowUpRight size={14} className="help-arrow" /></button><div className="user-row"><div className="user-avatar">EG</div><div className="user-meta"><strong>Elena García</strong><small>Operaciones · Aprobadora</small></div></div></div>
    </aside>
    <main className="main-area">
      <header className="topbar"><div className="topbar-left"><button className="mobile-menu icon-button" aria-label="Abrir menú" onClick={() => setMobileOpen(true)}><Menu size={19} /></button><div className="breadcrumb"><span>Northstar Studio</span><span className="breadcrumb-slash">/</span><strong>{selectedTitle}</strong></div></div><div className="topbar-actions"><button className="search-trigger" onClick={() => navigate('/ejecuciones?focusSearch=1')}><Search size={15} /><span>Buscar ejecuciones</span><kbd><Command size={11} /> K</kbd></button><button className="icon-button theme-toggle" title={dark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'} aria-label={dark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'} onClick={() => setDark((value) => !value)}>{dark ? <Sun size={17} /> : <Moon size={17} />}</button><button className="icon-button notification-button" aria-label={`${pendingCount} aprobaciones pendientes`} onClick={() => navigate('/aprobaciones')}><Bell size={17} />{pendingCount > 0 && <i />}</button><span className="topbar-divider" /><button className="help-top" onClick={() => setShowHelp(true)}>Ayuda <ArrowUpRight size={13} /></button></div></header>
      <div className="page-container">{state.recoveryNotice && <div className="recovery-notice" role="status"><CircleHelp size={16} /><span>{state.recoveryNotice}</span><button className="icon-button" aria-label="Cerrar aviso de recuperación" onClick={() => platform.dismissRecoveryNotice()}><X size={15} /></button></div>}<Outlet /></div>
      <footer className="app-footer"><span>Digital Employee Platform <span className="footer-dot">·</span> Prototipo interactivo</span><span>v0.1.0 <span className="footer-dot">·</span> Solo datos sintéticos</span></footer>
    </main>
    {showHelp && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowHelp(false) }}><section className="modal help-modal" role="dialog" aria-modal="true" aria-labelledby="help-title"><button className="modal-close icon-button" aria-label="Cerrar" onClick={() => setShowHelp(false)}><X size={17} /></button><div className="modal-mark"><CircleHelp size={20} /></div><h2 id="help-title">Acerca de esta consola</h2><p>Este prototipo usa datos sintéticos y un servicio local del navegador. No conecta con Temporal, LangGraph, OPA, MCP ni sistemas empresariales.</p><div className="help-note"><strong>¿Necesitas orientación?</strong><span>Recorre una ejecución de demostración o abre el Centro de aprobaciones para probar una decisión humana.</span></div><Button variant="primary" onClick={() => setShowHelp(false)}>Entendido</Button></section></div>}
  </div>
}
