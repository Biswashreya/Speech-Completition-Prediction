import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { FileUp, UploadCloud, LogOut } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import API from "../lib/axios";
import { useAuth } from "../store/auth";
import Button from "../components/Button";

type GainPoint = { position: number; gain: number };
type GainFile = { text: string; data: GainPoint[] };
type GainData = { [fileName: string]: GainFile };

export default function Analysis() {
  const { isAuthenticated, logout } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [gainData, setGainData] = useState<GainData>({});
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  useEffect(() => {
    fetchGainData();
  }, []);

  const fetchGainData = async () => {
    try {
      setLoadingAnalysis(true);
      const res = await API.get("/sequential_analysis/initial_preprocessing", {
        withCredentials: true,
      });
      setGainData(res.data);
    } catch (err) {
      console.error("Error fetching analysis:", err);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      await API.post("/transcript/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Upload successful!");
      await fetchGainData();
    } catch (err: any) {
      console.error("Upload failed:", err?.response?.data);
      alert("Upload failed: " + err?.response?.data?.message);
    } finally {
      setUploading(false);
    }
  };

  if (!isAuthenticated) return <Navigate to="/login" />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 text-white font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Transcript Analysis
            </h1>
          </div>
          <Button
            onClick={logout}
            Icon={LogOut}
            className="bg-red-600 hover:bg-red-700"
          >
            Logout
          </Button>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Upload Section */}
          <div className="space-y-8">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <UploadCloud size={22} />
                Upload Transcript
              </h3>

              <label
                htmlFor="dropzone-file"
                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-500 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FileUp className="w-10 h-10 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-400 text-center">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    JSON or CSV files only
                  </p>
                </div>
                <input
                  id="dropzone-file"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".json,.csv"
                />
              </label>

              {file && (
                <p className="mt-4 text-center text-sm text-indigo-300">
                  Selected: {file.name}
                </p>
              )}

              <Button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="w-full mt-4"
              >
                {uploading ? "Uploading..." : "Upload & Analyze"}
              </Button>
            </div>
          </div>

          {/* Right: Graphs */}
          <div className="lg:col-span-2 space-y-8">
            {loadingAnalysis && (
              <div className="bg-white/10 rounded-xl p-6 text-center text-gray-300">
                Loading analysis...
              </div>
            )}

            {!loadingAnalysis &&
              Object.entries(gainData).map(([fileName, fileData]) => (
                <div
                  key={fileName}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl shadow p-6 animate-fade-in"
                >
                  <h2 className="text-xl font-semibold text-indigo-300 mb-2">
                    File: {fileName}
                  </h2>
                  {/* <p className="text-sm text-gray-300 mb-4">
                    {fileData.text.substring(0, 200)}...
                  </p> */}

                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={fileData.data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                      <XAxis
                        dataKey="position"
                        stroke="#A0AEC0"
                        label={{
                          value: "Word Position",
                          position: "insideBottom",
                          offset: -5,
                          fill: "#A0AEC0",
                        }}
                      />
                      <YAxis
                        stroke="#A0AEC0"
                        label={{
                          value: "Gain",
                          angle: -90,
                          position: "insideLeft",
                          fill: "#A0AEC0",
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(31, 41, 55, 0.8)",
                          borderColor: "#4A5568",
                          color: "#E5E7EB",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="gain"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ))}
          </div>
        </main>
      </div>

      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
