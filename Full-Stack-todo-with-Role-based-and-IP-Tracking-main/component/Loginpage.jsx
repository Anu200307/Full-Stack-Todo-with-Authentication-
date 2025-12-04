import React, { useEffect, useState } from 'react';
import { LockOutlined, UserOutlined, MailOutlined } from '@ant-design/icons';
import { Button, Form, Input } from 'antd';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

 const BASE_URL = import.meta.env.VITE_BASE_URL;

const LoginPage = () => {


 


  const [isLogin, setLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [Lusername, setLUsername] = useState('');
  const [password, setPassword] = useState('');
  const [conformPassword, setConformPassword] = useState('');

  const { setLoggedin, setRole } = useAppContext();
  const navigate = useNavigate();


  const signUp = async () => {
    if (password !== conformPassword) {
      return toast.warning('Passwords do not match');
    }

    try {
      const res = await axios.post(`${BASE_URL}/signup`, {
        email,
        username: Lusername,
        password
      });

      toast.success(res.data.message);
      setEmail('');
      setPassword('');
      setConformPassword('');
      setLUsername('');
      setLogin(true);
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.message);
    }
  };

   const loggedinCheck = async () => {
    const token = localStorage.getItem("Todo");
    if (!token) {
      return;
    }
    else {
      const roleRes = await axios.get(`${BASE_URL}/role`, {
        withCredentials: true
      });

      const role = roleRes.data.role;
      if (role === 'User') {
        navigate('/user/dashboard');

      } else if (role === 'Admin') {
        navigate('/admin/dashboard');
      }
    }
  }

  useEffect(()=>{
      loggedinCheck();
  },[])

  const login = async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/login`,
        { email, password },
        { withCredentials: true }
      );

      toast.success(res.data.message);

      const now = new Date();
      const item = {
        value: res.data.token,
        expiry: now.getTime() + 60 * 60 * 1000,
      };
      localStorage.setItem('Todo', JSON.stringify(item));

      setLoggedin(true);

      const roleRes = await axios.get(`${BASE_URL}/role`, {
        withCredentials: true
      });

      const role = roleRes.data.role;
      localStorage.setItem('role', JSON.stringify(role));
      setRole(role);
      if (role === 'User') {
        navigate('/user/dashboard');

      } else if (role === 'Admin') {
        navigate('/admin/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error);
    }
  };



  return (
    <div className="flex items-center justify-center h-screen w-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
  <div className="w-[450px] p-8 bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20">
    
    {/* Heading */}
    <h2 className="text-3xl font-bold text-center text-white mb-6 tracking-wide">
      {isLogin ? "Welcome Back 👋" : "Create an Account ✨"}
    </h2>

    <Form style={{ maxWidth: 360 }} onFinish={isLogin ? login : signUp} className="mx-auto">

      {/* Email */}
      <Form.Item rules={[{ required: true, message: "Please input your email!" }]}>
        <Input
          prefix={<MailOutlined className="text-gray-400" />}
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="py-2 rounded-lg bg-white/20 border-white/30 text-white placeholder-gray-300"
        />
      </Form.Item>

      {/* Username Only for Signup */}
      {!isLogin && (
        <Form.Item rules={[{ required: true, message: "Please input your Username!" }]}>
          <Input
            prefix={<UserOutlined className="text-gray-400" />}
            placeholder="Username"
            value={Lusername}
            onChange={(e) => setLUsername(e.target.value)}
            className="py-2 rounded-lg bg-white/20 border-white/30 text-white placeholder-gray-300"
          />
        </Form.Item>
      )}

      {/* Password */}
      <Form.Item rules={[{ required: true, message: "Please input your Password!" }]}>
        <Input.Password
          prefix={<LockOutlined className="text-gray-400" />}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="py-2 rounded-lg bg-white/20 border-white/30 text-white placeholder-gray-300"
        />
      </Form.Item>

      {/* Confirm Password Only for Signup */}
      {!isLogin && (
        <Form.Item rules={[{ required: true, message: "Please confirm your password!" }]}>
          <Input.Password
            prefix={<LockOutlined className="text-gray-400" />}
            placeholder="Confirm Password"
            value={conformPassword}
            onChange={(e) => setConformPassword(e.target.value)}
            className="py-2 rounded-lg bg-white/20 border-white/30 text-white placeholder-gray-300"
          />
        </Form.Item>
      )}

      {/* Submit Button + Switch Link */}
      <Form.Item className="mt-6">
        <Button
          type="primary"
          htmlType="submit"
          block
          className="!h-12 text-lg font-semibold rounded-lg shadow-lg bg-blue-600 hover:bg-blue-700"
        >
          {isLogin ? "Login" : "Sign Up"}
        </Button>

        <div className="text-center mt-4">
          <span className="text-gray-300"> 
            {isLogin ? "Don't have an account?" : "Already have an account?"}
          </span>{" "}
          <span
            onClick={() => setLogin(!isLogin)}
            className="cursor-pointer text-blue-400 hover:text-blue-300 font-medium"
          >
            {isLogin ? "Register now!" : "Login now!"}
          </span>
        </div>
      </Form.Item>

    </Form>
  </div>
</div>

  );
};

export default LoginPage;
