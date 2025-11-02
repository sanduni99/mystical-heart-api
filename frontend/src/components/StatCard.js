import React from 'react';

export default function StatCard({ icon, label, value }) {
  return (
    <div className="p-3 text-center bg-black bg-opacity-20 rounded-xl">
      <div className="mb-1 text-2xl">{icon}</div>
      <div className="text-xs text-black opacity-75">{label}</div>
      <div className="text-lg font-bold text-black">{value}</div>
    </div>
  );
}