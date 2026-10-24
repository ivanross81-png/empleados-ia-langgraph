import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { ApprovalsPage } from '../pages/ApprovalsPage'
import { DashboardPage } from '../pages/DashboardPage'
import { EmployeeDetailPage, EmployeesPage } from '../pages/EmployeesPage'
import { ExecutionDetailPage, ExecutionsPage } from '../pages/ExecutionsPage'
import { IntegrationsPage } from '../pages/IntegrationsPage'
import { SettingsPage } from '../pages/SettingsPage'

export function App() {
  return <BrowserRouter><Routes><Route element={<AppShell />}><Route index element={<DashboardPage />} /><Route path="empleados" element={<EmployeesPage />} /><Route path="empleados/:employeeId" element={<EmployeeDetailPage />} /><Route path="ejecuciones" element={<ExecutionsPage />} /><Route path="ejecuciones/:executionId" element={<ExecutionDetailPage />} /><Route path="aprobaciones" element={<ApprovalsPage />} /><Route path="integraciones" element={<IntegrationsPage />} /><Route path="configuracion" element={<SettingsPage />} /><Route path="*" element={<DashboardPage />} /></Route></Routes></BrowserRouter>
}
