import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";
import { getFees, getFeeStructures, recordPayment } from "../services/feesService";

export default function Fees() {
  const [query, setQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const { data: feeRecords = [], isLoading } = useQuery({
    queryKey: ["fees", query],
    queryFn: () => getFees({ search: query }),
  });

  const { data: feeStructures = [] } = useQuery({
    queryKey: ["fee-structures"],
    queryFn: () => getFeeStructures(),
  });

  const filtered = useMemo(() => {
    if (!query) return feeRecords;
    const needle = query.toLowerCase();
    return feeRecords.filter((item) => `${item.studentName || ""} ${item.studentNumber || ""}`.toLowerCase().includes(needle));
  }, [feeRecords, query]);

  const totalExpected = filtered.reduce((sum, item) => sum + Number(item.totalExpected || 0), 0);
  const totalCollected = filtered.reduce((sum, item) => sum + Number(item.amountPaid || 0), 0);
  const totalOutstanding = filtered.reduce((sum, item) => sum + Number(item.outstanding || 0), 0);

  async function handlePayment(event) {
    event.preventDefault();
    if (!selectedStudent) return;
    await recordPayment({
      studentId: selectedStudent.studentId,
      feeStructureId: feeStructures[0]?.id || null,
      amount: Number(paymentAmount),
      method: paymentMethod,
    });
    window.alert("Payment recorded successfully");
  }

  return (
    <div className="page-stack">
      <PageHeader title="Fee Management" subtitle="Track fee balances and record payments from the API." />
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="card p-4">
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            placeholder="Search by learner name or index number"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />

          {isLoading ? (
            <div className="mt-4 text-sm text-slate-500">Loading fee records...</div>
          ) : (
            <div className="mt-4 space-y-2">
              {filtered.map((item) => (
                <button
                  key={item.studentId}
                  className={`w-full rounded-lg border px-3 py-3 text-left ${selectedStudent?.studentId === item.studentId ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white"}`}
                  onClick={() => setSelectedStudent(item)}
                >
                  <div className="font-semibold text-slate-800">{item.studentName}</div>
                  <div className="text-sm text-slate-500">{item.studentNumber}</div>
                  <div className="mt-1 text-sm text-slate-600">Paid {item.amountPaid ?? 0} / Expected {item.totalExpected ?? 0}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="card p-4">
          <h3 className="text-lg font-semibold text-slate-900">Summary</h3>
          <div className="mt-4 grid gap-3">
            <div className="rounded-lg bg-slate-50 p-3"><div className="text-sm text-slate-500">Expected</div><div className="text-xl font-semibold text-slate-900">{totalExpected}</div></div>
            <div className="rounded-lg bg-emerald-50 p-3"><div className="text-sm text-emerald-700">Collected</div><div className="text-xl font-semibold text-emerald-800">{totalCollected}</div></div>
            <div className="rounded-lg bg-amber-50 p-3"><div className="text-sm text-amber-700">Outstanding</div><div className="text-xl font-semibold text-amber-800">{totalOutstanding}</div></div>
          </div>

          <form className="mt-6 space-y-3" onSubmit={handlePayment}>
            <label className="block text-sm font-medium text-slate-700">Amount</label>
            <input className="w-full rounded-md border border-slate-300 px-3 py-2" value={paymentAmount} onChange={(event) => setPaymentAmount(event.target.value)} />
            <label className="block text-sm font-medium text-slate-700">Payment method</label>
            <select className="w-full rounded-md border border-slate-300 px-3 py-2" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
              <option value="cash">Cash</option>
              <option value="bank">Bank</option>
              <option value="mobile">Mobile money</option>
            </select>
            <button className="btn btn-primary w-full" type="submit" disabled={!selectedStudent}>Record payment</button>
          </form>
        </div>
      </div>
    </div>
  );
}
