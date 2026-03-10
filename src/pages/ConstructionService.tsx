import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ConstructionService: React.FC = () => {
  const navigate = useNavigate();

  // 🔐 Admin Protection
  useEffect(() => {
    const isAdmin = localStorage.getItem("admin");
    if (!isAdmin) {
      navigate("/admin");
    }
  }, [navigate]);

  const [totalPersons, setTotalPersons] = useState(0);
  const [contractorAmount, setContractorAmount] = useState(0);
  const [ourAmount, setOurAmount] = useState(0);

  const profitPerPerson = contractorAmount - ourAmount;
  const totalProfit = profitPerPerson * totalPersons;

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <h2 className="text-3xl font-bold text-center mb-8">
        💰 Contractor Profit Calculator
      </h2>

      <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow">
        <input
          type="number"
          placeholder="Total Persons"
          className="w-full border p-2 mb-4 rounded"
          onChange={(e) => setTotalPersons(Number(e.target.value))}
        />

        <input
          type="number"
          placeholder="Contractor Per Person Amount (₹)"
          className="w-full border p-2 mb-4 rounded"
          onChange={(e) => setContractorAmount(Number(e.target.value))}
        />

        <input
          type="number"
          placeholder="Our Per Person Amount (₹)"
          className="w-full border p-2 mb-4 rounded"
          onChange={(e) => setOurAmount(Number(e.target.value))}
        />

        <div className="mt-6 bg-gray-50 p-4 rounded">
          <p>Profit Per Person: ₹{profitPerPerson}</p>
          <p className="text-xl font-bold text-green-600 mt-2">
            Total Profit: ₹{totalProfit}
          </p>
        </div>

        {/* 🔙 Back Button */}
        <button
          onClick={() => navigate("/admin-dashboard")}
          className="mt-6 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          🔙 Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default ConstructionService;