import { useEffect, useState } from "react";
import { useAuth } from "../store/auth";
import { Navigate } from "react-router-dom";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type GainPoint = {
  position: number;
  gain: number;
};

type GainData = {
  file: string;
  cluster: number;
  text: string;
  data: GainPoint[];
  summary: {
    total_words: number;
    unique_words: number;
    stopwords: number;
  };
};

export function SequentialAnalysis() {
  const { isAuthenticated } = useAuth();
  const [gainData, setGainData] = useState<GainData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(
        "http://localhost:5000/api/v1/sequential_analysis/initial_preprocessing",
        {
          withCredentials: true,
        }
      )
      .then((res) => {
        setGainData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading data", err);
        setLoading(false);
      });
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold">Sequential Gain Analysis</h1>

      {gainData.map((item, index) => (
        <div key={index} className="border rounded-xl p-4 shadow bg-white">
          <h2 className="font-semibold mb-2">
            File: {item.file} | Cluster: {item.cluster}
          </h2>
          <p className="mb-2 text-gray-600 text-sm">
            {item.text.substring(0, 200)}...
          </p>

          <div className="text-sm mb-2 text-gray-700">
            Total Words: {item.summary.total_words} | Unique:{" "}
            {item.summary.unique_words} | Stopwords: {item.summary.stopwords}
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={item.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="position"
                label={{
                  value: "Word Position",
                  position: "insideBottom",
                  offset: -5,
                }}
              />
              <YAxis
                label={{ value: "Gain", angle: -90, position: "insideLeft" }}
              />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="gain"
                stroke="#7e22ce"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ))}
    </div>
  );
}
