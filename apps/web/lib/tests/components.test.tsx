import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ── Mock contexts used by Navbar ───────────────────────
vi.mock('../auth-context', () => ({
  useAuth: vi.fn(),
}));
vi.mock('../cart-context', () => ({
  useCart: vi.fn(),
}));

import { useAuth } from '../auth-context';
import { useCart } from '../cart-context';
import Navbar from '../../components/Navbar';

describe('Navbar — logged out', () => {
  it('shows Login and Register links', () => {
    (useAuth as any).mockReturnValue({ user: null, logout: vi.fn() });
    (useCart as any).mockReturnValue({ count: 0 });
    render(<Navbar />);
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
  });

  it('does not show Logout button', () => {
    (useAuth as any).mockReturnValue({ user: null, logout: vi.fn() });
    (useCart as any).mockReturnValue({ count: 0 });
    render(<Navbar />);
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
  });
});

describe('Navbar — logged in as user', () => {
  it('shows Logout button', () => {
    (useAuth as any).mockReturnValue({ user: { name: 'Dara', role: 'user' }, logout: vi.fn() });
    (useCart as any).mockReturnValue({ count: 2 });
    render(<Navbar />);
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('shows cart count badge', () => {
    (useAuth as any).mockReturnValue({ user: { name: 'Dara', role: 'user' }, logout: vi.fn() });
    (useCart as any).mockReturnValue({ count: 3 });
    render(<Navbar />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('does not show Admin link for normal user', () => {
    (useAuth as any).mockReturnValue({ user: { name: 'Dara', role: 'user' }, logout: vi.fn() });
    (useCart as any).mockReturnValue({ count: 0 });
    render(<Navbar />);
    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
  });

  it('calls logout when Logout clicked', async () => {
    const logout = vi.fn();
    (useAuth as any).mockReturnValue({ user: { name: 'Dara', role: 'user' }, logout });
    (useCart as any).mockReturnValue({ count: 0 });
    render(<Navbar />);
    await userEvent.click(screen.getByText('Logout'));
    expect(logout).toHaveBeenCalled();
  });
});

describe('Navbar — logged in as admin', () => {
  it('shows Admin link pointing to /admin', () => {
    // Use a different name so "Admin" text only comes from the nav link
    (useAuth as any).mockReturnValue({ user: { name: 'John', role: 'admin' }, logout: vi.fn() });
    (useCart as any).mockReturnValue({ count: 0 });
    render(<Navbar />);
    const adminLinks = screen.getAllByRole('link').filter(
      (el) => el.getAttribute('href') === '/admin'
    );
    expect(adminLinks.length).toBeGreaterThan(0);
    expect(adminLinks[0]).toHaveAttribute('href', '/admin');
  });
});
