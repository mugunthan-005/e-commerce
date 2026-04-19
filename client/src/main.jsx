import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { Provider, useSelector } from "react-redux";
import { store } from "./app/store";
import "./index.css";

import Login from "./pages/Login";
import ProductGrid from "./pages/ProductGrid";
import Cart from "./pages/Cart";
import InventoryDashboard from "./components/InventoryDashboard";
import { ToastProvider } from "./components/Toast";

function App() {
  const user = useSelector((s) => s.auth.user);
  const [page, setPage] = useState("products");

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="container-page py-4 flex items-center justify-between">
          <div className="font-bold tracking-tight text-slate-900">Ecom Inventory</div>

          <div className="flex items-center gap-2">
            <button className="btn-ghost" onClick={() => setPage("products")}>Products</button>
            <button className="btn-ghost" onClick={() => setPage("cart")}>Cart</button>
            <button className="btn-ghost" onClick={() => setPage("login")}>Login</button>

            {user?.role === "admin" ? (
              <button className="btn-secondary" onClick={() => setPage("admin")}>
                Admin
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="container-page">
        {page === "products" ? <ProductGrid /> : null}
        {page === "cart" ? <Cart /> : null}
        {page === "login" ? <Login /> : null}
        {page === "admin" ? <InventoryDashboard /> : null}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <ToastProvider>
        <App />
      </ToastProvider>
    </Provider>
  </React.StrictMode>
);