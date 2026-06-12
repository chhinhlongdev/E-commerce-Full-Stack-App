import Link from 'next/link';

export default function OrderSuccessPage() {
  return (
    <div className="text-center py-32">
      <p className="text-6xl mb-4">🎉</p>
      <h1 className="text-3xl font-bold mb-2">Order Placed!</h1>
      <p className="text-gray-500 mb-8">Thank you for your purchase. We'll process it shortly.</p>
      <div className="flex gap-4 justify-center">
        <Link href="/products" className="bg-blue-600 text-white px-6 py-2.5 rounded-full hover:bg-blue-700">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
