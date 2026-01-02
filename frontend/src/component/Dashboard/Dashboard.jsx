import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  BarChart3, 
  TrendingUp, 
  Download,
  Share2,
  AlertCircle,
  CheckCircle,
  RefreshCw 
} from 'lucide-react';
import UploadSection from './UploadSection';
import KPICards from './KPICards';
import Charts from './Charts';
import Forecast from './Forecast';
import Insights from './Insights';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { generatePDFReport } from '../../utils/pdfGenerator';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [dataset, setDataset] = useState(null);
  const [kpis, setKpis] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const handleFileUpload = async (file) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/datasets/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setDataset(response.data);
      
      // Trigger analysis
      await triggerAnalysis(response.data.id);
      
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerAnalysis = async (datasetId) => {
    try {
      const analysis = await api.post(`/analytics/analyze/${datasetId}`);
      setKpis(analysis.data.kpis);
      
      const forecastData = await api.post(`/forecasts/generate/${datasetId}`);
      setForecast(forecastData.data);
      
    } catch (error) {
      console.error('Analysis error:', error);
    }
  };

  const handleGenerateReport = async () => {
    const pdf = await generatePDFReport({
      user,
      dataset,
      kpis,
      forecast,
      generatedAt: new Date().toLocaleString()
    });
    
    // Trigger download
    const blob = new Blob([pdf], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `shopintel-report-${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShareReport = async () => {
    try {
      const shareResponse = await api.post('/reports/share', {
        dataset_id: dataset?.id,
        is_public: true
      });
      
      setShareModalOpen(true);
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ShopIntel Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Welcome back, {user?.full_name || user?.username}!
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleGenerateReport}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all duration-300"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Report
              </button>
              <button
                onClick={handleShareReport}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all duration-300"
              >
                <Share2 className="w-5 h-5 mr-2" />
                Share Insights
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Section */}
        {!dataset && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <UploadSection onUpload={handleFileUpload} loading={loading} />
          </motion.div>
        )}

        {/* Analytics Dashboard */}
        {dataset && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Tabs */}
            <div className="mb-8 border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {['overview', 'analytics', 'forecast', 'insights'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-300 ${
                      activeTab === tab
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </nav>
            </div>

            {/* KPI Cards */}
            <KPICards kpis={kpis} />

            {/* Main Content */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Charts */}
              <div className="lg:col-span-2">
                {activeTab === 'overview' && <Charts kpis={kpis} dataset={dataset} />}
                {activeTab === 'forecast' && <Forecast forecast={forecast} />}
                {activeTab === 'insights' && <Insights insights={forecast?.insights} />}
              </div>

              {/* Right Column - Summary & Actions */}
              <div className="space-y-6">
                {/* Dataset Info */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Dataset Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">File Name:</span>
                      <span className="font-medium">{dataset?.filename}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rows Processed:</span>
                      <span className="font-medium">{dataset?.row_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Uploaded:</span>
                      <span className="font-medium">
                        {new Date(dataset?.uploaded_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Quick Actions
                  </h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => triggerAnalysis(dataset.id)}
                      className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all duration-300"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh Analysis
                    </button>
                    <button
                      onClick={handleGenerateReport}
                      className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-300"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export Data
                    </button>
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 mr-3" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium">Important Notice</p>
                      <p className="mt-1">
                        Forecasts are based on historical data and are probabilistic estimates.
                        Use them as guidance, not guarantees. Always verify with market conditions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;