import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [ordering, setOrdering] = useState(false);
  const [message, setMessage] = useState("");
  const [address, setAddress] = useState({
    street: "", city: "", state: "", zip: "", country: "",
  });

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(({ data }) => setProduct(data))
      .catch(() => navigate("/products"))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  async function handleOrder(e) {
    e.preventDefault();
    if (!user) return navigate("/login");
    try {
      setOrdering(true);
      await api.post("/orders", {
        items: [{ productId: id, quantity }],
        shippingAddress: address,
      });
      setMessage("Order placed successfully!");
    } catch (err) {
      setMessage(err.response?.data?.error || "Order failed.");
    } finally {
      setOrdering(false);
    }
  }

  if (loading) return <p>Loading...</p>;
  if (!product) return null;

  return (
    <div className="product-detail">
      {product.imageUrl && <img src={product.imageUrl} alt={product.name} />}
      <h1>{product.name}</h1>
      <p className="category">{product.category}</p>
      <p className="description">{product.description}</p>
      <p className="price">${product.price.toFixed(2)}</p>
      <p className="stock">{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</p>

      {product.stock > 0 && (
        <form onSubmit={handleOrder} className="order-form">
          <h3>Place Order</h3>
          <label>
            Quantity
            <input type="number" min="1" max={product.stock} value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))} />
          </label>
          {["street", "city", "state", "zip", "country"].map((field) => (
            <input key={field} placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              value={address[field]} required
              onChange={(e) => setAddress({ ...address, [field]: e.target.value })} />
          ))}
          <button type="submit" disabled={ordering}>
            {ordering ? "Placing Order..." : "Place Order"}
          </button>
          {message && <p className={message.includes("success") ? "success" : "error"}>{message}</p>}
        </form>
      )}
    </div>
  );
}
