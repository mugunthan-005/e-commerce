import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../features/products/productsSlice";
import { addToCart } from "../features/cart/cartSlice";
import { useToast } from "../components/Toast";

function formatPrice(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return "$0.00";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

function stockBadge(stockQty) {
  const qty = Number(stockQty ?? 0);
  if (qty <= 0) return { label: "Out of stock", cls: "badge-red" };
  if (qty <= 5) return { label: "Low stock", cls: "badge-amber" };
  return { label: "In stock", cls: "badge-green" };
}

function ProductCardSkeleton() {
  return (
    <div className="card card-hover p-4">
      <div className="skeleton h-40 w-full rounded-xl" />
      <div className="mt-4 space-y-2">
        <div className="skeleton h-4 w-2/3" />
        <div className="skeleton h-4 w-1/3" />
        <div className="skeleton h-4 w-1/2" />
        <div className="skeleton h-10 w-full rounded-xl mt-3" />
      </div>
    </div>
  );
}

export default function ProductGrid() {
  const dispatch = useDispatch();
  const toast = useToast();
  const { items, status, error } = useSelector((s) => s.products);

  const [query, setQuery] = useState("");

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items || [];
    return (items || []).filter((p) => String(p?.name || "").toLowerCase().includes(q));
  }, [items, query]);

  const isLoading = status === "idle" || status === "loading";

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1>Products</h1>
          <p className="mt-1 text-sm text-slate-600">Browse inventory and add items to your cart.</p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <div className="w-full sm:w-72">
            <input
              className="input"
              placeholder="Search products…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <button
            className="btn-secondary"
            onClick={() => dispatch(fetchProducts())}
            disabled={isLoading}
            title="Reload products"
          >
            {isLoading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      {error ? (
        <div className="mt-6 card p-4 border-rose-200 bg-rose-50 text-rose-800">
          <div className="font-semibold">Couldn’t load products</div>
          <div className="mt-1 text-sm">{error}</div>
          <div className="mt-3">
            <button className="btn-primary" onClick={() => dispatch(fetchProducts())}>
              Try again
            </button>
          </div>
        </div>
      ) : null}

      {!error && isLoading ? (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : null}

      {!error && !isLoading && (!items || items.length === 0) ? (
        <div className="mt-6 card p-6">
          <div className="text-lg font-semibold text-slate-900">No products yet</div>
          <p className="mt-1 text-sm text-slate-600">
            Add a product in MongoDB Atlas (Data Explorer) and refresh.
          </p>
          <div className="mt-4">
            <button className="btn-primary" onClick={() => dispatch(fetchProducts())}>
              Refresh
            </button>
          </div>
        </div>
      ) : null}

      {!error && !isLoading && items && items.length > 0 ? (
        <>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
            <div>
              Showing <span className="font-semibold text-slate-900">{filtered.length}</span> of{" "}
              <span className="font-semibold text-slate-900">{items.length}</span> product(s)
            </div>

            {query.trim() ? (
              <button className="btn-ghost" onClick={() => setQuery("")}>
                Clear search
              </button>
            ) : null}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => {
              const badge = stockBadge(p.stockQuantity);
              const outOfStock = Number(p.stockQuantity ?? 0) <= 0;
              const img = p.imageUrl || p.image || p.thumbnail;

              return (
                <div key={p._id} className="card card-hover overflow-hidden">
                  <div className="relative">
                    {img ? (
                      <img
                        src={img}
                        alt={p.name}
                        className="h-44 w-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          // fallback if broken URL
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="h-44 w-full bg-gradient-to-br from-slate-50 to-slate-100" />
                    )}

                    <div className="absolute left-3 top-3">
                      <span className={badge.cls}>{badge.label}</span>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-slate-900">{p.name}</div>
                        <div className="mt-1 text-sm text-slate-600">
                          Stock:{" "}
                          <span className="font-semibold text-slate-900">{p.stockQuantity}</span>
                        </div>
                      </div>

                      <div className="shrink-0 text-sm font-bold text-slate-900">
                        {formatPrice(p.price)}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (outOfStock) return;
                        dispatch(addToCart(p));
                        toast.push({
                          type: "success",
                          title: "Added to cart",
                          message: p.name,
                        });
                      }}
                      disabled={outOfStock}
                      className={outOfStock ? "btn-secondary w-full mt-4" : "btn-primary w-full mt-4"}
                      title={outOfStock ? "Out of stock" : "Add to cart"}
                    >
                      {outOfStock ? "Out of stock" : "Add to cart"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}