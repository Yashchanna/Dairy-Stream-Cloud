export default function AdminDashboardSkeleton() {
  return (
    <div className="space-y-10 animate-pulse">
      {/* Header */}
      <div className="h-8 w-48 bg-gray-200 rounded" />

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-28 bg-gray-200 rounded-xl" />
        ))}
      </div>

      {/* Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="h-40 bg-gray-200 rounded-xl" />
        <div className="h-40 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}
