import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const getItemWithExpiry = (key) => {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) return null;

  try {
    const item = JSON.parse(itemStr);
    const now = new Date().getTime();

    if (!item.expiry || now > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }

    return item.value;
  } catch (err) {
    localStorage.removeItem(key);
    return null;
  }
};

function PrivateUser() {
  console.log("user");

  const token = getItemWithExpiry("Todo"); 
  const rawRole = localStorage.getItem("role");
const role = rawRole ? JSON.parse(rawRole) : null;
const isAuth = role === "Admin";  

  return token && isAuth ? <Outlet /> : <Navigate to="/" replace />;
}

export default PrivateUser;
