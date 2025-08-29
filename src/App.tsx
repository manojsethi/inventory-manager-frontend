import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProductTypes from './pages/ProductTypes/ProductTypes';
import ProductBrands from './pages/ProductBrands/ProductBrands';
import Suppliers from './pages/Suppliers/Suppliers';
import Products from './pages/Products/Products';
import ProductFormTabs from './pages/Products/ProductFormTabs';
import ProductDetail from './pages/Products/ProductDetail';
import PurchaseBills from './pages/PurchaseBills/PurchaseBills';
import CreatePurchaseBill from './pages/PurchaseBills/CreatePurchaseBill';

import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/Layout/MainLayout';
import './App.css';

function App() {
  const { isAuthenticated, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="App">
      <Routes>
        {/* Default route - redirect based on authentication status */}
        <Route
          path="/"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
          }
        />

        {/* Login route - redirect to dashboard if already authenticated */}
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
          }
        />

        {/* Protected dashboard route */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />




        {/* Product Types routes */}
        <Route
          path="/product-types"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ProductTypes />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Product Brands routes */}
        <Route
          path="/product-brands"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ProductBrands />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Suppliers routes */}
        <Route
          path="/suppliers"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Suppliers />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Products routes */}
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Products />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/add"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ProductFormTabs />
              </MainLayout>
            </ProtectedRoute>
          }
        />


        <Route
          path="/products/edit/:id"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ProductDetail />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Purchase Bills routes */}
        <Route
          path="/purchase-bills"
          element={
            <ProtectedRoute>
              <MainLayout>
                <PurchaseBills />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchase-bills/create"
          element={
            <ProtectedRoute>
              <MainLayout>
                <CreatePurchaseBill />
              </MainLayout>
            </ProtectedRoute>
          }
        />



        {/* Catch all route - redirect to appropriate page */}
        <Route
          path="*"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
          }
        />
      </Routes>
    </div>
  );
}

export default App;
