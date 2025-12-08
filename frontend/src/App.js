import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import '@/App.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, Download, Loader2, TrendingUp, FileBarChart, Package, DollarSign, ArrowLeft, Lock, Mail } from 'lucide-react';
import axios from 'axios';
import BackendStatus from "./BackendStatus";



const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function LandingPage() {
  const navigate = useNavigate();

  const modules = [
    {
      id: 'deal-submissions',
      title: 'Deal Submissions',
      description: 'Standardize, Analyze and Generate Insights on Deal Submission',
      icon: TrendingUp,
      enabled: true,
      color: 'from-blue-600 to-cyan-600',
    },
    {
      id: 'invoice-parser',
      title: 'Invoice Parser',
      description: 'Multi Invoice Standardizer',
      icon: FileBarChart,
      enabled: false,
      color: 'from-purple-600 to-pink-600',
    },
    {
      id: 'inventory',
      title: 'Inventory',
      description: 'Unified View of Inventory',
      icon: Package,
      enabled: false,
      color: 'from-green-600 to-emerald-600',
    },
    {
      id: 'cost-changes',
      title: 'Cost Changes',
      description: 'Manage and Calibrate Cost changes',
      icon: DollarSign,
      enabled: false,
      color: 'from-orange-600 to-red-600',
    },
  ];

  const handleModuleClick = (module) => {
    if (module.enabled) {
      navigate(`/${module.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-black" data-testid="landing-page">
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        <header className="text-center mb-16">
          <h1 className="text-7xl font-bold mb-4 text-white" data-testid="main-title">
            ReHUB
          </h1>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto" data-testid="main-subtitle">
            Retail Marketplace to Optimize, Automate, and Stay in Control
          </p>
        </header>
	<BackendStatus />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Card
                key={module.id}
                className={`relative overflow-hidden border-gray-800 bg-gray-900 transition-all duration-300 ${
                  module.enabled
                    ? 'cursor-pointer hover:scale-105 hover:shadow-2xl hover:border-gray-700'
                    : 'opacity-60 cursor-not-allowed'
                }`}
                onClick={() => handleModuleClick(module)}
                data-testid={`module-${module.id}`}
              >
                {!module.enabled && (
                  <div className="absolute top-4 right-4 z-10">
                    <div className="bg-gray-800 rounded-full p-2">
                      <Lock className="w-4 h-4 text-gray-500" />
                    </div>
                  </div>
                )}
                
                <CardHeader className="pb-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-white mb-2">{module.title}</CardTitle>
                  <CardDescription className="text-gray-400 text-base">
                    {module.description}
                  </CardDescription>
                </CardHeader>
                
                {module.enabled && (
                  <CardContent className="pt-0">
                    <div className="text-sm text-blue-400 font-medium flex items-center">
                      Get Started →
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DealSubmissionsPage() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [company, setCompany] = useState('');
  const [dealName, setDealName] = useState('');
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [columnFilters, setColumnFilters] = useState({});
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  
  // Fetch companies on component mount
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axios.get(`${API}/companies`);
        setCompanies(response.data.companies || []);
      } catch (err) {
        console.error('Error fetching companies:', err);
        setError('Failed to load companies');
      }
    };
    fetchCompanies();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setResult(null);
    }
  };

  const handleSubmit = async () => {
    if (!company) {
      setError('Please select a company first');
      return;
    }
    if (!dealName) {
      setError('Please enter a deal name');
      return;
    }
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setProcessing(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('company', company);
    formData.append('deal_name', dealName);

    try {
      const response = await axios.post(`${API}/process-file`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error processing file');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!result) return;

    try {
      const response = await axios.post(
        `${API}/download-csv`,
        {
          headers: result.output_headers,
          rows: result.standardized_data,
          deal_summary: result.deal_summary,
        },
        {
          responseType: 'blob',
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'deal_submission_export.zip');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Error downloading file');
    }
  };

  const handleReset = () => {
    setCompany('');
    setDealName('');
    setFile(null);
    setResult(null);
    setError(null);
    setColumnFilters({});
    setChatMessages([]);
    setChatInput('');
  };

  const handleEmail = async () => {
    if (!result) return;

    const email = prompt('Enter recipient email address:');
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      const response = await axios.post(`${API}/email-summary`, {
        recipient_email: email,
        html_summary: result.html_summary,
        text_summary: result.text_summary,
        deal_summary: result.deal_summary,
        standardized_data: result.standardized_data,
        output_headers: result.output_headers
      });

      alert(response.data.message || 'Email sent successfully!');
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Error sending email';
      setError(errorMsg);
      alert(errorMsg);
    }
  };

  const handleFilterChange = (header, value) => {
    setColumnFilters(prev => ({
      ...prev,
      [header]: value
    }));
  };

  const getFilteredData = () => {
    if (!result) return [];
    
    return result.standardized_data.filter(row => {
      return Object.keys(columnFilters).every(header => {
        const filterValue = columnFilters[header];
        if (!filterValue) return true;
        
        const cellValue = String(row[header] || '').toLowerCase();
        return cellValue.includes(filterValue.toLowerCase());
      });
    });
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !result) return;

    const userMessage = {
      role: 'user',
      content: chatInput,
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setChatLoading(true);

    try {
      const response = await axios.post(`${API}/chat`, {
        message: chatInput,
        data_context: result.standardized_data,
        output_headers: result.output_headers,
        company: result.company,
      });

      const aiMessage = {
        role: 'assistant',
        content: response.data.response,
      };

      setChatMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      setError('Error getting response from AI');
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black" data-testid="deal-submissions-page">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white hover:bg-gray-900 mb-4"
            data-testid="back-to-home-btn"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          
          <header className="text-center">
            <h1 className="text-5xl font-bold mb-3 text-white" data-testid="page-title">
              Deal Submissions
            </h1>
            <p className="text-gray-400 text-lg">Standardize, analyze and generate insights on deal submission files</p>
          </header>
        </div>

        {!result ? (
          <Card className="max-w-2xl mx-auto border-gray-800 bg-gray-900" data-testid="upload-card">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-white">Upload Deal File</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select Company *
                </label>
                <Select value={company} onValueChange={setCompany}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white" data-testid="company-select">
                    <SelectValue placeholder="Choose a company" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {companies.map((comp) => (
                      <SelectItem key={comp} value={comp} className="text-white hover:bg-gray-700" data-testid={`company-${comp}`}>
                        {comp}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Deal Name *
                </label>
                <Input
                  type="text"
                  placeholder="Enter deal name"
                  value={dealName}
                  onChange={(e) => setDealName(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                  data-testid="deal-name-input"
                />
              </div>

              <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-blue-500 transition-colors bg-gray-800/50">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  data-testid="file-input"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center space-y-3"
                >
                  <Upload className="w-12 h-12 text-gray-500" />
                  <div>
                    <span className="text-blue-400 font-medium hover:text-blue-300">
                      Click to upload
                    </span>
                    <span className="text-gray-500"> or drag and drop</span>
                  </div>
                  <p className="text-sm text-gray-500">Excel files (.xlsx, .xls)</p>
                </label>
              </div>

              {file && (
                <div className="flex items-center space-x-3 bg-gray-800 p-4 rounded-lg border border-gray-700" data-testid="selected-file">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <span className="text-sm font-medium text-gray-300 flex-1">{file.name}</span>
                  <Button variant="ghost" size="sm" onClick={() => setFile(null)} className="text-gray-400 hover:text-white" data-testid="remove-file-btn">
                    Remove
                  </Button>
                </div>
              )}

              {error && (
                <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded-lg" data-testid="error-message">
                  {error}
                </div>
              )}

              <Button
                onClick={handleSubmit}
                disabled={!file || !company || !dealName || processing}
                className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-white"
                data-testid="process-btn"
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Process File'
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6" data-testid="results-section">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Standardized Results</h2>
              <div className="space-x-3">
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                  data-testid="download-btn"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download CSV
                </Button>
                <Button
                  onClick={handleEmail}
                  variant="outline"
                  className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
                  data-testid="email-btn"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Email Summary
                </Button>
                <Button onClick={handleReset} variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800" data-testid="process-another-btn">
                  Process Another File
                </Button>
              </div>
            </div>

            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-4 max-w-2xl bg-gray-900 border border-gray-800">
                <TabsTrigger value="summary" className="data-[state=active]:bg-gray-800 text-gray-400 data-[state=active]:text-white" data-testid="summary-tab">Summary</TabsTrigger>
                <TabsTrigger value="data" className="data-[state=active]:bg-gray-800 text-gray-400 data-[state=active]:text-white" data-testid="data-tab">Data Table</TabsTrigger>
                <TabsTrigger value="text" className="data-[state=active]:bg-gray-800 text-gray-400 data-[state=active]:text-white" data-testid="text-tab">Text Summary</TabsTrigger>
                <TabsTrigger value="chat" className="data-[state=active]:bg-gray-800 text-gray-400 data-[state=active]:text-white" data-testid="chat-tab">Chat with Data</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="mt-6">
                <Card className="border-gray-800 bg-gray-900">
                  <CardContent className="pt-6">
                    <div dangerouslySetInnerHTML={{ __html: result.html_summary }} data-testid="html-summary" />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="data" className="mt-6">
                {result.deal_summary && (
                  <Card className="border-gray-800 bg-gray-900 mb-6">
                    <CardHeader>
                      <CardTitle className="text-white">Deal Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm text-gray-400">Deal Name</div>
                          <div className="text-white font-medium">{result.deal_summary.deal_name || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">Vendor</div>
                          <div className="text-white font-medium">{result.deal_summary.vendor_id || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">Start Date</div>
                          <div className="text-white font-medium">{result.deal_summary.deal_start_date || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">End Date</div>
                          <div className="text-white font-medium">{result.deal_summary.deal_end_date || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">Cost Date</div>
                          <div className="text-white font-medium">{result.deal_summary.deal_cost_date || 'N/A'}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                <Card className="border-gray-800 bg-gray-900">
                  <CardHeader>
                    <CardTitle className="text-white">Standardized Data</CardTitle>
                    <CardDescription className="text-gray-400">
                      {getFilteredData().length} of {result.standardized_data.length} rows × {result.output_headers.length} columns
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-auto max-h-[600px] border border-gray-800 rounded-lg" data-testid="data-table">
                      <Table>
                        <TableHeader className="bg-gray-800 sticky top-0 z-10">
                          <TableRow className="hover:bg-gray-800 border-gray-700">
                            {result.output_headers.map((header, idx) => (
                              <TableHead key={idx} className="font-semibold text-gray-300 whitespace-nowrap p-2">
                                <div className="space-y-1 min-w-[150px]">
                                  <div className="font-semibold">{header}</div>
                                  <Input
                                    type="text"
                                    placeholder="Filter..."
                                    value={columnFilters[header] || ''}
                                    onChange={(e) => handleFilterChange(header, e.target.value)}
                                    className="h-8 text-xs bg-gray-900 border-gray-700 text-gray-300 placeholder-gray-600 focus:border-blue-500"
                                    data-testid={`filter-${header}`}
                                  />
                                </div>
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getFilteredData().map((row, rowIdx) => (
                            <TableRow key={rowIdx} className="hover:bg-gray-800/50 border-gray-800">
                              {result.output_headers.map((header, colIdx) => (
                                <TableCell key={colIdx} className="text-sm text-gray-400 p-2">
                                  {row[header] || ''}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="text" className="mt-6">
                <Card className="border-gray-800 bg-gray-900">
                  <CardHeader>
                    <CardTitle className="text-white">Processing Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="whitespace-pre-wrap text-sm text-gray-400 bg-gray-800 p-6 rounded-lg font-mono" data-testid="text-summary">
                      {result.text_summary}
                    </pre>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="chat" className="mt-6">
                <Card className="border-gray-800 bg-gray-900 h-[600px] flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-white">Chat with Data</CardTitle>
                    <CardDescription className="text-gray-400">
                      Ask questions about your standardized deal submission data
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-4 bg-gray-800/50 rounded-lg" data-testid="chat-messages">
                      {chatMessages.length === 0 ? (
                        <div className="text-center text-gray-500 mt-8">
                          <p className="text-lg mb-2">Start a conversation!</p>
                          <p className="text-sm">Ask questions like:</p>
                          <ul className="text-sm mt-4 space-y-2 text-left max-w-md mx-auto">
                            <li className="text-gray-400">• What is the total number of items?</li>
                            <li className="text-gray-400">• Which items have the highest case cost?</li>
                            <li className="text-gray-400">• What is the average TPR retail price?</li>
                            <li className="text-gray-400">• Show me items with case pack of 8</li>
                          </ul>
                        </div>
                      ) : (
                        chatMessages.map((msg, idx) => (
                          <div
                            key={idx}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            data-testid={`chat-message-${idx}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-lg p-4 ${
                                msg.role === 'user'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-700 text-gray-200'
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            </div>
                          </div>
                        ))
                      )}
                      {chatLoading && (
                        <div className="flex justify-start">
                          <div className="bg-gray-700 text-gray-200 rounded-lg p-4">
                            <Loader2 className="h-5 w-5 animate-spin" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Input
                        type="text"
                        placeholder="Ask a question about your data..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="flex-1 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                        disabled={chatLoading}
                        data-testid="chat-input"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!chatInput.trim() || chatLoading}
                        className="bg-blue-600 hover:bg-blue-700"
                        data-testid="chat-send-btn"
                      >
                        {chatLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/deal-submissions" element={<DealSubmissionsPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
