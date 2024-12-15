import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AdminAuthContext } from '../../context/AdminAuthContext';

function AdminPrivateRoute() {
  const { admin } = useContext(AdminAuthContext);
  return admin ? <Outlet /> : <Navigate to="/admin/login" />;
}

export default AdminPrivateRoute;
