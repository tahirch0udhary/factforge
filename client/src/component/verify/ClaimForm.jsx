import { useState } from "react";

function ClaimForm({ onSubmit, isLoading }) {
  const [text, setText] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!text.trim()) {
      return;
    }
    onSubmit(text.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 fade-in-up">
      <div className="space-y-2">
        <label htmlFor="claim" className="text-sm font-bold text-stone-700">
          Enter claim text
        </label>
        <textarea
          id="claim"
          className="input min-h-32 resize-y"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Type or paste a claim to verify..."
        />
      </div>

      <button className="btn-primary" type="submit" disabled={isLoading}>
        {isLoading ? "Verifying..." : "Verify Claim"}
      </button>
    </form>
  );
}

export default ClaimForm;
