import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  MapPin,
  ShieldCheck,
  Clock,
  Truck,
} from "lucide-react";

/* MOCK DATA */
const MOCK_DAIRIES = [
  {
    id: "D001",
    name: "Nandanvan Farms",
    rating: 4.8,
    reviews: 124,
    distance: "1.2 km",
    isVerified: true,
    isTrusted: true,
    slots: ["Morning", "Evening"],
    image:
      "https://images.unsplash.com/photo-1528498033373-3c6c08e93d79?auto=format&fit=crop&q=80&w=1600",
    address: "Kothrud, Pune",
    minPrice: 60,
    description:
      "Fresh farm milk delivered daily with strict hygiene, quality checks, and reliable delivery.",
  },
  {
    id: "D002",
    name: "Pure Desi Milk",
    rating: 4.2,
    reviews: 85,
    distance: "3.5 km",
    isVerified: true,
    isTrusted: false,
    slots: ["Morning Only"],
    image:
      "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=1600",
    address: "Baner, Pune",
    minPrice: 55,
    description:
      "Affordable desi cow milk sourced directly from trusted local farms.",
  },
  {
    id: "D003",
    name: "Gokul Dairy",
    rating: 4.5,
    reviews: 210,
    distance: "0.8 km",
    isVerified: true,
    isTrusted: true,
    slots: ["Morning", "Evening"],
    image:
      "https://images.unsplash.com/photo-1596733430282-743a35525829?auto=format&fit=crop&q=80&w=1600",
    address: "Deccan, Pune",
    minPrice: 58,
    description:
      "Well-known dairy providing fresh milk with consistent quality for years.",
  },
];

const DairyDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const dairy = MOCK_DAIRIES.find((d) => d.id === id);

  if (!dairy) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <h2 className="text-xl font-bold text-gray-900">
          Dairy not found
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-blue-600 font-semibold"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-50">

      {/* HEADER */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-20">
        <div className="w-full px-6 lg:px-10 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-100 active:scale-95 transition"
          >
            <ArrowLeft />
          </button>
          <h1 className="text-xl font-bold text-gray-900">
            {dairy.name}
          </h1>
        </div>
      </div>

      {/* CONTENT */}
      <div className="w-full px-6 lg:px-10 py-6 grid lg:grid-cols-3 gap-8">

        {/* LEFT SIDE */}
        <div className="lg:col-span-2">

          {/* HERO IMAGE */}
          <img
            src={dairy.image}
            alt={dairy.name}
            loading="lazy"
            className="w-full h-[420px] lg:h-[500px] object-cover rounded-2xl shadow-sm bg-gray-100"
          />

          {/* ABOUT */}
          <div className="bg-white rounded-2xl p-6 mt-6 shadow-sm">
            <h2 className="text-lg font-bold mb-2">
              About this Dairy
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {dairy.description}
            </p>
          </div>

        </div>

        {/* RIGHT SIDE CARD */}
        <div className="bg-white rounded-2xl shadow-sm p-6 h-fit lg:sticky lg:top-24">

          {/* RATING */}
          <div className="flex items-center gap-2 mb-3">
            <div
              aria-label={`Rating ${dairy.rating} out of 5`}
              className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded text-sm font-bold text-green-700"
            >
              {dairy.rating}
              <Star size={14} fill="currentColor" />
            </div>
            <span className="text-sm text-gray-500">
              ({dairy.reviews} reviews)
            </span>
          </div>

          {/* ADDRESS */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <MapPin size={16} />
            {dairy.address}
          </div>

          {/* DISTANCE */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Clock size={16} />
            {dairy.distance}
          </div>

          {/* TAGS */}
          <div className="flex flex-wrap gap-2 mb-4">
            {dairy.isVerified && (
              <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                <ShieldCheck size={12} />
                Verified
              </span>
            )}
            {dairy.isTrusted && (
              <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded">
                Trusted
              </span>
            )}
            <span className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
              <Truck size={12} />
              Daily Delivery
            </span>
          </div>

          {/* DELIVERY SLOTS */}
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-1">
              Delivery Slots
            </p>
            <div className="flex gap-2 flex-wrap">
              {dairy.slots.map((slot, index) => (
                <span
                  key={`${dairy.id}-slot-${index}`}
                  className="text-xs bg-gray-100 px-3 py-1 rounded-full"
                >
                  {slot}
                </span>
              ))}
            </div>
          </div>

          {/* PRICE */}
          <div className="border-t pt-4 mb-4">
            <p className="text-sm text-gray-500">
              Starting at
            </p>
            <p className="text-2xl font-bold text-gray-900">
              ₹{dairy.minPrice}
              <span className="text-sm font-normal text-gray-500">
                /L
              </span>
            </p>
          </div>

          {/* CTA */}
          <button
            onClick={() => navigate(`/subscribe/${dairy.id}`)}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 active:scale-95 transition flex items-center justify-center gap-2"
          >
            <Truck size={18} />
            Subscribe Now
          </button>

        </div>
      </div>
    </div>
  );
};

export default DairyDetailsPage;
