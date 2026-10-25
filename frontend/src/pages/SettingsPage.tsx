import { useState } from 'react'
import { Building2, Check, ChevronRight, CircleHelp, FlaskConical, KeyRound, LockKeyhole, Settings2, ShieldCheck, UsersRound, WandSparkles } from 'lucide-react'
import { Button, PageHeader } from '../components/primitives'

const sections = [
  { id: 'organizacion', title: 'Organización', description: 'Nombre, identidad y datos del espacio de trabajo.', icon: Building2, status: 'DEMO' },
  { id: 'usuarios', title: 'Usuarios y equipos', description: 'Miembros, grupos y estado de acceso.', icon: UsersRound, status: 'FUTURA' },
  { id: 'roles', title: 'Roles y permisos', description: 'Permisos asignados y responsabilidades.', icon: KeyRound, status: 'FUTURA' },
  { id: 'politicas', title: 'Políticas', description: 'Reglas de decisión deterministas y versiones.', icon: ShieldCheck, status: 'DEMO' },
  { id: 'modelos', title: 'Modelos', description: 'Proveedores, perfiles y límites de uso.', icon: WandSparkles, status: 'FUTURA' },
]

export function SettingsPage() {
  const [selected, setSelected] = useState('organizacion')
  const active = sections.find((section) => section.id === selected) ?? sections[0]!
  const Icon = active.icon
  return <>
    <PageHeader eyebrow="ADMINISTRACIÓN DE PLATAFORMA" title="Configuración" description="Un espacio para administrar la organización, el acceso, las políticas y los modelos." action={<span className="future-pill"><LockKeyhole size={13} /> Solo lectura en el prototipo</span>} />
    <div className="settings-shell"><nav className="settings-nav" aria-label="Secciones de configuración">{sections.map((section) => { const ItemIcon = section.icon; return <button key={section.id} className={selected === section.id ? 'settings-nav-active' : ''} onClick={() => setSelected(section.id)}><ItemIcon size={16} /><span><strong>{section.title}</strong><small>{section.description}</small></span>{section.status === 'DEMO' ? <span className="settings-demo-dot" /> : <LockKeyhole size={13} className="settings-lock" />}</button> })}</nav><section className="settings-content"><div className="settings-content-head"><div className={`settings-large-icon settings-icon-${selected}`}><Icon size={19} /></div><div><div className="eyebrow">{active.status === 'DEMO' ? 'SECCIÓN DEMOSTRATIVA' : 'CAPACIDAD FUTURA'}</div><h2>{active.title}</h2><p>{active.description}</p></div></div>{active.id === 'organizacion' ? <OrganizationSettings /> : active.id === 'politicas' ? <PolicySettings /> : <FutureSettings title={active.title} />}</section></div>
    <div className="settings-disclaimer"><CircleHelp size={15} /><span>Esta consola no configura servicios reales, cuentas, identidades ni proveedores de modelos. Los cambios de configuración están desactivados.</span></div>
  </>
}

function OrganizationSettings() {
  return <div className="settings-form"><div className="settings-field"><label htmlFor="org-name">Nombre de la organización</label><input id="org-name" defaultValue="Northstar Studio" readOnly /><small>Nombre ficticio para la demostración.</small></div><div className="settings-field"><label htmlFor="org-domain">Dominio de inicio de sesión</label><input id="org-domain" defaultValue="northstar.example" readOnly /><small>No se realiza verificación de dominio.</small></div><div className="settings-field"><label>Modo de datos</label><div className="settings-readonly-value"><FlaskConical size={15} /> Datos sintéticos locales</div></div><div className="settings-field"><label>Modelo de despliegue de referencia</label><div className="settings-readonly-value"><Building2 size={15} /> Instalación dedicada por cliente</div></div><div className="settings-form-foot"><span><Check size={14} /> Configuración de muestra · solo lectura</span><Button disabled>Guardar cambios</Button></div></div>
}

function PolicySettings() {
  return <div className="policy-settings"><div className="policy-settings-intro"><ShieldCheck size={16} /><span><strong>Las políticas son controles deterministas.</strong> La salida del modelo nunca sustituye una decisión de autorización.</span></div>{[{ code: 'ALLOW', title: 'Permitir acción acotada', description: 'Actualizaciones internas de bajo riesgo sobre registros sintéticos.', color: 'allow' }, { code: 'DENY', title: 'Denegar caso no elegible', description: 'Casos cerrados, no elegibles o perfiles sin flujo ejecutable.', color: 'deny' }, { code: 'REQUIRE_APPROVAL', title: 'Requerir aprobación humana', description: 'Seguimientos que necesitan decisión explícita de una persona autorizada.', color: 'approval' }].map((rule) => <div className="policy-rule" key={rule.code}><span className={`policy-rule-mark rule-${rule.color}`}><ShieldCheck size={15} /></span><div><strong>{rule.title}</strong><small>{rule.description}</small></div><code>{rule.code}</code><span className="rule-version">v4</span></div>)}<div className="policy-settings-foot"><span>Conjunto de reglas sintético · no es OPA</span><span>pol-cobranza-v4</span></div></div>
}

function FutureSettings({ title }: { title: string }) {
  return <div className="settings-future"><div className="future-illustration"><Settings2 size={25} /><span><LockKeyhole size={16} /></span></div><span className="future-pill"><LockKeyhole size={13} /> Funcionalidad futura</span><h3>{title} se habilitará en una versión posterior</h3><p>Esta sección anticipa la estructura de configuración de la plataforma. No guarda cambios ni afecta permisos reales.</p><button className="future-link" disabled>Ver documentación futura <ChevronRight size={14} /></button></div>
}
