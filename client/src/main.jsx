import React, { useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import { Provider, useSelector } from "react-redux";
import { store } from "./app/store";
import "./index.css";

import Login from "./pages/Login";
import ProductGrid from "./pages/ProductGrid";
import Cart from "./pages/Cart";
import InventoryDashboard from "./components/InventoryDashboard";
import { ToastProvider } from "./components/Toast";

function NavButton({ active, children, ...props }) {
  return (
    <button
      className={[
        "btn",
        "px-3 py-2 rounded-xl",
        active
          ? "bg-slate-900 text-white hover:bg-slate-800"
          : "bg-transparent text-slate-700 hover:bg-slate-100",
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}

function AppShell() {
  const user = useSelector((s) => s.auth.user);
  const cartItems = useSelector((s) => s.cart?.items || []);
  const [page, setPage] = useState("products");

  const cartCount = useMemo(() => {
    // supports different cart item shapes:
    // [{quantity: 2}] or [{qty: 2}] or just array length
    const sum = cartItems.reduce((acc, it) => {
      const q = Number(it?.quantity ?? it?.qty ?? 1);
      return acc + (Number.isFinite(q) ? q : 1);
    }, 0);
    return sum || cartItems.length || 0;
  }, [cartItems]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="container-page py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-slate-900 text-white grid place-items-center font-bold">
                EI
              </div>
              <div>
                <div className="font-bold tracking-tight text-slate-900 leading-5">
                  Ecom Inventory
                </div>
                <div className="text-xs text-slate-600">
                  Products • Cart • Admin
                </div>
              </div>
            </div>

            {/* user pill (right on mobile) */}
            {user ? (
              <div className="sm:hidden inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs">
                <span className="font-semibold text-slate-900">
                  {user?.name || user?.email || "User"}
                </span>
                <span className="text-slate-500">
                  {user?.role ? `(${user.role})` : ""}
                </span>
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <NavButton active={page === "products"} onClick={() => setPage("products")}>
              Products
            </NavButton>

            <NavButton active={page === "cart"} onClick={() => setPage("cart")}>
              <span className="inline-flex items-center gap-2">
                Cart
                <span className="inline-flex min-w-6 justify-center rounded-full bg-slate-900 px-2 py-0.5 text-xs font-bold text-white">
                  {cartCount}
                </span>
              </span>
            </NavButton>

            <NavButton active={page === "login"} onClick={() => setPage("login")}>
              {user ? "Account" : "Login"}
            </NavButton>

            {user?.role === "admin" ? (
              <NavButton active={page === "admin"} onClick={() => setPage("admin")}>
                Admin
              </NavButton>
            ) : null}

            {/* user pill (desktop) */}
            {user ? (
              <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm">
                <span className="font-semibold text-slate-900">
                  {user?.name || user?.email || "User"}
                </span>
                <span className="text-slate-500">
                  {user?.role ? `(${user.role})` : ""}
                </span>
              </div>
            ) : (
              <div className="hidden sm:block text-sm text-slate-500">
                Not signed in
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="container-page">
        {page === "products" ? <ProductGrid /> : null}
        {page === "cart" ? <Cart /> : null}
        {page === "login" ? <Login /> : null}
        {page === "admin" ? <InventoryDashboard /> : null}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-200 bg-white">
        <div className="container-page py-6 text-sm text-slate-600 flex flex-col gap-1 sm:flex-row sm:justify-between">
          <div>© {new Date().getFullYear()} Ecom Inventory</div>
          <div className="text-slate-500">Built with MERN + Tailwind</div>
        </div>
      </footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <ToastProvider>
        <AppShell />
      </ToastProvider>
    </Provider>
  </React.StrictMode>
);