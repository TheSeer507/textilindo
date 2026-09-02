import { useState, useEffect, lazy, Suspense } from "react";
import { PRODUCTS } from "./data/products";
import { useCart } from "./hooks/useCart";
import { useAuth } from "./hooks/useAuth";
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
import { AboutPage } from "./components/AboutPage/AboutPage";
import { WhatsAppButton } from "./components/WhatsAppButton/WhatsAppButton";
import { CheckoutBar } from "./components/CheckoutBar/CheckoutBar";
import { AuthPage } from "./components/Auth/AuthPage";
import { AccountPage } from "./components/Auth/AccountPage";

/* El panel solo lo abre el personal, pero viajaba en el paquete que
   descarga cada cliente. Cargándolo bajo demanda, sale del camino
   crítico de quien solo viene a comprar. */
const AdminDashboard = lazy(() =>
  import("./components/AdminDashboard/AdminDashboard").then((m) => ({
    default: m.AdminDashboard,
  }))
);

export default function CatalogStore() {
  const route = useHashRoute();
  const auth = useAuth();
  const { cart, addToCart, changeQty, removeItem, count, lastAdded, items, totals } = useCart();
  const [category, setCategory] = useState("Todos");
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setCartOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  /* ---- RUTA PROTEGIDA: #admin ----
     Se espera a que termine de restaurarse la sesión antes de decidir;
     si no, al recargar el panel parpadearía "sin acceso" un instante. */
  if (route === "#admin") {
    if (auth.loading) return <FullScreenNote>Verificando acceso…</FullScreenNote>;
    if (!auth.user) return <AuthPage auth={auth} />;
    if (!auth.isStaff) {
      return (
        <FullScreenNote>
          Esta sección es solo para el personal de {"Textilindo"}.
          <a href="#" className="block mt-4 text-amber-400 underline text-sm">Volver a la tienda</a>
        </FullScreenNote>
      );
    }
    return (
      <Suspense fallback={<FullScreenNote>Cargando panel…</FullScreenNote>}>
        <AdminDashboard
          profile={auth.profile}
          isAdmin={auth.isAdmin}
          onSignOut={async () => { await auth.signOut(); window.location.hash = ""; }}
        />
      </Suspense>
    );
  }

  const visible = category === "Todos" ? PRODUCTS : PRODUCTS.filter((p) => p.category === category);
  const isAbout = route === "#about";
  const isLogin = route === "#login";
  const isAccount = route === "#cuenta";
  const productMatch = route.match(/^#product\/(.+)$/);
  const routedProduct = productMatch ? PRODUCTS.find((p) => p.id === productMatch[1]) : null;

  // La barra inferior se superpone al pie de página; este relleno evita
  // que tape la última fila de productos. Solo en móvil, que es donde sale.
  const barVisible = count > 0;

  return (
    <div
      className={
        "min-h-screen bg-brand-surface text-slate-900 " +
        (barVisible ? "pb-24 sm:pb-0" : "")
      }
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <Header count={count} onOpenCart={() => setCartOpen(true)} bumpKey={lastAdded?.key} auth={auth} />

      {isLogin ? (
        // Si ya hay sesión, #login no tiene sentido: mostramos la cuenta.
        auth.user ? <AccountPage auth={auth} /> : <AuthPage auth={auth} />
      ) : isAccount ? (
        auth.user ? <AccountPage auth={auth} /> : <AuthPage auth={auth} />
      ) : isAbout ? (
        <AboutPage />
      ) : productMatch ? (
        routedProduct ? (
          <ProductPage
            product={routedProduct}
            cart={cart}
            onAdd={addToCart}
            onChangeQty={changeQty}
            onRemove={removeItem}
          />
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
                  onChangeQty={changeQty}
                  onRemove={removeItem}
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

      <WhatsAppButton
        hidden={cartOpen}
        productName={routedProduct?.name}
        raised={barVisible}
      />

      <CheckoutBar
        count={count}
        subtotal={totals.subtotal}
        onOpenCart={() => setCartOpen(true)}
        hidden={cartOpen}
      />

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={items}
        totals={totals}
        changeQty={changeQty}
        removeItem={removeItem}
        auth={auth}
      />
    </div>
  );
}

/* Pantalla neutra para los estados del panel (cargando / sin permiso).
   Usa el mismo fondo oscuro del panel para que no haya un salto de
   color cuando sí se concede el acceso. */
function FullScreenNote({ children }) {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 font-mono flex items-center justify-center px-6">
      <div className="text-center max-w-sm">{children}</div>
    </div>
  );
}
