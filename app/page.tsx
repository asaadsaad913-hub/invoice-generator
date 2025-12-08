"use client";

import { useEffect, useState } from "react";

interface Invoice {
  id: number;
  customerName: string;
  amount: number;
  dueDate: string;
  status: string;
}

export default function Home() {
  const [customerName, setCustomerName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchInvoices = async () => {
    try {
      const res = await fetch("/api/invoices");
      const data = await res.json();
      setInvoices(data);
    } catch (err) {
      setError("حدث خطأ أثناء جلب الفواتير");
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!customerName || !amount || !dueDate) {
      setError("الرجاء تعبئة جميع الحقول");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ customerName, amount, dueDate }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "خطأ أثناء إنشاء الفاتورة");
        return;
      }

      setInvoices((prev) => [data, ...prev]);
      setCustomerName("");
      setAmount("");
      setDueDate("");
      setSuccess("تمت إضافة الفاتورة بنجاح");
    } catch (err) {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white shadow-md rounded-lg p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center">Invoice Generator</h1>

        {error && (
          <div className="p-2 bg-red-200 rounded text-red-700 text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="p-2 bg-green-200 rounded text-green-700 text-center">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">اسم العميل</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="مثال: شركة ABC"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">المبلغ</label>
            <input
              type="number"
              className="w-full border rounded px-3 py-2"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="مثال: 1500"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">تاريخ الاستحقاق</label>
            <input
              type="date"
              className="w-full border rounded px-3 py-2"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "جاري الإضافة..." : "إضافة فاتورة"}
          </button>
        </form>

        <div>
          <h2 className="text-xl font-semibold mb-2">قائمة الفواتير</h2>

          {invoices.length === 0 ? (
            <p className="text-gray-500">لا توجد فواتير بعد.</p>
          ) : (
            <table className="w-full border text-sm">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border px-2 py-1">#</th>
                  <th className="border px-2 py-1">العميل</th>
                  <th className="border px-2 py-1">المبلغ</th>
                  <th className="border px-2 py-1">الاستحقاق</th>
                  <th className="border px-2 py-1">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv, i) => (
                  <tr key={inv.id}>
                    <td className="border px-2 py-1">{i + 1}</td>
                    <td className="border px-2 py-1">{inv.customerName}</td>
                    <td className="border px-2 py-1">{inv.amount}</td>
                    <td className="border px-2 py-1">{inv.dueDate}</td>
                    <td className="border px-2 py-1">{inv.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
}