import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Plus, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import api from "../api/axios";

const emptyExample = { input: "", output: "", explanation: "" };

const AddProblem = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    problemId: "",
    title: "",
    difficulty: "Easy",
    tags: "",
    timeLimit: 1,
    memoryLimit: 256,
    problemStatement: "",
    inputFormat: "",
    outputFormat: "",
    constraints: "",
    status: "Draft",
  });
  const [examples, setExamples] = useState([{ ...emptyExample }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleExampleChange = (index, field, value) => {
    setExamples((prev) => prev.map((ex, i) => (i === index ? { ...ex, [field]: value } : ex)));
  };

  const addExample = () => setExamples((prev) => [...prev, { ...emptyExample }]);
  const removeExample = (index) => setExamples((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.problemId || !form.title || !form.problemStatement) {
      setError("Problem ID, Title, and Problem Statement are required.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/problems", {
        ...form,
        timeLimit: Number(form.timeLimit),
        memoryLimit: Number(form.memoryLimit),
        examples: examples.filter((ex) => ex.input || ex.output),
      });
      setSuccess(`Problem "${res.data.problem.title}" created successfully!`);
      setTimeout(() => navigate("/admin/problems"), 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create problem.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-brand-500";
  const labelClass = "mb-1 block text-sm font-medium text-slate-300";

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Add New Problem</h1>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
        </div>
      )}
      {success && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" /> {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-slate-800 bg-slate-900 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Problem ID *</label>
            <input
              type="text"
              value={form.problemId}
              onChange={(e) => handleChange("problemId", e.target.value)}
              placeholder="e.g. OJH101"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="e.g. Two Sum"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Difficulty</label>
            <select
              value={form.difficulty}
              onChange={(e) => handleChange("difficulty", e.target.value)}
              className={inputClass}
            >
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select
              value={form.status}
              onChange={(e) => handleChange("status", e.target.value)}
              className={inputClass}
            >
              <option>Draft</option>
              <option>Published</option>
              <option>Archived</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Time Limit (seconds)</label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={form.timeLimit}
              onChange={(e) => handleChange("timeLimit", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Memory Limit (MB)</label>
            <input
              type="number"
              min="16"
              value={form.memoryLimit}
              onChange={(e) => handleChange("memoryLimit", e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Tags (comma separated)</label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => handleChange("tags", e.target.value)}
              placeholder="array, two-pointers, hashing"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Problem Statement *</label>
          <textarea
            rows={6}
            value={form.problemStatement}
            onChange={(e) => handleChange("problemStatement", e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Input Format</label>
            <textarea
              rows={3}
              value={form.inputFormat}
              onChange={(e) => handleChange("inputFormat", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Output Format</label>
            <textarea
              rows={3}
              value={form.outputFormat}
              onChange={(e) => handleChange("outputFormat", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Constraints</label>
          <textarea
            rows={3}
            value={form.constraints}
            onChange={(e) => handleChange("constraints", e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Examples */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className={labelClass}>Examples</label>
            <button
              type="button"
              onClick={addExample}
              className="flex items-center gap-1 text-xs font-semibold text-brand-400 hover:underline"
            >
              <Plus className="h-3.5 w-3.5" /> Add Example
            </button>
          </div>
          <div className="space-y-4">
            {examples.map((ex, i) => (
              <div key={i} className="rounded-lg border border-slate-800 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase text-slate-500">Example {i + 1}</p>
                  {examples.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExample(i)}
                      className="text-rose-400 hover:text-rose-300"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <textarea
                    rows={2}
                    placeholder="Input"
                    value={ex.input}
                    onChange={(e) => handleExampleChange(i, "input", e.target.value)}
                    className={inputClass}
                  />
                  <textarea
                    rows={2}
                    placeholder="Output"
                    value={ex.output}
                    onChange={(e) => handleExampleChange(i, "output", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <textarea
                  rows={2}
                  placeholder="Explanation (optional)"
                  value={ex.explanation}
                  onChange={(e) => handleExampleChange(i, "explanation", e.target.value)}
                  className={`${inputClass} mt-3`}
                />
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Create Problem
        </button>
      </form>
    </div>
  );
};

export default AddProblem;
