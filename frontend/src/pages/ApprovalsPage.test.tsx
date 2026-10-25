import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { createSeedState } from '../data/seed'
import { PlatformProvider } from '../hooks/usePlatform'
import { MockPlatformService } from '../services/mockPlatform'
import { ApprovalsPage } from './ApprovalsPage'

afterEach(() => { cleanup(); localStorage.clear() })

describe('Centro de aprobaciones', () => {
  it('solicita un motivo, confirma y continúa la acción aprobada', async () => {
    const user = userEvent.setup()
    const service = new MockPlatformService(createSeedState(), 5)
    render(<PlatformProvider service={service}><MemoryRouter initialEntries={['/aprobaciones']}><Routes><Route path="/aprobaciones" element={<ApprovalsPage />} /><Route path="/ejecuciones/:executionId" element={<p>Detalle de ejecución de demostración</p>} /></Routes></MemoryRouter></PlatformProvider>)

    await user.click(screen.getByRole('button', { name: /Preparar borrador de seguimiento/ }))
    const approve = screen.getByRole('button', { name: /Aprobar y continuar/ })
    expect(approve).toBeDisabled()
    await user.type(screen.getByLabelText(/Motivo de la decisión/), 'Validé el caso sintético y autorizo la prueba.')
    await user.click(approve)
    await user.click(screen.getByRole('button', { name: /Confirmar aprobación/ }))

    expect(await screen.findByText('Detalle de ejecución de demostración')).toBeInTheDocument()
    await waitFor(() => expect(service.getSnapshot().executions.find((run) => run.id === 'ex-2084')?.status).toBe('COMPLETED'))
    expect(service.getSnapshot().executions.find((run) => run.id === 'ex-2084')?.sideEffectCount).toBe(1)
  })

  it('permite rechazar únicamente tras confirmación y no ejecutar la acción', async () => {
    const user = userEvent.setup()
    const service = new MockPlatformService(createSeedState(), 5)
    render(<PlatformProvider service={service}><MemoryRouter initialEntries={['/aprobaciones']}><ApprovalsPage /></MemoryRouter></PlatformProvider>)
    await user.click(screen.getByRole('button', { name: /Preparar borrador de seguimiento/ }))
    await user.type(screen.getByLabelText(/Motivo de la decisión/), 'Falta una comprobación manual.')
    await user.click(screen.getByRole('button', { name: /Rechazar/ }))
    await user.click(screen.getByRole('button', { name: /Confirmar rechazo/ }))
    const run = service.getSnapshot().executions.find((item) => item.id === 'ex-2084')
    expect(run?.outcome).toBe('HUMAN_REJECTED')
    expect(run?.sideEffectCount).toBe(0)
    expect(screen.getByText(/Rechazada por Elena García/)).toBeInTheDocument()
  })
})
