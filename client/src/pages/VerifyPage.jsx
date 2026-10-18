import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../component/common/PageHeader";
import ClaimForm from "../component/verify/ClaimForm";
import PredictionResult from "../component/verify/PredictionResult";
import { useAuth } from "../context/AuthContext";
import { verifyClaim } from "../services/factforgeApi";

function VerifyPage() {
  const { isAuthenticated, isBootstrapping } = useAuth();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (isBootstrapping) {
    return <p className="text-sm text-stone-600">Checking session...</p>;
  }

  const handleVerify = async (text) => {
    if (!isAuthenticated) {
      navigate("/signin", { replace: true, state: { from: "/verify" } });
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await verifyClaim(text);
      setResult(response);
    } catch (err) {
      setError(err.message || "Unable to verify claim");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Claim Verification"
        title="Submit a claim for model inference"
        description="Send a statement to the API and receive binary output plus confidence score from your deployed model."
      />

      {error ? <p className="rounded-xl bg-rose-50 px-4 py-2 text-sm text-rose-700">{error}</p> : null}

      <div>
        <ClaimForm onSubmit={handleVerify} isLoading={loading} />

        {result ? (
          <div className="mt-6">
            <PredictionResult result={result} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default VerifyPage;
