import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { FileUp, UploadCloud, LogOut, FileText, LineChart as LineChartIcon, CheckCircle, Hourglass, PieChart } from "lucide-react";
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

export default function Dashboard() {
  const { isAuthenticated, logout } = useAuth();
  

  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false); 
  
  const [gainData, setGainData] = useState<GainData>({});
  const [isAnalysisReady, setIsAnalysisReady] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [showGraph, setShowGraph] = useState(false);
  const [showTopics, setShowTopics] = useState(false);
  

  const [isDragging, setIsDragging] = useState(false)
  useEffect(() => {}, []);

  const resetStateForNewUpload = () => {
    setGainData({});
    setShowGraph(false);
    setShowTopics(false);
    setIsAnalysisReady(false);
    setUploadedFileName(null);
    setFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      resetStateForNewUpload();
      setFile(e.target.files[0]);
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!file) return;
    const currentFileName = file.name;
    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    try {
       
      
      await API.post("/transcript/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      
      const res = await API.get("/sequential_analysis/initial_preprocessing", {
        withCredentials: true,
      });

      if (Object.keys(res.data).length === 0) {
        throw new Error("Analysis returned no data.");
      }

    

      setGainData(res.data);
      setUploadedFileName(currentFileName);
      setIsAnalysisReady(true);
      alert(`Successfully analyzed "${currentFileName}"!`);

    } catch (err: any) {
      console.error("Upload or Analysis failed:", err);
      alert("An error occurred: " + (err.message || "Please try again."));
      resetStateForNewUpload();
    } finally {
      setIsUploading(false);
      setFile(null);
    }
  };
  
  
  const handleGenerateGraph = () => {
    if (!isAnalysisReady) return;
    setShowGraph(prev => !prev);
  };

  const handleShowTopics = () => {
    if (!isAnalysisReady) return;
    setShowTopics(prev => !prev);
  };

  if (!isAuthenticated) return <Navigate to="/login" />;

  const handleDragEvents = {
    onDragEnter: (e: React.DragEvent<HTMLLabelElement>) => { e.preventDefault(); setIsDragging(true); },
    onDragLeave: (e: React.DragEvent<HTMLLabelElement>) => { e.preventDefault(); setIsDragging(false); },
    onDragOver: (e: React.DragEvent<HTMLLabelElement>) => { e.preventDefault(); },
    onDrop: (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        resetStateForNewUpload();
        setFile(e.dataTransfer.files[0]);
        e.dataTransfer.clearData();
      }
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 text-white font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Analysis Dashboard</h1>
            <p className="text-sm text-indigo-300">A user-driven dashboard for transcript analysis.</p>
          </div>
          <Button onClick={logout} Icon={LogOut} className="bg-red-600 hover:bg-red-700">Logout</Button>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2"><UploadCloud size={22} /> 1. Upload & Analyze File</h3>
              <label htmlFor="dropzone-file" className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging ? 'border-indigo-400 bg-white/20' : 'border-gray-500 hover:bg-white/10'}`} {...handleDragEvents}>
                <div className="flex flex-col items-center justify-center">
                  <FileUp className="w-8 h-8 mb-2 text-gray-400" />
                  <p className="text-sm text-gray-400 text-center"><span className="font-semibold">Click to upload</span> or drag & drop</p>
                </div>
                <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept=".json,.csv" />
              </label>
              {file && (
                <div className="text-center mt-4">
                  <p className="text-sm text-indigo-300">Selected: <span className="font-bold">{file.name}</span></p>
                  <Button onClick={handleUploadAndAnalyze} disabled={isUploading} className="w-full mt-2">
                    {isUploading ? "Uploading & Analyzing..." : "Upload & Analyze"}
                  </Button>
                </div>
              )}
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg p-6">
               <h3 className="text-xl font-semibold mb-4 flex items-center gap-2"><PieChart size={22} /> 2. View Results</h3>
               <div className="space-y-4">
                  <div>
                     <h4 className="font-semibold text-gray-300">Status</h4>
                      {isAnalysisReady ? (
                        <p className="text-green-400 flex items-center gap-2"><CheckCircle size={18}/> Analysis complete for: <span className="font-bold">{uploadedFileName}</span></p>
                      ) : (
                        <p className="text-amber-400 flex items-center gap-2"><Hourglass size={18}/> Waiting for file...</p>
                      )}
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                     <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: isAnalysisReady ? '100%' : '0%' }}></div>
                  </div>
                  <div className="pt-2 space-y-3">
                     <Button onClick={handleGenerateGraph} disabled={!isAnalysisReady} className="w-full">
                        {showGraph ? 'Hide Analysis Curve' : 'Show Analysis Curve'}
                     </Button>
                     <Button onClick={handleShowTopics} disabled={!isAnalysisReady} className="w-full bg-teal-600 hover:bg-teal-700">
                        {showTopics ? 'Hide Topics' : 'Show Topics & Timestamps'}
                     </Button>
                  </div>
               </div>
            </div>
          </div>

          {}
          <div className="lg:col-span-2 space-y-8 min-h-[400px]">
            {isUploading ? (
                 <div className="flex items-center justify-center h-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-10 text-center animate-pulse">
                    <p className="text-lg text-gray-300">Processing and Analyzing...</p>
                 </div>
            ) : (
              <>
                {!isAnalysisReady && (
                  <div className="flex flex-col items-center justify-center h-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-10 text-center animate-fade-in">
                      <h3 className="text-xl font-semibold text-gray-200">Awaiting Analysis</h3>
                      <p className="text-gray-400 mt-2">Upload a transcript file to begin the process.</p>
                  </div>
                )}

                {isAnalysisReady && Object.keys(gainData).length > 0 && (
                  <div className="space-y-8">
                    {showGraph && (
                      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg p-6 animate-fade-in">
                          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2"><LineChartIcon size={22} /> Sequential Analysis Graph</h3>
                          <ResponsiveContainer width="100%" height={300}>
                              <LineChart data={gainData[Object.keys(gainData)[0]].data}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                                  <XAxis dataKey="position" stroke="#A0AEC0" />
                                  <YAxis stroke="#A0AEC0" />
                                  <Tooltip contentStyle={{ backgroundColor: "rgba(31, 41, 55, 0.8)", borderColor: "#4A5568", color: "#E5E7EB", borderRadius: '0.5rem' }} />
                                  <Line type="monotone" dataKey="gain" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                              </LineChart>
                          </ResponsiveContainer>
                      </div>
                    )}

                    {showTopics && (
                        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg p-6 animate-fade-in">
                          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2"><FileText size={22} /> Topics & Timestamps</h3>
                          <div className="bg-black/20 p-4 rounded-lg max-h-48 overflow-y-auto text-gray-300 text-sm leading-relaxed">
                              <p className="font-bold text-teal-400 mb-2">[Timestamp 00:00-00:45] - Topic Title 1</p>
                              <p className="mb-4">This is a placeholder for the summary of the first topic covered in the transcript. The actual text and timestamps will be implemented later.</p>
                              <p className="font-bold text-teal-400 mb-2">[Timestamp 00:45-01:30] - Topic Title 2</p>
                              <p>This is a placeholder for the second topic. The system will eventually segment the transcript and identify key discussion points with their corresponding times.</p>
                          </div>
                        </div>
                    )}

                    {isAnalysisReady && !showGraph && !showTopics && (
                        <div className="flex flex-col items-center justify-center h-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-10 text-center animate-fade-in">
                          <h3 className="text-xl font-semibold text-gray-200">Analysis Complete</h3>
                          <p className="text-gray-400 mt-2">Click a button on the left to view the results.</p>
                        </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
      <style>{`
        .animate-fade-in { animation: fadeIn 0.7s ease-in-out; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}