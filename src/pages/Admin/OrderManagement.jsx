import React, { useContext, useEffect, useState } from "react";
import AuthContext from "../../store/authCtx";
import {
  acceptOrder,
  completeOrder,
  deleteOrder,
  getAllOrdersAdmin,
} from "../../api/orderAPI";
import { Button, Table, Tag, notification, Input, Space } from "antd";
import ExpendedOrderTable from "../Order/ExpendedOrderTable";
import OrderUpdateStatusForm from "../Order/OrderUpdateStatusForm";
import { SearchOutlined } from "@ant-design/icons";

const OrderManagement = () => {
  const authCtx = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [order, setOrder] = useState({});
  const [api, contextHolder] = notification.useNotification();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const openNotificationWithIcon = (type, message, description) => {
    api[type]({
      message: message,
      description: description,
    });
  };

  useEffect(() => {
    fetchOrders({
      current: pagination.current,
      pageSize: pagination.pageSize,
    });
  }, []);

  const fetchOrders = async (params = {}) => {
    setLoading(true);
    try {
      const {
        current,
        pageSize,
        orderStatus,
        paymentMethod,
        sortField,
        sortOrder,
        orderId,
      } = params;

      let query = `?page=${current}&limit=${pageSize}`;
      if (orderStatus) query += `&orderStatus=${orderStatus}`;
      if (paymentMethod) query += `&paymentMethod=${paymentMethod}`;
      if (orderId) query += `&_id=${orderId}`;
      if (sortField) {
        query += `&sort=${sortOrder === "descend" ? "-" : ""}${sortField}`;
      }

      const res = await getAllOrdersAdmin(authCtx.token, query);
      setOrders(res.data.data);
      setPagination({
        ...pagination,
        total: res.pagination.total,
      });
    } catch (err) {
      openNotificationWithIcon(
        "error",
        "Failed to load orders",
        err.response?.data?.message
      );
    } finally {
      setLoading(false);
    }
  };
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={`Tìm ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ width: 188, marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Tìm
          </Button>
          <Button
            onClick={() => handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
  });
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    fetchOrders({
      current: pagination.current,
      pageSize: pagination.pageSize,
      orderId: selectedKeys[0],
    });
  };

  // Add reset handler
  const handleReset = (clearFilters) => {
    clearFilters();
    fetchOrders({
      current: pagination.current,
      pageSize: pagination.pageSize,
    });
  };
  // Handle table change (sorting, filtering, pagination)
  const handleTableChange = (newPagination, filters, sorter) => {
    fetchOrders({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
      orderStatus: filters.orderStatus?.[0],
      paymentMethod: filters.paymentMethod?.[0],
      sortField: sorter.field,
      sortOrder: sorter.order,
    });
  };

  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "_id",
      key: "_id",
      width: "15%",
      ...getColumnSearchProps("_id"),
      render: (text) => <span style={{ fontFamily: "monospace" }}>{text}</span>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (_, record) => <p>{record.user?.email}</p>,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: true,
      render: (_, record) => (
        <p>{new Date(record.createdAt).toLocaleString("en-GB")}</p>
      ),
    },
    {
      title: "Phương thức thanh toán",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      filters: [
        {
          text: "COD",
          value: "COD",
        },
        {
          text: "PayPal",
          value: "PayPal",
        },
      ],
    },
    {
      title: "Tổng cộng",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (_, record) => (
        <p>
          {(
            record.totalPrice +
            record.shippingPrice -
            (record.voucher ? record.voucher.discount : 0)
          ).toLocaleString("vi", { style: "currency", currency: "VND" })}
        </p>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "orderStatus",
      key: "orderStatus",
      render: (_, record) => (
        <Tag
          color={
            record.orderStatus === "done"
              ? "green"
              : record.orderStatus === "fail"
              ? "red"
              : record.orderStatus === "processing"
              ? "blue"
              : "orange"
          }
        >
          {record.orderStatus === "new"
            ? "Chờ xác nhận"
            : record.orderStatus === "processing"
            ? "Đang xử lý"
            : record.orderStatus === "done"
            ? "Hoàn thành"
            : "Đã hủy"}
        </Tag>
      ),
      filters: [
        {
          text: "Chờ xác nhận",
          value: "new",
        },
        {
          text: "Đang xử lý",
          value: "processing",
        },
        {
          text: "Hoàn thành",
          value: "done",
        },
        {
          text: "Đã hủy",
          value: "fail",
        },
      ],
    },
    {
      title: "Cập nhật trạng thái",
      key: "updateStatus",
      render: (_, record) => (
        <Button
          onClick={() => {
            setOpen(true);
            setOrder(record);
          }}
        >
          Cập nhật
        </Button>
      ),
    },
  ];
  const onCreate = async (values) => {
    setActionLoading(true);
    try {
      if (values.orderStatus === "processing") {
        await acceptOrder(authCtx.token, order._id);
        openNotificationWithIcon("success", "Xác nhận đơn hàng thành công", "");
      } else if (values.orderStatus === "done") {
        await completeOrder(authCtx.token, order._id);
        openNotificationWithIcon(
          "success",
          "Hoàn thành đơn hàng thành công",
          ""
        );
      } else {
        await deleteOrder(authCtx.token, order._id);
        openNotificationWithIcon("success", "Hủy đơn hàng thành công", "");
      }
      setOpen(false);
      fetchOrders({
        current: pagination.current,
        pageSize: pagination.pageSize,
      });
    } catch (err) {
      openNotificationWithIcon(
        "error",
        "Thao tác thất bại",
        err.response?.data?.message
      );
    } finally {
      setActionLoading(false);
    }
  };
  return (
    <div className="p-6">
      {contextHolder}
      <OrderUpdateStatusForm
        open={open}
        onCreate={onCreate}
        onCancel={() => {
          setOpen(false);
        }}
        order={order}
        confirmLoading={actionLoading}
      />
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Quản lý đơn hàng</h1>
      </div>
      <Table
        columns={columns}
        dataSource={orders}
        bordered
        rowKey={(record) => record._id}
        onChange={handleTableChange}
        expandable={{
          expandedRowRender: (record) => <ExpendedOrderTable order={record} />,
        }}
        loading={loading}
      />
    </div>
  );
};

export default OrderManagement;
