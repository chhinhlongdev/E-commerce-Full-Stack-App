export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'user' | 'admin';
}

export interface Address {
  _id: string;
  label: string;
  street: string;
  city: string;
  district: string;
  province: string;
  country: string;
  zip: string;
  isDefault: boolean;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;       // virtual: first image (backward compat)
  images: string[];    // full array from Cloudinary
  category: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  _id: string;
  user: User | string;
  items: { product: string; name: string; price: number; quantity: number }[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  address: { street: string; city: string; country: string; zip: string };
  createdAt: string;
}
