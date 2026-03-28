import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Modal from '@/app/components/Modal';

describe('Modal', () => {
  it('renders nothing when not open', () => {
    const { container } = render(
      <Modal open={false} onClose={() => {}} title="Test">
        Content
      </Modal>
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders when open', () => {
    render(
      <Modal open={true} onClose={() => {}} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('has correct ARIA attributes', () => {
    render(
      <Modal open={true} onClose={() => {}} title="Accessible Modal">
        Content
      </Modal>
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('calls onClose when Escape is pressed', () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose} title="Test">
        Content
      </Modal>
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('has close button with aria-label', () => {
    render(
      <Modal open={true} onClose={() => {}} title="Test">
        Content
      </Modal>
    );
    const closeBtn = screen.getByLabelText('Cerrar');
    expect(closeBtn).toBeInTheDocument();
  });

  it('renders footer when provided', () => {
    render(
      <Modal open={true} onClose={() => {}} title="Test" footer={<button>Save</button>}>
        Content
      </Modal>
    );
    expect(screen.getByText('Save')).toBeInTheDocument();
  });
});
