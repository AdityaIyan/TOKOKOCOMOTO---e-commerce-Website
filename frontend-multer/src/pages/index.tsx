import { useEffect, useState } from "react";
import { Hero } from "@/components/Hero";
import { ProductList } from "@/features/products/components/ProductList";
import api from "@/lib/axios";
import { Product } from "@/types";
import { SwipeButton } from "@/components/SwipeButton";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/router";

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      router.push('/seller/dashboard');
    }
    // Removed automatic redirect for USER to allow access to landing page
  }, [user, router]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await api.get("/products");
        setFeaturedProducts(response.data.slice(0, 4));
      } catch (error) {
        console.error("Failed to fetch products", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (user?.role === 'ADMIN') {
    return null; // Or a loading spinner while redirecting
  }

  return (
    <div className="pb-20">
      <Hero />
      <section id="products" className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold uppercase tracking-widest mb-4">New Arrivals</h2>
          <div className="w-24 h-1 bg-black mx-auto"></div>
          <p className="mt-4 text-gray-500 uppercase tracking-wide text-sm">Discover our latest collection</p>
        </div>

        {loading ? (
          <div className="text-center py-20">Loading...</div>
        ) : (
          <ProductList products={featuredProducts} />
        )}

        <div className="mt-16">
          <SwipeButton />
        </div>
      </section>
    </div>
  );
}
