import { Button, Modal } from "antd";
import React, { useContext, useState } from "react";
import AuthContext from "../../store/authCtx";
import CreateVoucherForm from "./CreateVoucherForm";
import { createVoucher } from "../../api/discountAPI";

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
const CreateVoucher = ({ setReload }) => {
  const authCtx = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const onCreate = (values) => {
    const data = {
      name: values.name.toUpperCase(),
      startDate: new Date(values.duration[0].$d).toLocaleDateString("en-US"),
      expireDate: new Date(values.duration[1].$d).toLocaleDateString("en-US"),
      discount: values.discount,
    };
    createVoucher(authCtx.token, data)
      .then((res) => {
        setReload((old) => !old);
        success("Tạo thành công");
        setOpen(false);
      })
      .catch((err) => {
        error(err.response.data.message);
        console.log(err.response.data.message);
      });
  };
  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Quản lý Voucher</h1>
        <Button
          type="primary"
          onClick={() => {
            setOpen(true);
          }}
        >
          Thêm voucher
        </Button>
      </div>
      <CreateVoucherForm
        open={open}
        onCreate={onCreate}
        onCancel={() => {
          setOpen(false);
        }}
      />
    </div>
  );
};

export default CreateVoucher;
