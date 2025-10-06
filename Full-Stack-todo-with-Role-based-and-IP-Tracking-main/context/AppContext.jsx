import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

// Create context
const AppContext = createContext();

// BASE_URL from environment
const BASE_URL = import.meta.env.VITE_BASE_URL;

export const AppProvider = ({ children }) => {
  const [isLoggedin, setLoggedin] = useState(false);
  const [role, setRole] = useState(null);
  const [totalUser, setTotalUser] = useState(0);
  const [totalTodos, setTotalTodos] = useState(0);
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState(null);
  const [email, setEmail] = useState(null);
  const [trafficData, setTrafficData] = useState([]);
  const [todos, setTodos] = useState([]);

  const deleteTodo = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/delete?id=${id}`, {
        withCredentials: true,
      });
      toast.success('Todo deleted');
      fetchTodos();
    } catch (err) {
      toast.error('Failed to delete');
      console.log(err);
    }
  };

  const fetchTraffic = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/admin/traffic`, {
        withCredentials: true,
      });
      const data = res.data;
      const formatted = [
        { name: 'Last 1 Hour', users: data.last1Hour },
        { name: 'Last 1 Day', users: data.last1Day },
        { name: 'Last 7 Days', users: data.last7Days },
        { name: 'Last 30 Days', users: data.last30Days },
      ];
      setTrafficData(formatted);
    } catch (err) {
      console.error('Error fetching traffic:', err);
    }
  };

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/alltodos`, {
        withCredentials: true,
      });
      const reversedTodos = res.data.todos.reverse();
      const transformedData = reversedTodos.map((todo, index) => ({
        key: todo._id,
        serial: index + 1,
        title: todo.title,
        desc: todo.body,
        completed: todo.complete,
        _id: todo._id,
      }));
      setTodos(transformedData);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/admin/allusers`, {
        withCredentials: true,
      });
      const reverseData = res.data.message.reverse();
      setUserData(reverseData);
    } catch (err) {
      console.error('Error fetching users', err);
    }
  };

  const adminData = async () => {
    try {
      const result = await axios.get(`${BASE_URL}/admin/details`, {
        withCredentials: true,
      });
      setUsername(result.data.message.username);
      setEmail(result.data.message.email);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  const allTodos = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/admin/totaltodo`, {
        withCredentials: true,
      });
      setTotalTodos(res.data.count);
    } catch (error) {
      console.error('Error fetching total todos:', error);
    }
  };

  const allUsers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/admin/allusers`, {
        withCredentials: true,
      });
      setTotalUser(res.data.message.length);
    } catch (error) {
      console.error('Error fetching total users:', error);
    }
  };

  return (
    <AppContext.Provider
      value={{
        isLoggedin,
        setLoggedin,
        role,
        setRole,
        username,
        setUsername,
        allUsers,
        totalUser,
        allTodos,
        totalTodos,
        email,
        adminData,
        fetchUsers,
        userData,
        trafficData,
        fetchTraffic,
        todos,
        fetchTodos,
        loading,
        deleteTodo,
        setTodos,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
