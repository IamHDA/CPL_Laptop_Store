export const SHOP_BANK = {
  bankId: "MB",
  accountNo: "0123456789",
  accountName: "LAPTOP STORE",
  template: "compact2",
};

export function buildVietQRUrl(amount, addInfo) {
  const bankId = SHOP_BANK.bankId;
  const accountNo = SHOP_BANK.accountNo;
  const template = SHOP_BANK.template;
  const accountName = encodeURIComponent(SHOP_BANK.accountName);
  const info = encodeURIComponent(addInfo || "Thanh toan don hang");

  return `https://img.vietqr.io/image/${bankId}-${accountNo}-${template}.png?amount=${amount}&addInfo=${info}&accountName=${accountName}`;
}
