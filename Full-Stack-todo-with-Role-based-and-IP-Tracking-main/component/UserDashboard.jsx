import React, { useEffect, useState } from 'react';
import axios from 'axios';
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
} from 'antd';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAppContext } from '../context/AppContext';


 const BASE_URL = import.meta.env.VITE_BASE_URL;

const UserDashBoard = () => {
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [currentTodo, setCurrentTodo] = useState(null);
    const [form] = Form.useForm();
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [addForm] = Form.useForm();
    const navigate = useNavigate();
    const [descModalVisible, setDescModalVisible] = useState(false);
    const [fullDescription, setFullDescription] = useState('');
    const { todos, fetchTodos, loading, deleteTodo, setTodos } = useAppContext();

    useEffect(() => {
        axios.get(`${BASE_URL}/loggedin`, { withCredentials: true }).catch((error) => {
            navigate("/");
        })
    }, []);

    const handelChecked = async (record) => {
        try {
            await axios.post(`${BASE_URL}/checked?id=${record.key}`, {}, {
                withCredentials: true
            });


           


            const updatedTodos = todos.map(todo =>
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
            await axios.post(`${BASE_URL}/uncheck?id=${record.key}`, {}, {
                withCredentials: true
            });

            const updatedTodos = todos.map(todo =>
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
            toast.success('Todo updated');
            setEditModalVisible(false);
            fetchTodos();
        } catch (err) {
            toast.error('Failed to update todo');
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
            message.success('Todo added successfully');
            setAddModalVisible(false);
            addForm.resetFields();
            fetchTodos();
        } catch (err) {
            message.error('Failed to add todo');
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
            title: 'Serial',
            dataIndex: 'serial',
            key: 'serial',
            width: 70,
            fixed: 'left',
        },
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            render: (_, record) => (
                <span
                    style={{
                        textDecoration: record.completed ? 'line-through' : 'none',
                        opacity: record.completed ? 0.6 : 1,
                    }}
                >
                    {record.title}
                </span>
            ),
            width: 150,
        },
        {
            title: 'Description',
            dataIndex: 'desc',
            key: 'desc',
            render: (_, record) => {
                const maxLength = 50;
                const isLong = record.desc.length > maxLength;
                const shortText = isLong ? record.desc.slice(0, maxLength) + '...' : record.desc;

                return (
                    <>
                        <span
                            style={{
                                textDecoration: record.completed ? 'line-through' : 'none',
                                opacity: record.completed ? 0.6 : 1,
                            }}
                        >
                            {shortText}
                        </span>
                        {isLong && (
                            <Button type="link" onClick={() => handleMoreClick(record.desc)} className="p-0">
                                More
                            </Button>
                        )}
                    </>
                );
            },
            width: 250,
        },
        {
            title: 'Done',
            key: 'checked',
            render: (_, record) => (
                <Checkbox
                    onClick={() => handelChecked(record)}
                    checked={record.completed}
                    disabled={record.completed}
                >
                    Done
                </Checkbox>
            ),
            width: 100,
        },
        {
            title: 'Action',
            key: 'action',
            width: 180,
            render: (_, record) => (
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center w-full">
                    <Button
                        type="default"
                        size="small"
                        onClick={() => handleEdit(record)}
                        className="min-w-4/12"
                    >
                        {record.completed ? 'Unmark' : 'Edit'}
                    </Button>

                    <Popconfirm
                        title="Are you sure to delete this todo?"
                        onConfirm={() => deleteTodo(record.key)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button
                            type="primary"
                            danger
                            size="small"
                            className="w-full sm:w-auto"
                        >
                            Delete
                        </Button>
                    </Popconfirm>
                </div>
            ),
        },
    ];


    return (
       <div className="p-4 md:p-8 max-w-screen-xl mx-auto">
    {/* Header Section */}
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b pb-4">
        <h1 className="text-xl sm:text-3xl font-extrabold text-gray-800">
            User Dashboard
        </h1>

        <div className="flex flex-col sm:flex-row gap-3">
            <Button 
                onClick={handleLogout} 
                danger
                className="font-medium shadow-md"
            >
                Logout
            </Button>

            <Button
                type="primary"
                onClick={() => setAddModalVisible(true)}
                className="font-medium shadow-md"
            >
                Add Todo
            </Button>
        </div>
    </div>

    {/* Table + Loading State */}
    {loading ? (
        <div className="flex justify-center items-center py-16">
            <Spin size="large" />
        </div>
    ) : (
        <div className="overflow-auto rounded-lg border shadow-sm">
            <Table
                columns={columns}
                dataSource={todos}
                pagination={{ pageSize: 5 }}
                scroll={{ x: 800 }}
            />
        </div>
    )}

    {/* Description Modal */}
    <Modal
        title="Full Description"
        open={descModalVisible}
        onCancel={() => setDescModalVisible(false)}
        footer={null}
        className="rounded-lg"
    >
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {fullDescription}
        </p>
    </Modal>

    {/* Edit Modal */}
    <Modal
        title="Edit Todo"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={handleEditSubmit}
        okText="Save"
        className="rounded-lg"
    >
        <Form layout="vertical" form={form}>
            <Form.Item 
                name="title" 
                label={<span className="font-semibold">Title</span>} 
                rules={[{ required: true }]}
            >
                <Input className="shadow-sm" />
            </Form.Item>

            <Form.Item 
                name="desc" 
                label={<span className="font-semibold">Description</span>} 
                rules={[{ required: true }]}
            >
                <Input.TextArea rows={3} className="shadow-sm" />
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
                    Unmark
                </Checkbox>
            </Form.Item>
        </Form>
    </Modal>

    {/* Add Modal */}
    <Modal
        title="Add Todo"
        open={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        onOk={handleAddSubmit}
        className="rounded-lg"
    >
        <Form layout="vertical" form={addForm}>
            <Form.Item 
                name="title" 
                label={<span className="font-semibold">Title</span>} 
                rules={[{ required: true }]}
            >
                <Input className="shadow-sm" />
            </Form.Item>

            <Form.Item 
                name="desc" 
                label={<span className="font-semibold">Description</span>} 
                rules={[{ required: true }]}
            >
                <Input.TextArea rows={3} className="shadow-sm" />
            </Form.Item>
        </Form>
    </Modal>
</div>

    );
};

export default UserDashBoard;
