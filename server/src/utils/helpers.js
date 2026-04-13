export const generateAgentCode = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

export const generateBookingNo = () => {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `BK-${num}`;
};

export const generateVoucherId = () => {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `VCH-${num}`;
};

export const formatCurrency = (amount, currency = "PKR") => {
  return `${currency} ${Number(amount).toLocaleString()}`;
};
