import React from 'react';
import { AlertTriangle, UserX } from 'lucide-react';

const DeliveryExceptionDashboard = ({ exceptions }) => {
  return (
    <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-red-50 text-red-500 rounded-lg"><AlertTriangle size={20}/></div>
        <h3 className="text-xl font-black">Delivery Exceptions</h3>
      </div>

      <div className="space-y-3">
        {exceptions.map((exc, idx) => (
          <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-red-400"><UserX size={20}/></div>
              <div>
                <p className="font-bold text-gray-800">{exc.customer_name}</p>
                <p className="text-[10px] font-black text-red-500 uppercase tracking-tighter">
                  {exc.notes?.split('FAILED_REASON]: ')[1] || 'Unknown Reason'}
                </p>
              </div>
            </div>
            <button className="text-xs font-black text-blue-600 uppercase bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100">
              Reschedule
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeliveryExceptionDashboard;