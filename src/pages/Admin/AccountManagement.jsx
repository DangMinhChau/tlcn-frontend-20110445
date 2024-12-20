import React, { useEffect, useContext, useState } from "react";
import { getAllUser, lockUser, unlockUser } from "../../api/userAPI";
import AuthContext from "../../store/authCtx";
import { Avatar, Switch, Table, Tag, Input } from "antd";

const { Column } = Table;
const { Search } = Input;

const AccountManagement = () => {
  const authCtx = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    email: "",
    role: undefined,
    isLocked: undefined,
  });
  const fetchUsers = async (params = {}) => {
    setLoading(true);
    try {
      const { current, pageSize, email, role, isLocked } = params;
      let query = `?page=${current}&limit=${pageSize}`;

      if (email) query += `&email=${email}`;
      if (role) query += `&role=${role}`;
      if (isLocked !== undefined) query += `&isLocked=${isLocked}`;

      const res = await getAllUser(authCtx.token, query);
      setUsers(res.data.data);
      setPagination({
        ...pagination,
        total: res.totalPage * pageSize,
      });
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchUsers({
      current: pagination.current,
      pageSize: pagination.pageSize,
      ...filters,
    });
  }, [filters, pagination.current]);
  const handleTableChange = (newPagination, filters) => {
    fetchUsers({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
      ...filters,
    });
  };

  const handleSearch = (value) => {
    setFilters((prev) => ({ ...prev, email: value }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleToggleLock = async (checked, record) => {
    setActionLoading((prev) => ({ ...prev, [record._id]: true }));
    try {
      if (checked) {
        await unlockUser(authCtx.token, record._id);
      } else {
        await lockUser(authCtx.token, record._id);
      }
      // Refresh data after successful toggle
      fetchUsers({
        current: pagination.current,
        pageSize: pagination.pageSize,
      });
    } catch (err) {
      console.log(err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [record._id]: false }));
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Quản lý tài khoản</h1>
        <Search
          placeholder="Tìm kiếm theo email"
          allowClear
          onSearch={handleSearch}
          style={{ width: 300 }}
        />
      </div>
      <Table
        dataSource={users}
        rowKey={(record) => record._id}
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
      >
        <Column
          title="Hình đại diện"
          dataIndex="photo"
          key="photo"
          render={(photo) => <Avatar src={photo} />}
        />
        <Column title="Tên" dataIndex="firstName" key="firstName" />
        <Column title="Họ" dataIndex="lastName" key="lastName" />
        <Column title="Email" dataIndex="email" key="email" />
        <Column title="Vai trò" dataIndex="role" key="role" />
        <Column
          title="Trạng thái"
          dataIndex="isLocked"
          key="isLocked"
          render={(isLocked) =>
            isLocked === false ? (
              <Tag color="success">Hoạt động</Tag>
            ) : (
              <Tag color="error">Đã Khóa</Tag>
            )
          }
          filters={[
            {
              text: "Hoạt động",
              value: false,
            },
            {
              text: "Đã Khóa",
              value: true,
            },
          ]}
          onFilter={(value, record) => record.isLocked === value}
          filtered={true}
        />
        <Column
          title="Khóa"
          dataIndex="isLocked"
          key="isLocked"
          render={(isLocked, record, index) => (
            <Switch
              checked={!record.isLocked}
              onChange={(checked) => handleToggleLock(checked, record)}
              loading={actionLoading[record._id]}
              disabled={actionLoading[record._id]}
            />
          )}
        />
      </Table>
    </div>
  );
};

export default AccountManagement;
