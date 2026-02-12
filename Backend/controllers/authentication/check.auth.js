export const detectUser = async (req, res) => {
  res.json({ exists: false, nextStep: "REGISTER" });
};

export const passwordLogin = async (req, res) => {
  res.json({ success: true });
};

export const requestOtp = async (req, res) => {
  res.json({ success: true });
};

export const verifyOtpLogin = async (req, res) => {
  res.json({ success: true });
};
