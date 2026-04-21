import React, { useEffect, useState } from "react";
import api from "../services/api";

const STATUS_COLORS = {
  pending: "#f59e0b",
  processing: "#3b82f6",
  shipped: "#8b5cf6",
  delivered: "#10b981",
  cancelled: "#ef4444",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/orders")
      .then(({ data }) => setOrders(data.orders || []))
      .finally(() => setLoading(false));
  }, []);

  async function cancelOrder(id) {
    if (!window.confirm("Cancel this order?")) return;
    try {
      await api.delete(`/orders/${id}`);
      setOrders((prev) =>
        prev.map((o) => (o._id === id ? { ...o, status: "cancelled" } : o))
      );
    } catch (err) {
      alert(err.response?.data?.error || "Cancel failed.");
    }
  }

  if (loading) return <p>Loading orders...</p>;

  return (
    <div className="orders-page">
      <h1>My Orders</h1>
      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <span className="order-id">#{order._id.slice(-8).toUpperCase()}</span>
                <span
                  className="order-status"
                  style={{ color: STATUS_COLORS[order.status] }}
                >
                  {order.status.toUpperCase()}
                </span>
                <span className="order-date">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="order-items">
                {order.items.map((item, i) => (
                  <div key={i} className="order-item">
                    <span>{item.name}</span>
                    <span>x{item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="order-footer">
                <strong>Total: ${order.totalAmount.toFixed(2)}</strong>
                {order.status === "pending" && (
                  <button onClick={() => cancelOrder(order._id)} className="btn-cancel">
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
