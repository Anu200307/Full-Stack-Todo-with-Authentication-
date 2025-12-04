import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  Button,
  Spin,
  Popconfirm,
  message,
  Modal,
  Input,
  Form,
  Checkbox,
  Tag,
} from "antd";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAppContext } from "../context/AppContext";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const UserDashBoard = () => {
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentTodo, setCurrentTodo] = useState(null);
  const [form] = Form.useForm();
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [addForm] = Form.useForm();
  const navigate = useNavigate();
  const [descModalVisible, setDescModalVisible] = useState(false);
  const [fullDescription, setFullDescription] = useState("");
  const { todos, fetchTodos, loading, deleteTodo, setTodos } = useAppContext();

  useEffect(() => {
    axios
      .get(`${BASE_URL}/loggedin`, { withCredentials: true })
      .catch((error) => {
        navigate("/");
      });
  }, []);

  const handelChecked = async (record) => {
    try {
      await axios.post(
        `${BASE_URL}/checked?id=${record.key}`,
        {},
        {
          withCredentials: true,
        }
      );

      const updatedTodos = todos.map((todo) =>
        todo.key === record.key ? { ...todo, completed: true } : todo
      );
      setTodos(updatedTodos);
      toast.success("Todo marked as done");
    } catch (error) {
      console.log(error);
      toast.error("Failed to update todo");
    }
  };

  const unChecked = async (record) => {
    try {
      await axios.post(
        `${BASE_URL}/uncheck?id=${record.key}`,
        {},
        {
          withCredentials: true,
        }
      );

      const updatedTodos = todos.map((todo) =>
        todo.key === record.key ? { ...todo, completed: false } : todo
      );
      setTodos(updatedTodos);
      message.success("Todo marked as uncompleted");
    } catch (error) {
      toast.error("Failed to uncheck todo");
    }
  };

  const handleEdit = (record) => {
    setCurrentTodo(record);
    form.setFieldsValue({
      title: record.title,
      desc: record.desc,
      completed: record.completed,
    });
    setEditModalVisible(true);
  };

  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields();
      await axios.put(
        `${BASE_URL}/update?id=${currentTodo.key}`,
        {
          title: values.title,
          body: values.desc,
        },
        { withCredentials: true }
      );
      toast.success("Todo updated");
      setEditModalVisible(false);
      fetchTodos();
    } catch (err) {
      toast.error("Failed to update todo");
    }
  };

  const handleAddSubmit = async () => {
    try {
      const values = await addForm.validateFields();
      await axios.post(
        `${BASE_URL}/create`,
        {
          title: values.title,
          body: values.desc,
        },
        { withCredentials: true }
      );
      message.success("Todo added successfully");
      setAddModalVisible(false);
      addForm.resetFields();
      fetchTodos();
    } catch (err) {
      message.error("Failed to add todo");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("Todo");
    navigate("/");
  };

  const handleMoreClick = (desc) => {
    setFullDescription(desc);
    setDescModalVisible(true);
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const columns = [
    {
      title: <span className="font-semibold text-gray-700">Serial</span>,
      dataIndex: "serial",
      key: "serial",
      width: 80,
      fixed: "left",
      render: (text) => (
        <span className="font-medium text-gray-600">{text}</span>
      ),
    },
    {
      title: <span className="font-semibold text-gray-700">Title</span>,
      dataIndex: "title",
      key: "title",
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <span
            className={`font-medium transition-all ${
              record.completed ? "line-through text-gray-400" : "text-gray-800"
            }`}
          >
            {record.title}
          </span>
          {record.completed && (
            <Tag color="green" className="text-xs">
              Done
            </Tag>
          )}
        </div>
      ),
      width: 200,
    },
    {
      title: <span className="font-semibold text-gray-700">Description</span>,
      dataIndex: "desc",
      key: "desc",
      render: (_, record) => {
        const maxLength = 50;
        const isLong = record.desc.length > maxLength;
        const shortText = isLong
          ? record.desc.slice(0, maxLength) + "..."
          : record.desc;

        return (
          <div className="flex items-center gap-2">
            <span
              className={`transition-all ${
                record.completed
                  ? "line-through text-gray-400"
                  : "text-gray-600"
              }`}
            >
              {shortText}
            </span>
            {isLong && (
              <Button
                type="link"
                onClick={() => handleMoreClick(record.desc)}
                className="p-0 h-auto text-blue-500 hover:text-blue-600"
                size="small"
              >
                More
              </Button>
            )}
          </div>
        );
      },
      width: 300,
    },
    {
      title: <span className="font-semibold text-gray-700">Status</span>,
      key: "checked",
      render: (_, record) => (
        <Checkbox
          onClick={() => handelChecked(record)}
          checked={record.completed}
          disabled={record.completed}
          className="font-medium"
        >
          <span className={record.completed ? "text-green-600" : ""}>
            {record.completed ? "Completed" : "Mark Done"}
          </span>
        </Checkbox>
      ),
      width: 140,
    },
    {
      title: <span className="font-semibold text-gray-700">Actions</span>,
      key: "action",
      width: 200,
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            type="default"
            size="small"
            onClick={() => handleEdit(record)}
            className="bg-white border-blue-500 text-blue-500 hover:bg-blue-50 hover:border-blue-600 font-medium shadow-sm"
          >
            {record.completed ? "Unmark" : "Edit"}
          </Button>

          <Popconfirm
            title="Delete Todo"
            description="Are you sure you want to delete this todo?"
            onConfirm={() => deleteTodo(record.key)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="primary"
              danger
              size="small"
              className="font-medium shadow-sm"
            >
              Delete
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const completedCount = todos.filter((t) => t.completed).length;
  const totalCount = todos.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                User Dashboard
              </h1>
              <p className="text-gray-600 font-medium">
                {completedCount} of {totalCount} tasks completed
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Button
                onClick={handleLogout}
                danger
                size="large"
                className="font-semibold shadow-md hover:shadow-lg transition-all"
              >
                Logout
              </Button>

              <Button
                type="primary"
                onClick={() => setAddModalVisible(true)}
                size="large"
                className="font-semibold shadow-md hover:shadow-lg transition-all bg-gradient-to-r from-blue-500 to-blue-600 border-0"
              >
                + Add Todo
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <p className="text-blue-600 font-semibold text-sm mb-1">
                Total Tasks
              </p>
              <p className="text-3xl font-bold text-blue-700">{totalCount}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
              <p className="text-green-600 font-semibold text-sm mb-1">
                Completed
              </p>
              <p className="text-3xl font-bold text-green-700">
                {completedCount}
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200 col-span-2 md:col-span-1">
              <p className="text-orange-600 font-semibold text-sm mb-1">
                Pending
              </p>
              <p className="text-3xl font-bold text-orange-700">
                {totalCount - completedCount}
              </p>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          {loading ? (
            <div className="flex flex-col justify-center items-center py-20">
              <Spin size="large" />
              <p className="mt-4 text-gray-500 font-medium">
                Loading your todos...
              </p>
            </div>
          ) : todos.length === 0 ? (
            <div className="flex flex-col justify-center items-center py-20 px-4">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-xl font-semibold text-gray-700 mb-2">
                No todos yet
              </p>
              <p className="text-gray-500 mb-4">
                Start by creating your first task!
              </p>
              <Button
                type="primary"
                onClick={() => setAddModalVisible(true)}
                size="large"
                className="bg-gradient-to-r from-blue-500 to-blue-600 border-0 font-semibold"
              >
                Create Your First Todo
              </Button>
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={todos}
              pagination={{
                pageSize: 5,
                showTotal: (total) => `Total ${total} items`,
              }}
              scroll={{ x: 900 }}
              className="custom-table"
            />
          )}
        </div>

        {/* Description Modal */}
        <Modal
          title={
            <span className="text-xl font-bold text-gray-800">
              Full Description
            </span>
          }
          open={descModalVisible}
          onCancel={() => setDescModalVisible(false)}
          footer={null}
          className="custom-modal"
          centered
        >
          <div className="bg-gray-50 rounded-lg p-4 mt-4">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {fullDescription}
            </p>
          </div>
        </Modal>

        {/* Edit Modal */}
        <Modal
          title={
            <span className="text-xl font-bold text-gray-800">Edit Todo</span>
          }
          open={editModalVisible}
          onCancel={() => setEditModalVisible(false)}
          onOk={handleEditSubmit}
          okText="Save Changes"
          className="custom-modal"
          centered
          okButtonProps={{
            className: "bg-blue-500 hover:bg-blue-600 font-semibold",
          }}
        >
          <Form layout="vertical" form={form} className="mt-4">
            <Form.Item
              name="title"
              label={<span className="font-semibold text-gray-700">Title</span>}
              rules={[{ required: true, message: "Please enter a title" }]}
            >
              <Input
                className="rounded-lg shadow-sm border-gray-300 hover:border-blue-400 focus:border-blue-500"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="desc"
              label={
                <span className="font-semibold text-gray-700">Description</span>
              }
              rules={[
                { required: true, message: "Please enter a description" },
              ]}
            >
              <Input.TextArea
                rows={4}
                className="rounded-lg shadow-sm border-gray-300 hover:border-blue-400 focus:border-blue-500"
              />
            </Form.Item>

            <Form.Item name="completed" valuePropName="checked">
              <Checkbox
                onChange={(e) => {
                  if (!e.target.checked) {
                    unChecked(currentTodo);
                    form.setFieldsValue({ completed: false });
                  }
                }}
                className="font-medium"
              >
                Mark as incomplete
              </Checkbox>
            </Form.Item>
          </Form>
        </Modal>

        {/* Add Modal */}
        <Modal
          title={
            <span className="text-xl font-bold text-gray-800">
              Add New Todo
            </span>
          }
          open={addModalVisible}
          onCancel={() => setAddModalVisible(false)}
          onOk={handleAddSubmit}
          okText="Create Todo"
          className="custom-modal"
          centered
          okButtonProps={{
            className: "bg-blue-500 hover:bg-blue-600 font-semibold",
          }}
        >
          <Form layout="vertical" form={addForm} className="mt-4">
            <Form.Item
              name="title"
              label={<span className="font-semibold text-gray-700">Title</span>}
              rules={[{ required: true, message: "Please enter a title" }]}
            >
              <Input
                className="rounded-lg shadow-sm border-gray-300 hover:border-blue-400 focus:border-blue-500"
                placeholder="Enter task title"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="desc"
              label={
                <span className="font-semibold text-gray-700">Description</span>
              }
              rules={[
                { required: true, message: "Please enter a description" },
              ]}
            >
              <Input.TextArea
                rows={4}
                className="rounded-lg shadow-sm border-gray-300 hover:border-blue-400 focus:border-blue-500"
                placeholder="Describe your task in detail"
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>

      <style jsx>{`
        .custom-table .ant-table-thead > tr > th {
          background: linear-gradient(to right, #f8fafc, #f1f5f9);
          font-weight: 600;
          color: #374151;
          border-bottom: 2px solid #e5e7eb;
        }

        .custom-table .ant-table-tbody > tr:hover > td {
          background: #f8fafc !important;
        }

        .custom-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f3f4f6;
        }
      `}</style>
    </div>
  );
};

export default UserDashBoard;
