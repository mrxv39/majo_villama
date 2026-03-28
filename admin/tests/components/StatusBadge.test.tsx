import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusBadge from '@/app/components/StatusBadge';

describe('StatusBadge', () => {
  it('renders with correct label', () => {
    render(<StatusBadge status="activa" />);
    expect(screen.getByText('Activa')).toBeInTheDocument();
  });

  it('capitalizes the first letter', () => {
    render(<StatusBadge status="pendiente" />);
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
  });

  it('applies green colors for active states', () => {
    const { container } = render(<StatusBadge status="activa" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('bg-green-100');
    expect(badge.className).toContain('text-green-700');
  });

  it('applies orange colors for pendiente', () => {
    const { container } = render(<StatusBadge status="pendiente" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('bg-orange-100');
  });

  it('applies red colors for cancelada', () => {
    const { container } = render(<StatusBadge status="cancelada" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('bg-red-100');
  });

  it('applies yellow colors for pausada', () => {
    const { container } = render(<StatusBadge status="pausada" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('bg-yellow-100');
  });

  it('applies gray colors for unknown status', () => {
    const { container } = render(<StatusBadge status="otro" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('bg-gray-100');
  });

  it('applies additional className', () => {
    const { container } = render(<StatusBadge status="activa" className="ml-2" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('ml-2');
  });
});
