export default function AdminMobileTopbar({ adminName, onMenu }) {
  return (
    <div className="lg:hidden sticky top-0 z-30 bg-white border-b px-4 py-3 flex justify-between items-center">
      <button onClick={onMenu} className="text-xl">☰</button>

      <span className="font-semibold text-blue-600">
        DairyStream
      </span>

      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-medium">
        {adminName?.charAt(0) || "A"}
      </div>
    </div>
  );
}
