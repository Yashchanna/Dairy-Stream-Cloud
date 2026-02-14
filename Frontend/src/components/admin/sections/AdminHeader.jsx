export default function AdminHeader({ adminName }) {
  return (
    <div className="mb-10">
      <h1 className="text-2xl font-semibold">
        Welcome back, {adminName?.split(" ")[0] || "Admin"}
      </h1>
      <p className="text-sm text-gray-500 mt-1">
        Here’s what’s happening today.
      </p>
    </div>
  );
}
