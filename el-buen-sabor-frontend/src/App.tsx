// src/App.tsx
import React from 'react';
import ArticuloManufacturadoList from './components/ArticuloManufacturado/ArticuloManufacturadoList';
import './App.css'; // Si tienes estilos globales
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Ingredientes from './admin/pages/ingredientes';
import Landing from './components/Landing/Landing';
import CartPage from './components/pages/cart/CartPage';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/landing" element={<Landing />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/" element={<ArticuloManufacturadoList />} />
        <Route path="/admin/pages/ingredientes" element={<Ingredientes />} />
      </Routes>
    </Router>
  );
}

export default App;