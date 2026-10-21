import { useState } from "react";
import { useAuth } from "../Context/AuthContext";
import { apiFetch } from "../api";

export default function ResumeForm({ onResumeCreated, onCancel, initialData }) {
  const { token } = useAuth();

  // Main form state
  const [formData, setFormData] = useState(
    initialData || {
      full_name: "",
      email: "",
      phone: "",
      summary: "",
      experiences: [],
    },
  );

  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false); // AI Loading State

  // Handle basic text inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  // Add a blank experience to the array
  const addExperience = () => {
    setFormData((current) => ({
      ...current,
      experiences: [
        ...current.experiences,
        { company: "", role: "", years: 1 },
      ],
    }));
  };

  // Update a specific experience field based on its index
  const updateExperience = (index, field, value) => {
    setFormData((current) => ({
      ...current,
      experiences: current.experiences.map((experience, experienceIndex) =>
        experienceIndex === index
          ? { ...experience, [field]: value }
          : experience,
      ),
    }));
  };

  // Remove an experience
  const removeExperience = (index) => {
    setFormData((current) => ({
      ...current,
      experiences: current.experiences.filter(
        (_, experienceIndex) => experienceIndex !== index,
      ),
    }));
  };

  // Generate summary with AI
  const generateAISummary = async () => {
    setIsGenerating(true);
    setError("");

    try {
      const data = await apiFetch(
        "/ai/generate-summary",
        {
          method: "POST",
          body: JSON.stringify({
            full_name: formData.full_name || "the user",
            experiences: formData.experiences,
            current_summary: formData.summary,
          }),
        },
        token,
      );
      if (typeof data?.summary !== "string" || !data.summary.trim()) {
        throw new Error("The AI response did not include a summary.");
      }

      setFormData((current) => ({ ...current, summary: data.summary }));
    } catch (err) {
      setError("AI Generation failed: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const payload = {
      ...formData,
      experiences: formData.experiences.map((exp) => ({
        ...exp,
        years: parseInt(exp.years) || 0,
      })),
    };

    try {
      let savedResume;
      if (initialData) {
        // EDIT MODE: Use PATCH
        savedResume = await apiFetch(
          `/resumes/${initialData.id}`,
          {
            method: "PATCH",
            body: JSON.stringify(payload),
          },
          token,
        );
      } else {
        // CREATE MODE: Use POST
        savedResume = await apiFetch(
          "/resumes",
          {
            method: "POST",
            body: JSON.stringify(payload),
          },
          token,
        );
      }

      onResumeCreated(savedResume); // Tell Dashboard to refresh
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded shadow mb-6 border-t-4 border-blue-500"
    >
      <h2 className="text-xl font-bold mb-4">
        {initialData ? "Edit Resume" : "Create New Resume"}
      </h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="grid grid-cols-2 gap-4 mb-4">
        <input
          name="full_name"
          placeholder="Full Name"
          required
          className="border p-2 rounded"
          value={formData.full_name}
          onChange={handleChange}
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="border p-2 rounded"
          value={formData.email}
          onChange={handleChange}
        />
        <input
          name="phone"
          placeholder="Phone (optional)"
          className="border p-2 rounded"
          value={formData.phone}
          onChange={handleChange}
        />
      </div>

      {/* Summary Field with AI Button */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <label className="text-sm font-semibold text-gray-600">
            Professional Summary
          </label>
          <button
            type="button"
            onClick={generateAISummary}
            disabled={isGenerating}
            className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded hover:bg-purple-200 disabled:opacity-50 flex items-center gap-1"
          >
            {isGenerating ? "✨ Generating..." : "✨ Generate with AI"}
          </button>
        </div>
        <textarea
          name="summary"
          placeholder="Professional Summary"
          rows="4"
          className="w-full border p-2 rounded"
          value={formData.summary}
          onChange={handleChange}
        />
      </div>

      {/* Experiences Section */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold">Experience</h3>
          <button
            type="button"
            onClick={addExperience}
            className="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
          >
            + Add Experience
          </button>
        </div>

        {formData.experiences.map((exp, index) => (
          <div
            key={index}
            className="flex gap-2 mb-2 items-center bg-gray-50 p-2 rounded"
          >
            <input
              placeholder="Company"
              required
              className="border p-2 rounded w-1/3"
              value={exp.company}
              onChange={(e) =>
                updateExperience(index, "company", e.target.value)
              }
            />
            <input
              placeholder="Role"
              required
              className="border p-2 rounded w-1/3"
              value={exp.role}
              onChange={(e) => updateExperience(index, "role", e.target.value)}
            />
            <input
              type="number"
              placeholder="Years"
              required
              min="0"
              max="60"
              className="border p-2 rounded w-20"
              value={exp.years}
              onChange={(e) => updateExperience(index, "years", e.target.value)}
            />
            <button
              type="button"
              onClick={() => removeExperience(index)}
              className="text-red-500 font-bold px-2"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {initialData ? "Update Resume" : "Save Resume"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
