import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProducts();
  }, [search, category]);

  async function fetchProducts() {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (category) params.category = category;
      const { data } = await api.get("/products", { params });
      setProducts(data.products || []);
    } catch {
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="products-page">
      <h1>Products</h1>

      <div className="filters">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
      </div>

      {error && <p className="error">{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="product-grid">
          {products.map((p) => (
            <Link key={p._id} to={`/products/${p._id}`} className="product-card">
              {p.imageUrl && <img src={p.imageUrl} alt={p.name} />}
              <h3>{p.name}</h3>
              <p className="category">{p.category}</p>
              <p className="price">${p.price.toFixed(2)}</p>
              <p className="stock">
                {p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
