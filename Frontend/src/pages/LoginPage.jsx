import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ShieldCheck, MapPin, Eye, EyeOff, Lock, User } from 'lucide-react';
import dairyImage from "../assets/dairyproduct.png"; // Your original image

// --- MOCK API (We will replace this with your real backend later) ---
const mockDetectAPI = async (identifier) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 1. Staff Detection (Starts with STF)
      if (identifier.toUpperCase().startsWith('STF')) {
        resolve({
          userType: 'STAFF',
          name: 'Staff Member',
          dairyName: 'Nandanvan Dairy',
          isVerified: true,
          nextStep: 'PASSWORD'
        });
      } 
      // 2. Admin Detection (Email)
      else if (identifier.includes('@')) {
        resolve({
          userType: 'ADMIN',
          name: 'Dairy Admin',
          dairyName: 'Shree Dairy',
          nextStep: 'PASSWORD'
        });
      } 
      // 3. Customer Detection (Phone Number)
      else if (identifier.length >= 10) {
        resolve({
          userType: 'CUSTOMER',
          name: 'Valued Customer',
          dairyName: 'Nandanvan Dairy',
          nextStep: 'OTP' // Customers use OTP
        });
      } 
      // 4. Invalid
      else {
        resolve(null);
      }
    }, 1500);
  });
};

const LoginPage = () => {
  const navigate = useNavigate();
  
  // Logic States
  const [step, setStep] = useState('IDENTIFIER'); // IDENTIFIER | PASSWORD | OTP
  const [identifier, setIdentifier] = useState('');
  const [detectedUser, setDetectedUser] = useState(null);
  
  // Input States
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // UI States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // --- HANDLER: SMART DETECT ---
  const handleIdentifierSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!identifier.trim()) {
      setError("Please enter your Email, Mobile, or Staff ID");
      return;
    }

    setLoading(true);

    try {
      const response = await mockDetectAPI(identifier);
      if (response) {
        setDetectedUser(response);
        setStep(response.nextStep);
      } else {
        setError('Account not found. Please register first.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLER: FINAL LOGIN ---
  const handleFinalLogin = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API delay
    setTimeout(() => {
      setLoading(false);
      // Routing Logic
      if (detectedUser.userType === 'CUSTOMER') {
        localStorage.setItem("userRole", "CUSTOMER");
        navigate('/customer-dashboard');
      } 
      else if (detectedUser.userType === 'STAFF') {
        localStorage.setItem("userRole", "STAFF");
        navigate('/staff-dashboard'); // Changed from /staff/home
      } 
      else if (detectedUser.userType === 'ADMIN') {
        localStorage.setItem("userRole", "ADMIN");
        navigate('/admin/AdminDashboard');
      }
    }, 1000);
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-50">
      
      {/* --- LEFT SIDE: SAAS BRANDING --- */}
      {/* Hidden on mobile, visible on medium screens and up */}
      <div className="hidden md:flex w-1/2 bg-blue-600 items-center justify-center p-12 relative overflow-hidden">
        <div className="relative z-10 text-white max-w-lg">
          <h1 className="text-5xl font-bold mb-6 tracking-tight">Dairy Automation</h1>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            The complete fresh milk delivery system. Manage customers, track deliveries, and automate billing in one place.
          </p>
          
          {/* Feature Badges */}
          <div className="flex gap-4">
             <div className="flex items-center gap-2 bg-blue-500/40 px-4 py-2 rounded-lg backdrop-blur-md border border-blue-400/30">
                <ShieldCheck size={20} />
                <span> Register new Dairy</span>
             </div>
             <div className="flex items-center gap-2 bg-blue-500/40 px-4 py-2 rounded-lg backdrop-blur-md border border-blue-400/30">
                <MapPin size={20} />
                <span>Nearby Dairies</span>
             </div>
          </div>
        </div>
        {/* Decorative Circle */}
        <div className="absolute -bottom-40 -right-20 w-96 h-96 bg-blue-400/30 rounded-full blur-3xl"></div>
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl"></div>
      </div>

      {/* --- RIGHT SIDE: LOGIN FORM --- */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-6 md:p-12 bg-white">
        
        <div className="w-full max-w-md">
          
          {/* 1. BRANDING HEADER (From your CustomerLogin.jsx) */}
          <div className="text-center mb-8">
            <img 
              src={dairyImage} 
              alt="Dairy Delivery" 
              className="h-20 w-auto mx-auto mb-4 object-contain drop-shadow-sm" 
            />
            <h2 className="text-2xl font-bold text-gray-900">DAIRY AUTOMATION</h2>
            <p className="text-gray-500 font-medium">Fresh Milk Delivery System</p>
            
            {/* Context Badge (Shows only after detection) */}
            {detectedUser && (
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 text-sm font-semibold rounded-full border border-green-200">
                <ShieldCheck size={14} />
                Verified: {detectedUser.dairyName}
              </div>
            )}
          </div>

          {/* 2. ERROR ALERT */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* 3. CARD CONTAINER */}
          <div className="bg-white">
            
            {/* --- STEP 1: SMART IDENTIFIER --- */}
            {step === 'IDENTIFIER' && (
              <form onSubmit={handleIdentifierSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Email, Mobile or Staff ID
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <User size={18} />
                    </div>
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="Enter email or phone or staff ID"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-sm transition-all flex justify-center items-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : "Continue"}
                </button>
              </form>
            )}

            {/* --- STEP 2: PASSWORD (Staff/Admin) --- */}
            {step === 'PASSWORD' && (
              <form onSubmit={handleFinalLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Enter Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Lock size={18} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer">
                      <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" />
                      Remember me
                    </label>
                    <a href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-700">Forgot Password?</a>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-sm transition-all flex justify-center items-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : "Login"}
                </button>
                
                <button 
                  type="button"
                  onClick={() => { setStep('IDENTIFIER'); setDetectedUser(null); setPassword(''); }}
                  className="w-full text-gray-500 text-sm hover:text-gray-700 py-2"
                >
                  ← Back to Identifier
                </button>
              </form>
            )}

            {/* --- STEP 3: OTP (Customer) --- */}
            {step === 'OTP' && (
              <form onSubmit={handleFinalLogin} className="space-y-5">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    We sent a 6-digit code to <span className="font-semibold text-gray-900">{identifier}</span>
                  </p>
                  <input
                    type="text"
                    maxLength="6"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="000000"
                    className="w-full text-center text-2xl font-bold tracking-[0.5em] py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                    autoFocus
                  />
                  <div className="mt-2 text-xs text-gray-400">
                    Resend OTP in 30s
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg shadow-sm transition-all flex justify-center items-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : "Verify OTP"}
                </button>
                
                <button 
                  type="button"
                  onClick={() => { setStep('IDENTIFIER'); setDetectedUser(null); setOtp(''); }}
                  className="w-full text-gray-500 text-sm hover:text-gray-700 py-2"
                >
                  ← Change Mobile Number
                </button>
              </form>
            )}

            {/* --- DIVIDER & REGISTER --- */}
            {step === 'IDENTIFIER' && (
              <>
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Don't have an account?</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/register')}
                  className="w-full bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3 rounded-lg transition-all"
                >
                  Create New Account
                </button>
              </>
            )}

            {/* --- FOOTER LINKS --- */}
            <div className="flex justify-center gap-6 mt-8 text-xs text-gray-400">
               <a href="#" className="hover:text-gray-600 transition">Help</a>
               <a href="#" className="hover:text-gray-600 transition">Privacy</a>
               <a href="#" className="hover:text-gray-600 transition">Terms</a>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;