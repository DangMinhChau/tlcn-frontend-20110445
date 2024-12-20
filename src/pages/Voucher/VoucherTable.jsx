import { Button, Modal, Space, Table, Tag, Input } from "antd";
import React, { useState, useEffect } from "react";
import { useContext } from "react";
import AuthContext from "../../store/authCtx";
import { SearchOutlined } from "@ant-design/icons";
import { deleteVoucher, getAllVoucherAdmin } from "../../api/discountAPI";
const { confirm } = Modal;
const success = (mes) => {
  Modal.success({
    title: "SUCCESS",
    content: mes,
    closable: true,
  });
};
const error = (mes) => {
  Modal.error({
    title: "ERROR",
    content: mes,
    closable: true,
  });
};
const VoucherTable = (props) => {
  const authCtx = useContext(AuthContext);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    fetchVouchers({
      current: pagination.current,
      pageSize: pagination.pageSize,
      isActive: true, // Default show active vouchers
    });
  }, [props.reload]);

  const fetchVouchers = async (params = {}) => {
    setLoading(true);
    try {
      const { current, pageSize, sortField, sortOrder, name, isActive } =
        params;

      let query = `?page=${current}&limit=${pageSize}`;

      if (sortField) {
        const order = sortOrder === "descend" ? "-" : "";
        query += `&sort=${order}${sortField}`;
      }

      if (name) query += `&name=${name}`;
      if (isActive !== undefined) query += `&isActive=${isActive}`;

      const res = await getAllVoucherAdmin(authCtx.token, query);
      setVouchers(res.data.data);
      setPagination({
        ...pagination,
        total: res.pagination.total,
      });
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    fetchVouchers({
      current: pagination.current,
      pageSize: pagination.pageSize,
      name: selectedKeys[0],
      isActive: true,
    });
  };

  // Add reset handler
  const handleReset = (clearFilters) => {
    clearFilters();
    fetchVouchers({
      current: pagination.current,
      pageSize: pagination.pageSize,
      isActive: true,
    });
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
  const showDeleteConfirm = (voucher) => {
    confirm({
      title: `Bạn có chắc muốn vô hiệu hóa voucher ${voucher.name}?`,
      content: "Voucher sẽ không thể sử dụng sau khi vô hiệu hóa",
      okText: "Vô hiệu hóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk() {
        return deleteVoucher(authCtx.token, voucher._id)
          .then(() => {
            fetchVouchers({
              current: pagination.current,
              pageSize: pagination.pageSize,
            });
            success("Vô hiệu hóa voucher thành công");
          })
          .catch((err) => {
            error(err.response?.data?.message || "Có lỗi xảy ra");
          });
      },
    });
  };
  const handleTableChange = (newPagination, filters, sorter) => {
    fetchVouchers({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
      sortField: sorter.field,
      sortOrder: sorter.order,
      isActive: filters.isActive?.[0],
    });
  };
  const columns = [
    {
      title: "Tên mã",
      dataIndex: "name",
      key: "name",
      ...getColumnSearchProps("name"),
    },
    {
      title: "Giảm",
      dataIndex: "discount",
      key: "discount",
      sorter: (a, b) => a.discount - b.discount,
      render: (_, record) => (
        <p>
          -
          {record.discount.toLocaleString("vi", {
            style: "currency",
            currency: "VND",
          })}
        </p>
      ),
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
      sorter: (a, b) => new Date(a.startDate) - new Date(b.startDate),
      render: (_, record) => (
        <p>{new Date(record.startDate).toLocaleDateString("en-US")}</p>
      ),
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "expireDate",
      key: "expireDate",
      sorter: (a, b) => new Date(a.expireDate) - new Date(b.expireDate),
      render: (_, record) => (
        <p
          className={`${
            new Date(Date.now()) > new Date(record.expireDate)
              ? "text-[#ff006e]"
              : "text-[#48cae4]"
          }`}
        >
          {new Date(record.expireDate).toLocaleDateString("en-US")}
        </p>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      filters: [
        { text: "Đang hoạt động", value: true },
        { text: "Đã vô hiệu hóa", value: false },
      ],
      defaultFilteredValue: ["true"],
      render: (_, record) => (
        <Tag color={record.isActive ? "success" : "error"}>
          {record.isActive ? "Đang hoạt động" : "Đã vô hiệu hóa"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            danger
            onClick={() => showDeleteConfirm(record)}
            disabled={!record.isActive}
          >
            Vô hiệu hóa
          </Button>
        </Space>
      ),
    },
  ];
  return (
    <div>
      <Table
        columns={columns}
        dataSource={vouchers}
        pagination={pagination}
        loading={loading}
        onChange={handleTableChange}
        rowClassName={(record) => (!record.isActive ? "opacity-50" : "")}
      />
    </div>
  );
};

export default VoucherTable;
