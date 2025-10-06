import React, { useState } from "react";
import { Button, Input, Modal, Form, message } from "antd";
import axios from "axios";
import {PlusOutlined} from  '@ant-design/icons';
import { toast } from "react-toastify";
const AddAdminSection = ({setAdminCreated}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

   const BASE_URL = import.meta.env.VITE_BASE_URL;


  const handleAddAdmin = async () => {
    const { username, email, password, confirmPassword } = formData;

    if (!username || !email || !password || !confirmPassword) {
      return message.error("All fields are required.");
    }

    if (password !== confirmPassword) {
        return toast.error("Confirm Password not matched");
    }

    try {
      const res = await axios.post(
        `${BASE_URL}/admin/addadmin`,
        {
          username,
          email,
          password,
        },
        { withCredentials: true }
        
      )
      .then(()=>{
        setAdminCreated(prev=>!prev);
          toast.success("Admin added successfully!");
        
      })
      .catch((error)=>{
        toast.error(error.response?.data?.error || error.response?.data?.message);
      })

      setIsModalOpen(false);
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
    } catch (err) {
      console.error(err);
      message.error("Failed to add admin.");
    }
  };

  return (
    <>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Add Admin</h2>

          <Button type="primary" onClick={() => setIsModalOpen(true)}>
            <PlusOutlined />New Admin
          </Button>

          <Modal
            title="Add New Admin"
            open={isModalOpen}
            onCancel={() => setIsModalOpen(false)}
            onOk={handleAddAdmin}
            okText="Create"
          >
            <Form layout="vertical">
              <Form.Item label="Name">
                <Input
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Enter name"
                />
              </Form.Item>

              <Form.Item label="Email">
                <Input
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email"
                />
              </Form.Item>

              <Form.Item label="Password">
                <Input.Password
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter password"
                />
              </Form.Item>

              <Form.Item label="Confirm Password">
                <Input.Password
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm password"
                />
              </Form.Item>
            </Form>
          </Modal>
        </div>
    </>
  );
};

export default AddAdminSection;
