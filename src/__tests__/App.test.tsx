import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from '../App';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock ResizeObserver
class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
window.ResizeObserver = ResizeObserverMock;

describe('App Component', () => {
  it('renders the main quadrant axis', async () => {
    render(<App />);
    
    // Wait for the app to load
    await waitFor(() => {
      expect(screen.getByText(/四象限事务管理/i)).toBeInTheDocument();
    });
    
    // Check if the quadrant axis is rendered
    expect(screen.getByText('重要 · 不紧急')).toBeInTheDocument();
    expect(screen.getByText('重要 · 紧急')).toBeInTheDocument();
    expect(screen.getByText('不重要 · 不紧急')).toBeInTheDocument();
    expect(screen.getByText('不重要 · 紧急')).toBeInTheDocument();
  });

  it('shows the add button at center', async () => {
    render(<App />);
    
    await waitFor(() => {
      const addButton = screen.getByRole('button', { name: '' }); // The plus button
      expect(addButton).toBeInTheDocument();
    });
  });

  it('allows font switching', async () => {
    render(<App />);
    
    // Find and click the font switcher
    const fontButton = screen.getByTitle('行草');
    expect(fontButton).toBeInTheDocument();
    
    fireEvent.click(fontButton);
    
    // Should have font classes applied
    expect(document.body).toHaveClass('font-chinese');
  });
});