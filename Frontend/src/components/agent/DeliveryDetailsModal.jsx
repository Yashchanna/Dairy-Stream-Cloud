import React, { useState, useRef } from 'react';
import { X, Package, MapPin, Phone, User, Building2, Camera, Upload, Check } from 'lucide-react';

const DeliveryDetailsModal = ({ delivery, onClose, onProofSubmit }) => {
  const [showProofForm, setShowProofForm] = useState(false);
  const [proofType, setProofType] = useState('PHOTO'); // PHOTO or OTP
  const [otp, setOtp] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  if (!delivery) return null;

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProofSubmit = async () => {
    if (proofType === 'PHOTO' && !image) {
      alert('Please upload a photo');
      return;
    }
    if (proofType === 'OTP' && !otp.trim()) {
      alert('Please enter the OTP');
      return;
    }

    setIsSubmitting(true);
    try {
      await onProofSubmit({
        deliveryId: delivery.id,
        proofType,
        photo: image,
        otp: proofType === 'OTP' ? otp : null,
      });
      setShowProofForm(false);
      setOtp('');
      setImage(null);
      setImagePreview(null);
    } catch (error) {
      console.error('Error submitting proof:', error);
      alert('Failed to submit proof. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800">Delivery Details</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Status</span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                delivery.status === 'COMPLETED'
                  ? 'bg-green-100 text-green-700'
                  : delivery.status === 'FAILED'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              {delivery.status}
            </span>
          </div>

          {/* Delivery Info */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Package className="text-blue-600 mt-1" size={20} />
              <div>
                <p className="text-sm text-gray-600">Quantity</p>
                <p className="font-semibold text-gray-800">{delivery.quantity}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User className="text-blue-600 mt-1" size={20} />
              <div>
                <p className="text-sm text-gray-600">Customer Name</p>
                <p className="font-semibold text-gray-800">{delivery.customerName}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="text-blue-600 mt-1" size={20} />
              <div>
                <p className="text-sm text-gray-600">Phone Number</p>
                <p className="font-semibold text-gray-800">{delivery.phoneNumber}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="text-blue-600 mt-1" size={20} />
              <div>
                <p className="text-sm text-gray-600">Delivery Address</p>
                <p className="font-semibold text-gray-800">{delivery.address}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Building2 className="text-blue-600 mt-1" size={20} />
              <div>
                <p className="text-sm text-gray-600">Dairy Farm</p>
                <p className="font-semibold text-gray-800">
                  {delivery.dairyFarmName} (ID: {delivery.dairyFarmId})
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Farm Phone: {delivery.farmPhoneNumber}
                </p>
              </div>
            </div>
          </div>

          {/* Failed Reason (if applicable) */}
          {delivery.status === 'FAILED' && delivery.failedReason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm font-medium text-red-800 mb-1">Failed Reason:</p>
              <p className="text-sm text-red-700">{delivery.failedReason}</p>
              {delivery.failedReasonDetails && (
                <p className="text-sm text-red-600 mt-2">{delivery.failedReasonDetails}</p>
              )}
              {delivery.failedImage && (
                <img
                  src={delivery.failedImage}
                  alt="Failed delivery"
                  className="mt-3 rounded-lg max-h-48 w-full object-cover"
                />
              )}
            </div>
          )}

          {/* Delivery Proof Section */}
          {delivery.status !== 'FAILED' && !showProofForm && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-800 mb-3">Delivery Proof</p>
              {delivery.status === 'COMPLETED' && delivery.proofType ? (
                <div className="flex items-center gap-2 text-green-700">
                  <Check size={20} />
                  <span className="text-sm">
                    Proof submitted ({delivery.proofType})
                  </span>
                </div>
              ) : delivery.status === 'PENDING' ? (
                <button
                  onClick={() => setShowProofForm(true)}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium transition-colors text-sm"
                >
                  Submit Delivery Proof
                </button>
              ) : null}
            </div>
          )}

          {/* Proof Form */}
          {showProofForm && (
            <div className="border-2 border-blue-300 rounded-lg p-4 space-y-4 bg-blue-50">
              <h4 className="font-semibold text-gray-800">Submit Delivery Proof</h4>

              {/* Proof Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proof Type <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 flex-1">
                    <input
                      type="radio"
                      value="PHOTO"
                      checked={proofType === 'PHOTO'}
                      onChange={(e) => {
                        setProofType(e.target.value);
                        setOtp('');
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">Photo</span>
                  </label>
                  <label className="flex items-center gap-2 flex-1">
                    <input
                      type="radio"
                      value="OTP"
                      checked={proofType === 'OTP'}
                      onChange={(e) => {
                        setProofType(e.target.value);
                        setImage(null);
                        setImagePreview(null);
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">OTP</span>
                  </label>
                </div>
              </div>

              {/* Photo Upload */}
              {proofType === 'PHOTO' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Delivery Photo
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => cameraInputRef.current?.click()}
                      className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg p-3 hover:border-blue-500 hover:bg-white transition-colors"
                    >
                      <Camera size={18} />
                      <span className="text-sm">Camera</span>
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg p-3 hover:border-blue-500 hover:bg-white transition-colors"
                    >
                      <Upload size={18} />
                      <span className="text-sm">Upload</span>
                    </button>
                  </div>

                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="camera"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                  {imagePreview && (
                    <div className="mt-3 relative">
                      <img
                        src={imagePreview}
                        alt="Proof"
                        className="w-full rounded-lg max-h-40 object-cover"
                      />
                      <button
                        onClick={() => {
                          setImage(null);
                          setImagePreview(null);
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* OTP Input */}
              {proofType === 'OTP' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter OTP Confirmation
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.toUpperCase())}
                    placeholder="Enter 6-digit OTP"
                    maxLength={10}
                    className="w-full border border-gray-300 rounded-lg p-3 font-mono text-center text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-600 mt-2">
                    Ask customer for OTP confirmation
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowProofForm(false);
                    setOtp('');
                    setImage(null);
                    setImagePreview(null);
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors text-sm"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleProofSubmit}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-medium transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting || (proofType === 'PHOTO' && !image) || (proofType === 'OTP' && !otp)}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Proof'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4">
          <button
            onClick={onClose}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDetailsModal;
