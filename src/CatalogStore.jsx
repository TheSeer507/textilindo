import { useState, useEffect } from "react";
import { PRODUCTS } from "./data/products";
import { useCart } from "./hooks/useCart";
import { useHashRoute } from "./hooks/useHashRoute";
import { Header } from "./components/Header/Header";
import { Hero } from "./components/Hero/Hero";
import { CategoryChips } from "./components/CategoryChips/CategoryChips";
import { ProductCard } from "./components/ProductCard/ProductCard";
import { ProductPage, ProductNotFound } from "./components/ProductPage/ProductPage";
import { CartDrawer } from "./components/Cart/CartDrawer";
import { WhyChooseUs } from "./components/WhyChooseUs/WhyChooseUs";
import { FeatureBanner } from "./components/FeatureBanner/FeatureBanner";
import { PerksBar } from "./components/PerksBar/PerksBar";
import { Footer } from "./components/Footer/Footer";
import { AdminDashboard } from "./components/AdminDashboard/AdminDashboard";
import { AboutPage } from "./components/AboutPage/AboutPage";
import { WhatsAppButton } from "./components/WhatsAppButton/WhatsAppButton";

export default function CatalogStore() {
  const route = useHashRoute();
  const { cart, addToCart, changeQty, removeItem, count } = useCart();
  const [category, setCategory] = useState("Todos");
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setCartOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  if (route === "#admin") return <AdminDashboard />;

  const visible = category === "Todos" ? PRODUCTS : PRODUCTS.filter((p) => p.category === category);
  const isAbout = route === "#about";
  const productMatch = route.match(/^#product\/(.+)$/);
  const routedProduct = productMatch ? PRODUCTS.find((p) => p.id === productMatch[1]) : null;

  return (
    <div className="min-h-screen bg-brand-surface text-slate-900" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <Header count={count} onOpenCart={() => setCartOpen(true)} />

      {isAbout ? (
        <AboutPage />
      ) : productMatch ? (
        routedProduct ? (
          <ProductPage product={routedProduct} cart={cart} onAdd={addToCart} />
        ) : (
          <ProductNotFound />
        )
      ) : (
        <>
          <Hero />

          <main className="max-w-6xl mx-auto px-4 py-16 md:py-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <h2 className="font-display font-semibold text-3xl tracking-tight">Catálogo</h2>
              <CategoryChips active={category} onSelect={setCategory} />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7">
              {visible.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  inCartQty={cart[p.id] || 0}
                  onAdd={addToCart}
                />
              ))}
            </div>
          </main>

          <div className="bg-white">
            <WhyChooseUs />
          </div>
          <FeatureBanner />
          <PerksBar />
        </>
      )}

      <Footer />

      <WhatsAppButton hidden={cartOpen} productName={routedProduct?.name} />

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        products={PRODUCTS}
        changeQty={changeQty}
        removeItem={removeItem}
      />
    </div>
  );
}
