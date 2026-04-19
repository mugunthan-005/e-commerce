import React from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "../api/axios";
import { clearCart, removeFromCart } from "../features/cart/cartSlice";

export default function Cart() {
  const dispatch = useDispatch();
  const items = useSelector((s) => s.cart.items);

  const total = items.reduce((sum, it) => sum + it.product.price * it.quantity, 0);

  async function checkout() {
    const payload = {
      items: items.map((it) => ({ productId: it.product._id, quantity: it.quantity }))
    };

    const res = await axios.post("/api/orders", payload);
    dispatch(clearCart());
    alert("Order placed: " + res.data.order._id);
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Cart</h1>

      {items.length === 0 ? <div>Your cart is empty.</div> : null}

      <div className="space-y-3">
        {items.map((it) => (
          <div key={it.product._id} className="bg-white border rounded-xl p-4 flex justify-between">
            <div>
              <div className="font-semibold">{it.product.name}</div>
              <div className="text-sm text-gray-600">
                ${Number(it.product.price).toFixed(2)} × {it.quantity}
              </div>
            </div>
            <button
              onClick={() => dispatch(removeFromCart(it.product._id))}
              className="px-3 py-2 rounded-lg bg-red-600 text-white"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {items.length ? (
        <div className="mt-6 flex items-center justify-between">
          <div className="font-semibold">Total: ${total.toFixed(2)}</div>
          <button
            onClick={checkout}
            className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800"
          >
            Checkout
          </button>
        </div>
      ) : null}
    </div>
  );
}