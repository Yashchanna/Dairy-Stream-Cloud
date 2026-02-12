export default function StatCard({ label, value, color }) {
  return (
    <div
      className={`rounded-2xl p-6 shadow-sm text-center animate-fade-up ${color}`}
    >
      <p className="text-sm opacity-70 mb-1">{label}</p>
      <h2 className="text-2xl font-semibold">{value}</h2>
    </div>
  );
}
