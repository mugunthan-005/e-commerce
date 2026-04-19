import React, { useEffect, useMemo, useState } from "react";
import axios from "../api/axios";

export default function InventoryDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [restockQtyById, setRestockQtyById] = useState({});
  const [busyId, setBusyId] = useState(null);

  const lowStockCount = useMemo(
    () => products.filter((p) => p.stockQuantity < p.minStockThreshold).length,
    [products]
  );

  async function fetchProducts() {
    setErr("");
    setLoading(true);
    try {
      const res = await axios.get("/api/products");
      setProducts(res.data.products || res.data || []);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  async function restock(productId) {
    const qty = Number(restockQtyById[productId] || 0);
    if (!Number.isFinite(qty) || qty <= 0) {
      setErr("Enter a valid restock quantity (> 0).");
      return;
    }

    setErr("");
    setBusyId(productId);
    try {
      const res = await axios.patch(`/api/products/${productId}/restock`, {
        addQuantity: qty
      });

      const updated = res.data.product;
      setProducts((prev) => prev.map((p) => (p._id === productId ? updated : p)));
      setRestockQtyById((prev) => ({ ...prev, [productId]: "" }));
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Restock failed");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-gray-700">Loading inventory…</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Admin Inventory</h1>
          <p className="text-sm text-gray-600">
            {products.length} product(s) •{" "}
            <span className={lowStockCount > 0 ? "text-red-600 font-medium" : ""}>
              {lowStockCount} low stock
            </span>
          </p>
        </div>

        <button
          onClick={fetchProducts}
          className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800"
        >
          Refresh
        </button>
      </div>

      {err ? (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {err}
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="text-left font-semibold px-4 py-3">Name</th>
              <th className="text-left font-semibold px-4 py-3">Price</th>
              <th className="text-left font-semibold px-4 py-3">Stock</th>
              <th className="text-left font-semibold px-4 py-3">Min Threshold</th>
              <th className="text-left font-semibold px-4 py-3">Restock</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {products.map((p) => {
              const low = p.stockQuantity < p.minStockThreshold;

              return (
                <tr key={p._id} className={low ? "bg-red-50" : "bg-white"}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{p.name}</div>
                    {low ? (
                      <div className="text-xs text-red-700">Low stock: below threshold</div>
                    ) : null}
                  </td>

                  <td className="px-4 py-3 text-gray-800">${Number(p.price).toFixed(2)}</td>

                  <td className="px-4 py-3">
                    <span className={low ? "text-red-700 font-semibold" : "text-gray-900"}>
                      {p.stockQuantity}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-gray-800">{p.minStockThreshold}</td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        value={restockQtyById[p._id] ?? ""}
                        onChange={(e) =>
                          setRestockQtyById((prev) => ({ ...prev, [p._id]: e.target.value }))
                        }
                        className="w-28 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900"
                        placeholder="Qty"
                      />
                      <button
                        onClick={() => restock(p._id)}
                        disabled={busyId === p._id}
                        className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                      >
                        {busyId === p._id ? "Restocking…" : "Restock"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {products.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-gray-600" colSpan={5}>
                  No products found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}