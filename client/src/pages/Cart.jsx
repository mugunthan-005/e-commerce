import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "../api/axios";
import { changeQty, clearCart, removeFromCart } from "../features/cart/cartSlice";
import { useToast } from "../components/Toast";

function formatPrice(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return "$0.00";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export default function Cart() {
  const dispatch = useDispatch();
  const toast = useToast();
  const items = useSelector((s) => s.cart.items);

  const [loading, setLoading] = useState(false);

  const subtotal = useMemo(() => {
    return items.reduce((sum, it) => sum + Number(it.product?.price || 0) * Number(it.quantity || 0), 0);
  }, [items]);

  const shipping = subtotal > 0 ? 0 : 0; // keep simple for now
  const total = subtotal + shipping;

  async function checkout() {
    if (!items.length) return;

    try {
      setLoading(true);
      const payload = {
        items: items.map((it) => ({ productId: it.product._id, quantity: it.quantity })),
      };
      const res = await axios.post("/api/orders", payload);

      dispatch(clearCart());
      toast.push({
        type: "success",
        title: "Order placed",
        message: `Order ID: ${res.data?.order?._id || "created"}`,
      });
    } catch (e) {
      toast.push({
        type: "error",
        title: "Checkout failed",
        message: e?.response?.data?.message || e.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="py-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1>Cart</h1>
          <p className="mt-1 text-sm text-slate-600">Review items and checkout.</p>
        </div>

        {items.length ? (
          <button className="btn-ghost" onClick={() => dispatch(clearCart())} disabled={loading}>
            Clear cart
          </button>
        ) : null}
      </div>

      {!items.length ? (
        <div className="mt-6 card p-6">
          <div className="text-lg font-semibold text-slate-900">Your cart is empty</div>
          <p className="mt-1 text-sm text-slate-600">Go to Products and add something.</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((it) => (
              <div key={it.product._id} className="card p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="truncate font-semibold text-slate-900">{it.product.name}</div>
                  <div className="mt-1 text-sm text-slate-600">
                    {formatPrice(it.product.price)} each
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  {/* Qty controls */}
                  <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white">
                    <button
                      className="px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-l-xl"
                      onClick={() =>
                        dispatch(
                          changeQty({
                            productId: it.product._id,
                            quantity: Number(it.quantity || 1) - 1,
                          })
                        )
                      }
                      disabled={loading}
                      title="Decrease quantity"
                    >
                      −
                    </button>
                    <div className="px-3 py-2 text-sm font-semibold text-slate-900 min-w-10 text-center">
                      {it.quantity}
                    </div>
                    <button
                      className="px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-r-xl"
                      onClick={() =>
                        dispatch(
                          changeQty({
                            productId: it.product._id,
                            quantity: Number(it.quantity || 1) + 1,
                          })
                        )
                      }
                      disabled={loading}
                      title="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-sm font-bold text-slate-900 w-28 text-right">
                    {formatPrice(Number(it.product.price || 0) * Number(it.quantity || 0))}
                  </div>

                  <button
                    onClick={() => {
                      dispatch(removeFromCart(it.product._id));
                      toast.push({ type: "info", title: "Removed from cart", message: it.product.name });
                    }}
                    className="btn-secondary"
                    disabled={loading}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="card p-5 h-fit">
            <div className="text-lg font-semibold text-slate-900">Summary</div>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Shipping</span>
                <span className="font-semibold text-slate-900">{formatPrice(shipping)}</span>
              </div>
              <div className="h-px bg-slate-200 my-2" />
              <div className="flex items-center justify-between">
                <span className="text-slate-700 font-semibold">Total</span>
                <span className="text-slate-900 font-extrabold">{formatPrice(total)}</span>
              </div>
            </div>

            <button
              onClick={checkout}
              disabled={loading || !items.length}
              className="btn-primary w-full mt-5"
            >
              {loading ? "Placing order…" : "Checkout"}
            </button>

            <p className="mt-3 text-xs text-slate-500">
              This is a demo checkout. It will create an order in your backend.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}