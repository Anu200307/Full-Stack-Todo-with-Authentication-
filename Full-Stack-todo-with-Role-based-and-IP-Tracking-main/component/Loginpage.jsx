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
    <div className="flex items-center justify-center h-screen w-screen">
      <div className="w-[450px]">
        <Form style={{ maxWidth: 360 }} onFinish={isLogin ? login : signUp}>
          <Form.Item rules={[{ required: true, message: 'Please input your email!' }]}>
            <Input
              prefix={<MailOutlined />}
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Item>

          {!isLogin && (
            <Form.Item rules={[{ required: true, message: 'Please input your Username!' }]}>
              <Input
                prefix={<UserOutlined />}
                placeholder="Username"
                value={Lusername}
                onChange={(e) => setLUsername(e.target.value)}
              />
            </Form.Item>
          )}

          <Form.Item rules={[{ required: true, message: 'Please input your Password!' }]}>
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Item>

          {!isLogin && (
            <Form.Item rules={[{ required: true, message: 'Please confirm your password!' }]}>
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Confirm Password"
                value={conformPassword}
                onChange={(e) => setConformPassword(e.target.value)}
              />
            </Form.Item>
          )}

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {isLogin ? 'Login' : 'Sign Up'}
            </Button>
            <div className="text-center mt-2">
              <span
                onClick={() => setLogin(!isLogin)}
                className="cursor-pointer text-blue-500"
              >
                {isLogin ? 'Register now!' : 'Login now!'}
              </span>
            </div>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default LoginPage;
