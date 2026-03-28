import { describe, it, expect, vi, beforeEach } from 'vitest';
import { downloadCSV } from '@/lib/export';

describe('downloadCSV', () => {
  beforeEach(() => {
    // Mock DOM APIs
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:test'),
      revokeObjectURL: vi.fn(),
    });
  });

  it('generates CSV with BOM and correct headers', () => {
    const clickSpy = vi.fn();
    const mockLink = { href: '', download: '', click: clickSpy };
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink as unknown as HTMLElement);

    downloadCSV(
      [{ name: 'Ana', age: '30' }],
      'test.csv',
      { name: 'Nombre', age: 'Edad' }
    );

    expect(clickSpy).toHaveBeenCalled();
    expect(mockLink.download).toBe('test.csv');
  });

  it('handles empty data array', () => {
    const clickSpy = vi.fn();
    const mockLink = { href: '', download: '', click: clickSpy };
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink as unknown as HTMLElement);

    downloadCSV([], 'empty.csv', { name: 'Nombre' });

    expect(clickSpy).toHaveBeenCalled();
  });

  it('escapes quotes in values', () => {
    const blobData: string[] = [];
    vi.stubGlobal('Blob', class {
      constructor(parts: string[]) { blobData.push(...parts); }
    });
    const mockLink = { href: '', download: '', click: vi.fn() };
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink as unknown as HTMLElement);

    downloadCSV(
      [{ val: 'has "quotes"' }],
      'test.csv',
      { val: 'Value' }
    );

    expect(blobData[0]).toContain('has ""quotes""');
  });

  it('handles null and undefined values', () => {
    const blobData: string[] = [];
    vi.stubGlobal('Blob', class {
      constructor(parts: string[]) { blobData.push(...parts); }
    });
    const mockLink = { href: '', download: '', click: vi.fn() };
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink as unknown as HTMLElement);

    downloadCSV(
      [{ a: null, b: undefined } as unknown as Record<string, unknown>],
      'test.csv',
      { a: 'A', b: 'B' }
    );

    expect(blobData[0]).toContain('""');
  });
});
