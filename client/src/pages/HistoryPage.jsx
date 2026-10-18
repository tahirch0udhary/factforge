import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../component/common/PageHeader";
import HistoryTable from "../component/history/HistoryTable";
import { useAuth } from "../context/AuthContext";
import { getHistory } from "../services/factforgeApi";

function HistoryPage() {
  const { isAuthenticated, isBootstrapping } = useAuth();
  
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      setRows([]);
      return;
    }

    getHistory()
      .then(setRows)
      .catch((err) => setError(err.message || "Unable to fetch history"));
  }, [isAuthenticated]);

  if (isBootstrapping) {
    return <p className="text-sm text-stone-600">Checking session...</p>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Verification History"
        title="Track previous claims and outcomes"
        description="Audit model decisions over time to spot failure patterns and support error analysis."
      />

      {error ? <p className="rounded-xl bg-rose-50 px-4 py-2 text-sm text-rose-700">{error}</p> : null}

      {!isAuthenticated ? (
        <div className="rounded-xl bg-blue-50 p-4 text-sm text-blue-800">
          <p className="font-semibold">Sign in to view your personal verification history.</p>
          <p className="mt-2">Your past claims and model outputs are private and available after signing in.</p>
          <Link to="/signin" className="btn-primary mt-3 inline-block">Sign in</Link>
        </div>
      ) : null}

      <HistoryTable rows={rows} />
    </div>
  );
}

export default HistoryPage;
