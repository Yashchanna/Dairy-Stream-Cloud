export default function AdminFinancialAlert({ amount }) {
  return (
    <section className="mb-14">
      <div className="bg-red-50 border border-red-100 rounded-xl p-6">
        <p className="text-sm text-red-700">
          Outstanding payments
        </p>
        <p className="text-2xl font-semibold text-red-600 mt-2">
          ₹{amount}
        </p>
      </div>
    </section>
  );
}
