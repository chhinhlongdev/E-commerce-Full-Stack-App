import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartProvider, useCart } from '../cart-context';
import { Product } from '../types';

const mockProduct: Product = {
  _id: 'prod1', name: 'Test Product', description: 'Desc',
  price: 10, stock: 5, image: '', images: [], category: 'test',
};

const mockProduct2: Product = {
  _id: 'prod2', name: 'Another Product', description: '',
  price: 20, stock: 3, image: '', images: [], category: 'test',
};

function CartDisplay() {
  const { items, addItem, removeItem, updateQty, clearCart, total, count } = useCart();
  return (
    <div>
      <p data-testid="count">{count}</p>
      <p data-testid="total">{total}</p>
      <p data-testid="items">{JSON.stringify(items.map(i => ({ id: i.product._id, qty: i.quantity })))}</p>
      <button onClick={() => addItem(mockProduct)}>add1</button>
      <button onClick={() => addItem(mockProduct2, 2)}>add2</button>
      <button onClick={() => removeItem('prod1')}>remove1</button>
      <button onClick={() => updateQty('prod1', 3)}>setQty3</button>
      <button onClick={() => clearCart()}>clear</button>
    </div>
  );
}

function renderCart() {
  return render(<CartProvider><CartDisplay /></CartProvider>);
}

describe('CartContext', () => {
  beforeEach(() => localStorage.clear());

  it('starts empty', () => {
    renderCart();
    expect(screen.getByTestId('count').textContent).toBe('0');
    expect(screen.getByTestId('total').textContent).toBe('0');
  });

  it('adds item and updates count + total', async () => {
    renderCart();
    await userEvent.click(screen.getByText('add1'));
    expect(screen.getByTestId('count').textContent).toBe('1');
    expect(screen.getByTestId('total').textContent).toBe('10');
  });

  it('increments quantity when adding same product', async () => {
    renderCart();
    await userEvent.click(screen.getByText('add1'));
    await userEvent.click(screen.getByText('add1'));
    expect(screen.getByTestId('count').textContent).toBe('2');
    expect(screen.getByTestId('total').textContent).toBe('20');
  });

  it('caps quantity at product stock', async () => {
    renderCart();
    // Click add1 six times — stock is 5
    for (let i = 0; i < 6; i++) await userEvent.click(screen.getByText('add1'));
    expect(screen.getByTestId('count').textContent).toBe('5');
  });

  it('adds multiple products', async () => {
    renderCart();
    await userEvent.click(screen.getByText('add1'));
    await userEvent.click(screen.getByText('add2'));
    expect(screen.getByTestId('count').textContent).toBe('3'); // 1 + 2
    expect(screen.getByTestId('total').textContent).toBe('50'); // 10 + 40
  });

  it('removes item from cart', async () => {
    renderCart();
    await userEvent.click(screen.getByText('add1'));
    await userEvent.click(screen.getByText('remove1'));
    expect(screen.getByTestId('count').textContent).toBe('0');
  });

  it('updates quantity', async () => {
    renderCart();
    await userEvent.click(screen.getByText('add1'));
    await userEvent.click(screen.getByText('setQty3'));
    expect(screen.getByTestId('count').textContent).toBe('3');
    expect(screen.getByTestId('total').textContent).toBe('30');
  });

  it('clears all items', async () => {
    renderCart();
    await userEvent.click(screen.getByText('add1'));
    await userEvent.click(screen.getByText('add2'));
    await userEvent.click(screen.getByText('clear'));
    expect(screen.getByTestId('count').textContent).toBe('0');
    expect(screen.getByTestId('total').textContent).toBe('0');
  });

  it('persists cart to localStorage', async () => {
    renderCart();
    await userEvent.click(screen.getByText('add1'));
    const saved = JSON.parse(localStorage.getItem('cart') || '[]');
    expect(saved.length).toBe(1);
    expect(saved[0].product._id).toBe('prod1');
  });
});
