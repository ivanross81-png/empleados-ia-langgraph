import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { App } from './App'
import { PlatformProvider } from '../hooks/usePlatform'
import { createSeedState } from '../data/seed'
import { MockPlatformService } from '../services/mockPlatform'
import { CURRENT_STORAGE_KEY, type StoragePort } from '../services/persistence'

class TestStorage implements StoragePort {
  private values = new Map<string, string>()
  getItem(key: string) { return this.values.get(key) ?? null }
  setItem(key: string, value: string) { this.values.set(key, value) }
}

afterEach(() => {
  cleanup()
  localStorage.clear()
  window.history.pushState({}, '', '/')
})

describe('Navegación de la consola', () => {
  it('recorre catálogo y ejecuciones desde la navegación lateral', async () => {
    const user = userEvent.setup()
    const service = new MockPlatformService(createSeedState(), 5)
    render(<PlatformProvider service={service}><App /></PlatformProvider>)

    await user.click(screen.getByRole('link', { name: 'Empleados digitales' }))
    expect(await screen.findByRole('heading', { name: 'Empleados digitales' })).toBeInTheDocument()
    expect(screen.getByText('Sofía')).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Ejecuciones' }))
    expect(await screen.findByRole('heading', { name: 'Ejecuciones' })).toBeInTheDocument()
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByLabelText('Buscar ejecuciones')).toBeInTheDocument()
  })

  it('inicia desde el dashboard y completa una ejecución ALLOW simulada', async () => {
    const user = userEvent.setup()
    const service = new MockPlatformService(createSeedState(), 5)
    render(<PlatformProvider service={service}><App /></PlatformProvider>)

    await user.click(screen.getByRole('button', { name: 'Iniciar ejecución' }))
    await user.click(screen.getByRole('radio', { name: /Revisar lote de facturas abierto/ }))
    await user.click(screen.getByRole('button', { name: /Iniciar simulación/ }))

    expect(await screen.findByRole('heading', { name: 'Revisar facturas vencidas' })).toBeInTheDocument()
    await waitFor(() => expect(service.getSnapshot().executions[0]?.status).toBe('COMPLETED'))
    expect(service.getSnapshot().executions[0]?.outcome).toBe('SUCCESS')
    expect(service.getSnapshot().executions[0]?.sideEffectCount).toBe(1)
    expect(screen.getByText('Resultado final')).toBeInTheDocument()
  })

  it('solo ofrece empleados con un flujo completo en el alta de ejecución', async () => {
    const user = userEvent.setup()
    const service = new MockPlatformService(createSeedState(), 5)
    render(<PlatformProvider service={service}><App /></PlatformProvider>)

    await user.click(screen.getByRole('button', { name: 'Iniciar ejecución' }))
    const employeeSelect = screen.getByLabelText('Empleado Digital')
    expect(within(employeeSelect).getAllByRole('option')).toHaveLength(1)
    expect(within(employeeSelect).queryByRole('option', { name: /Mateo/ })).not.toBeInTheDocument()
    expect(screen.getByText(/Solo Cobranzas tiene un flujo completo/i)).toBeInTheDocument()
  })

  it('mantiene deshabilitada la ejecución en un perfil de catálogo', async () => {
    window.history.pushState({}, '', '/empleados/finanzas')
    const service = new MockPlatformService(createSeedState(), 5)
    render(<PlatformProvider service={service}><App /></PlatformProvider>)

    expect(await screen.findByText(/Perfil de catálogo, sin ejecución habilitada/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Iniciar simulación/ })).toBeDisabled()
    expect(screen.getAllByText('Solo referencia').length).toBeGreaterThan(0)
  })

  it('explica cuando los datos locales inválidos se restablecieron', async () => {
    const user = userEvent.setup()
    const storage = new TestStorage()
    storage.setItem(CURRENT_STORAGE_KEY, '{ corrupto')
    const service = new MockPlatformService(undefined, 5, storage)
    render(<PlatformProvider service={service}><App /></PlatformProvider>)

    expect(await screen.findByRole('status')).toHaveTextContent(/datos locales estaban dañados/i)
    await user.click(screen.getByRole('button', { name: 'Cerrar aviso de recuperación' }))
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
