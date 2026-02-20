import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Import useNavigate
import CustomerLayout from '../../components/customer/layouts/CustomerLayout';
import { CheckCircle, XCircle, Clock, Loader2, MapPin } from 'lucide-react';
import { fetchCustomerDeliveries } from '../../api/customer.api.js';

const Deliveries = () => {
  const navigate = useNavigate(); // 2. Initialize navigate
  const [deliveries, setDeliveries] = useState([]);
  const [todayDelivery, setTodayDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ... (fetchDeliveries function stays the same)

  return (
    <CustomerLayout>
      <div className="space-y-8">
        {/* ... (Header and Error sections stay the same) */}

        {todayDelivery && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <p className="text-xs uppercase tracking-wide text-gray-400">Today's Delivery</p>
            <div className="mt-2 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {todayDelivery.quantity || '-'} {todayDelivery.product || 'Milk'}
                </h3>
                <p className="text-sm mt-1">
                  Status:{' '}
                  <span className={(todayDelivery.status || 'PENDING') === 'PENDING' ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                    {todayDelivery.status || 'PENDING'}
                  </span>
                </p>
              </div>

              {/* 3. Updated Button to navigate and pass agent data */}
              <button
                onClick={() => navigate('/customer/track-agent', { state: { delivery: todayDelivery } })}
                className="flex items-center justify-center gap-2 text-sm font-semibold text-white bg-blue-600 px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200"
                disabled={!todayDelivery?.canTrackAgent}
              >
                <MapPin size={16} />
                Track Agent
              </button>
            </div>
          </div>
        )}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10">
            <div className="flex flex-col items-center justify-center gap-3 text-gray-500">
              <Loader2 size={28} className="animate-spin text-blue-600" />
              <p className="text-sm font-medium">Loading deliveries...</p>
            </div>
          </div>
        ) : (

          <div className="grid gap-5">

            {deliveries.length === 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-gray-600">
                No deliveries found yet.
              </div>
            )}

            {deliveries.map((item) => (

              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6"
              >

                {/* Left Section */}
                <div className="space-y-1">

                  <p className="text-xs uppercase tracking-wide text-gray-400">
                    {item.date}
                  </p>

                  <h3 className="text-lg font-semibold text-gray-900">
                    {item.qty} {item.product}
                  </h3>

                  {item.time && (
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock size={14} />
                      Dropped at {item.time}
                    </p>
                  )}
                </div>

                {/* Right Status Card Style */}
                {item.status === 'DELIVERED' && (
                  <div className="bg-green-50 px-6 py-4 rounded-xl flex items-center gap-3 text-green-700 font-medium">
                    <CheckCircle size={22} />
                    Delivered Successfully
                  </div>
                )}

                {item.status === 'SKIPPED' && (
                  <div className="bg-red-50 px-6 py-4 rounded-xl flex items-center gap-3 text-red-600 font-medium">
                    <XCircle size={22} />
                    Delivery Skipped
                  </div>
                )}

                {item.status === 'PENDING' && (
                  <div className="bg-red-50 px-6 py-4 rounded-xl flex items-center gap-3 text-red-600 font-medium">
                    <Clock size={22} />
                    Pending Delivery
                  </div>
                )}

              </div>

            ))}

          </div>
        )}

      </div>
    </CustomerLayout>
  );
};

export default Deliveries;
