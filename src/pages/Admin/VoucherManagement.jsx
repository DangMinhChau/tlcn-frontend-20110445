import React, { useState } from "react";
import VoucherTable from "../Voucher/VoucherTable";
import CreateVoucher from "../Voucher/CreateVoucher";

const VoucherManagement = () => {
  const [reload, setReload] = useState(false);
  return (
    <div className="p-6">
      <div>
        <CreateVoucher setReload={setReload} />
      </div>
      <div>
        <VoucherTable reload={reload} />
      </div>
    </div>
  );
};

export default VoucherManagement;
