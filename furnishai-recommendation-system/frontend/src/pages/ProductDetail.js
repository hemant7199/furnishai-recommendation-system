import React from "react";
import { useLocation } from "react-router-dom";

export default function ProductDetail() {
  const { state: product } = useLocation();

  if (!product) return <div>No product data</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>{product.title}</h2>

      <img
        src={product.first_image}
        alt={product.title}
        style={{ width: 300 }}
      />

      <p><b>Brand:</b> {product.brand}</p>
      <p><b>Price:</b> ${product.price}</p>
      <p><b>Category:</b> {product.categories}</p>
      <p><b>Description:</b> {product.description}</p>
    </div>
  );
}