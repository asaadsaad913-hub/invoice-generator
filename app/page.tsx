"use client";

import { useEffect, useState } from "react";

interface Invoice {
  id: number;
  customerName: string;
  amount: number;
  dueDate: string;
  createdAt: string;
}

export default function Home() {
  const [customerName, setCustomerName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchInvoices = async () => {
    try {
      setFetchLoading(true);
      setError("");
      const res = await fetch("/api/invoices");
      if (!res.ok) {
        throw new Error("Failed to fetch invoices");
      }
      const data: Invoice[] = await res.json();
      setInvoices(data);
    } catch (err) {
      console.error(err);
      setError("Error fetching invoices.");
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const resetForm = () => {
    setCustomerName("");
    setAmount("");
    setDueDate("");
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!customerName || !amount || !dueDate) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const isEdit = editingId !== null;

      const res = await fetch("/api/invoices", {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingId ?? undefined,
          customerName,
          amount: parseFloat(amount),
          dueDate,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "Error while saving the invoice.");
        return;
      }

      if (isEdit) {
        setInvoices((prev) =>
          prev.map((inv) => (inv.id === data.id ? data : inv))
        );
        setSuccess("Invoice updated successfully.");
      } else {
        setInvoices((prev) => [data, ...prev]);
        setSuccess("Invoice created successfully.");
      }

      resetForm();
    } catch (err) {
      console.error(err);
      setError("Error while saving the invoice.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (invoice: Invoice) => {
    setCustomerName(invoice.customerName);
    setAmount(invoice.amount.toString());
    setDueDate(invoice.dueDate.slice(0, 10)); // yyyy-mm-dd
    setEditingId(invoice.id);
    setError("");
    setSuccess("");
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this invoice?"
    );
    if (!confirmDelete) return;

    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/invoices", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "Error while deleting the invoice.");
        return;
      }

      setInvoices((prev) => prev.filter((inv) => inv.id !== id));
      setSuccess("Invoice deleted successfully.");
    } catch (err) {
      console.error(err);
      setError("Error while deleting the invoice.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-xl p-8 border border-gray-100">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            Invoice Generator
          </h1>
          <button
            type="button"
            onClick={handlePrint}
            className="text-sm px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-50 transition"
          >
            Print Page
          </button>
        </header>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-md bg-green-50 border border-green-200 px-4 py-2 text-sm text-green-700">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Customer Name
            </label>
            <input
              type="text"
              placeholder="e.g. John Doe"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Amount
            </label>
            <input
              type="number"
              placeholder="e.g. 1500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white py-2 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading
              ? editingId
                ? "Updating..."
                : "Processing..."
              : editingId
              ? "Update Invoice"
              : "Create Invoice"}
          </button>
        </form>

        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Invoices</h2>
            {fetchLoading && (
              <span className="text-xs text-gray-500">
                Loading invoices...
              </span>
            )}
          </div>

          <div className="overflow-x-auto border border-gray-200 rounded-md">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border-b px-3 py-2 text-left font-medium text-gray-700">
                    Customer Name
                  </th>
                  <th className="border-b px-3 py-2 text-left font-medium text-gray-700">
                    Amount
                  </th>
                  <th className="border-b px-3 py-2 text-left font-medium text-gray-700">
                    Due Date
                  </th>
                  <th className="border-b px-3 py-2 text-left font-medium text-gray-700">
                    Created At
                  </th>
                  <th className="border-b px-3 py-2 text-left font-medium text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 py-4 text-center text-sm text-gray-500"
                    >
                      No invoices yet.
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv.id} className="even:bg-gray-50">
                      <td className="border-t px-3 py-2 text-gray-800">
                        {inv.customerName}
                      </td>
                      <td className="border-t px-3 py-2 text-gray-800">
                        ${inv.amount.toFixed(2)}
                      </td>
                      <td className="border-t px-3 py-2 text-gray-800">
                        {inv.dueDate.slice(0, 10)}
                      </td>
                      <td className="border-t px-3 py-2 text-gray-800">
                        {new Date(inv.createdAt).toLocaleString()}
                      </td>
                      <td className="border-t px-3 py-2">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(inv)}
                            className="px-2 py-1 text-xs rounded-md border border-blue-400 text-blue-600 hover:bg-blue-50"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(inv.id)}
                            className="px-2 py-1 text-xs rounded-md border border-red-400 text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}