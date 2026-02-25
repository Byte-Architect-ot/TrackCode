import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function DeleteTestButton({ testId }) {
  const navigate = useNavigate();
  const API_BASE = "/api";

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this test?")) return;

    const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
    if (!token) {
      alert("Authentication token missing. Please login again.");
      navigate("/");
      return;
    }

    try {
      const response = await axios.delete(`${API_BASE}/contest/delete/${testId}`, {
        headers: { token }
      });

      alert(response.data.msg || "Test deleted successfully");
      navigate("/admin/home", { replace: true });
    } catch (error) {
      console.error("Delete failed:", error);
      const message = error.response?.data?.error || "Failed to delete test";
      alert(message);
    }
  };

  return (
    <button 
      onClick={handleDelete} 
      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
    >
      Delete Test
    </button>
  );
}