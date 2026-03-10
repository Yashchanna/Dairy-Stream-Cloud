import React, { useState } from 'react';
import { Plus, Landmark, Droplets } from 'lucide-react';

const ProcurementTracker = ({ suppliers, onAddLog }) => {
  const [log, setLog] = useState({ supplier_id: '', quantity: '', rate: '', fat_content: '' });

  return (
    <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm">
      <h3 className="text-xl font-black mb-6 flex items-center gap-2">
        <Landmark size={24} className="text-blue-600" />
        Milk Procurement
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <select 
          onChange={(e) => setLog({...log, supplier_id: e.target.value})}
          className="p-4 bg-gray-50 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Supplier</option>
          {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        
        <input 
          type="number" placeholder="Quantity (L)" 
          onChange={(e) => setLog({...log, quantity: e.target.value})}
          className="p-4 bg-gray-50 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-blue-500" 
        />
        
        <input 
          type="number" placeholder="Rate /L" 
          onChange={(e) => setLog({...log, rate: e.target.value})}
          className="p-4 bg-gray-50 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-blue-500" 
        />

        <button 
          onClick={() => onAddLog(log)}
          className="bg-blue-600 text-white font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-all"
        >
          <Plus size={20} /> Add Log
        </button>
      </div>

      {/* Simplified List View */}
      <div className="space-y-3">
        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-2">Recent Logs</p>
        <div className="bg-slate-50 rounded-2xl p-4 flex justify-between items-center border border-slate-100">
          <div className="flex items-center gap-3">
            <Droplets className="text-blue-400" size={18} />
            <span className="font-bold">Organic Farm Co.</span>
          </div>
          <span className="font-black text-gray-700">120L @ ₹42/L</span>
          <span className="text-xs font-bold text-gray-400">2 Mins Ago</span>
        </div>
      </div>
    </div>
  );
};

export default ProcurementTracker;