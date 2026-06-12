import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* Hero */}
      <section className="text-center py-24">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">Welcome to MyShop 🛍</h1>
        <p className="text-gray-500 text-lg mb-8">Find the best products at the best prices.</p>
        <Link href="/products" className="bg-blue-600 text-white px-8 py-3 rounded-full text-lg hover:bg-blue-700 transition">
          Shop Now
        </Link>
      </section>

      {/* Categories */}
      <section className="py-12">
        <h2 className="text-2xl font-semibold mb-6">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Electronics', 'Clothing', 'Books', 'Home'].map(cat => (
            <Link key={cat} href={`/products?category=${cat.toLowerCase()}`}
              className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition font-medium text-gray-700 hover:text-blue-600">
              {cat}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
