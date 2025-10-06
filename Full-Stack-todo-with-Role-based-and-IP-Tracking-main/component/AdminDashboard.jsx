import React, { useContext, useEffect, useState } from 'react';
import {
  Button,
  Col,
  Row,
  Table,
  Statistic,
  Breadcrumb,
  Layout,
  Menu,
  theme,
  Spin,
  Drawer,
} from 'antd';
import { Input } from 'antd';
import {
  PieChartOutlined,
  FileOutlined,
  UserOutlined,
  OrderedListOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import AddAdminSection from './AddAdminSection';
import { useMediaQuery } from 'react-responsive';
import { useAppContext } from '../context/AppContext';
const { Header, Content, Footer, Sider } = Layout;

function getItem(label, key, icon, children) {
  return { key, icon, children, label };
}

const items = [
  getItem('Dashboard', '1', <PieChartOutlined />),
  getItem('User List', '2', <OrderedListOutlined />),
  getItem('Admin Profile', '3', <UserOutlined />),
  getItem('Admin Tasks', '4', <FileOutlined />),
];

const BASE_URL = import.meta.env.VITE_BASE_URL;


const AdminDashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedKey, setSelectedKey] = useState('1');
  const [adminCreated, setAdminCreated] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { allUsers, totalUser, allTodos, totalTodos,
    fetchUsers, userData, email, adminData, username,
    trafficData, fetchTraffic
  } = useAppContext();

  const isMobile = useMediaQuery({ maxWidth: 768 });

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();



  const handleLogout = () => {
    localStorage.removeItem('Todo');
    localStorage.removeItem('role');
    navigate('/');
  };

  useEffect(() => {
    axios.get(`${BASE_URL}/loggedin`, { withCredentials: true }).catch(() => { });
  }, []);

  useEffect(() => {
    adminData();
    allTodos();
    allUsers();
    fetchTraffic();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [selectedKey, adminCreated]);

  const handleMenuClick = ({ key }) => {
    setSelectedKey(key);
    if (isMobile) setDrawerVisible(false);
  };

  const SidebarContent = (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={[selectedKey]}
      items={items}
      onClick={handleMenuClick}
    />
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {isMobile ? (
        <Drawer
          placement="left"
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          bodyStyle={{ padding: 0 }}
        >
          {SidebarContent}
        </Drawer>
      ) : (
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
          trigger={null}
        >
          {SidebarContent}
        </Sider>
      )}

      <Layout>
        <Header style={{ padding: '0 16px', background: colorBgContainer }} className="flex items-center">
          <Button
            type="text"
            icon={
              isMobile
                ? <MenuUnfoldOutlined />
                : collapsed
                  ? <MenuUnfoldOutlined />
                  : <MenuFoldOutlined />
            }
            onClick={() => {
              if (isMobile) setDrawerVisible(true);
              else setCollapsed(!collapsed);
            }}
            style={{ fontSize: '18px', width: 40, height: 40 }}
          />
          <h1 className="ml-4 text-lg font-semibold hidden sm:block">Admin Dashboard</h1>
        </Header>

        <Content style={{ margin: '0 16px' }}>
          <Breadcrumb style={{ margin: '16px 0' }}>
            <Breadcrumb.Item>Admin</Breadcrumb.Item>
            <Breadcrumb.Item>
              {{
                '1': 'Dashboard',
                '2': 'User List',
                '3': 'Admin Profile',
                '4': 'Admin Tasks',
              }[selectedKey]}
            </Breadcrumb.Item>
          </Breadcrumb>

          <div style={{ padding: 16, background: colorBgContainer, borderRadius: borderRadiusLG }}>
            {selectedKey === '1' && (
              <>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <Statistic title="Total User" value={totalUser} />
                  </Col>
                  <Col xs={24} sm={12}>
                    <Statistic title="Total Todos" value={totalTodos} />
                  </Col>
                </Row>

                <div style={{ marginTop: 40 }}>
                  <h3 className="text-lg font-semibold mb-4">User Traffic Overview</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={trafficData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="users" stroke="#8884d8" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}

            {selectedKey === '2' && (
              <Table
                columns={[
                  { title: 'User Name', dataIndex: 'username', key: 'username' },
                  { title: 'Email', dataIndex: 'email', key: 'email' },
                  { title: 'Role', dataIndex: 'role', key: 'role' },
                  {
                    title: 'Last Login',
                    dataIndex: 'loginInTime',
                    key: 'loginInTime',
                    render: (time) =>
                      time ? new Date(time).toLocaleString() : 'Never logged in',
                  },
                  {
                    title: 'Created At',
                    dataIndex: 'createdAt',
                    key: 'createdAt',
                    render: (time) =>
                      time ? new Date(time).toLocaleString() : 'Never logged in',
                  },
                ]}
                dataSource={userData.filter((user) => user.role === 'User')}
                rowKey="_id"
                bordered
                pagination={{ pageSize: 5 }}
                scroll={{ x: 'max-content' }}
              />
            )}

            {selectedKey === '3' && (
              <div className="flex flex-col gap-4">
                <h2 className="text-lg font-semibold">Admin Profile</h2>
                {loading ? (
                  <Spin tip="Loading..." />
                ) : (
                  <>
                    <p><strong>Name:</strong> {username}</p>
                    <p><strong>Email:</strong> {email}</p>
                    <p><strong>Role:</strong> Admin</p>
                    <Button danger onClick={handleLogout} className='w-[150px]'>Logout</Button>
                  </>
                )}
              </div>
            )}

            {selectedKey === '4' && (
              <>
                <AddAdminSection setAdminCreated={setAdminCreated} />
                <Table
                  columns={[
                    { title: 'Admin Name', dataIndex: 'username', key: 'username' },
                    { title: 'Email', dataIndex: 'email', key: 'email' },
                    { title: 'Role', dataIndex: 'role', key: 'role' },
                    {
                      title: 'Last Login',
                      dataIndex: 'loginInTime',
                      key: 'loginInTime',
                      render: (time) =>
                        time ? new Date(time).toLocaleString() : 'Never logged in',
                    },
                    {
                      title: 'Created At',
                      dataIndex: 'createdAt',
                      key: 'createdAt',
                      render: (time) =>
                        time ? new Date(time).toLocaleString() : 'Never logged in',
                    },
                  ]}
                  dataSource={userData.filter((user) => user.role === 'Admin')}
                  rowKey="_id"
                  bordered
                  pagination={{ pageSize: 5 }}
                  scroll={{ x: 'max-content' }}
                />
              </>
            )}
          </div>
        </Content>

        <Footer style={{ textAlign: 'center' }}>
          Admin Dashboard ©2025 Created by Shubhojit
        </Footer>
      </Layout>
    </Layout>
  );
};

export default AdminDashboard;
