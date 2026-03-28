import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchFilter from '@/app/components/SearchFilter';

describe('SearchFilter', () => {
  it('renders search input', () => {
    render(
      <SearchFilter
        search=""
        onSearchChange={() => {}}
        searchPlaceholder="Buscar..."
      />
    );
    expect(screen.getByPlaceholderText('Buscar...')).toBeInTheDocument();
  });

  it('calls onSearchChange when typing', () => {
    const onChange = vi.fn();
    render(
      <SearchFilter search="" onSearchChange={onChange} searchPlaceholder="Buscar..." />
    );
    fireEvent.change(screen.getByPlaceholderText('Buscar...'), {
      target: { value: 'test' },
    });
    expect(onChange).toHaveBeenCalledWith('test');
  });

  it('renders filter dropdowns', () => {
    render(
      <SearchFilter
        filters={[
          {
            value: 'all',
            onChange: () => {},
            options: [
              { value: 'all', label: 'Todos' },
              { value: 'active', label: 'Activos' },
            ],
          },
        ]}
      />
    );
    expect(screen.getByText('Todos')).toBeInTheDocument();
    expect(screen.getByText('Activos')).toBeInTheDocument();
  });

  it('calls filter onChange when selecting', () => {
    const onChange = vi.fn();
    render(
      <SearchFilter
        filters={[
          {
            value: 'all',
            onChange,
            options: [
              { value: 'all', label: 'Todos' },
              { value: 'active', label: 'Activos' },
            ],
          },
        ]}
      />
    );
    fireEvent.change(screen.getByDisplayValue('Todos'), {
      target: { value: 'active' },
    });
    expect(onChange).toHaveBeenCalledWith('active');
  });

  it('does not render search input when onSearchChange is undefined', () => {
    const { container } = render(<SearchFilter filters={[]} />);
    expect(container.querySelector('input[type="text"]')).toBeNull();
  });
});
