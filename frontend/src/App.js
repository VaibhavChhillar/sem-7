import { useEffect, useState } from "react";
import "@/App.css";
import axios from "axios";
import { Bell, Battery, MapPin, Trash2, Gem, AlertCircle, Play, Pause, Home, TrendingUp, Clock, CheckCircle, XCircle, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [vacuumStatus, setVacuumStatus] = useState(null);
  const [detectedItems, setDetectedItems] = useState([]);
  const [valuables, setValuables] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchAllData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async () => {
    try {
      const [statusRes, itemsRes, valuablesRes, notifRes, statsRes, sessionsRes] = await Promise.all([
        axios.get(`${API}/vacuum/status`),
        axios.get(`${API}/items/detected?limit=20`),
        axios.get(`${API}/items/valuables`),
        axios.get(`${API}/notifications`),
        axios.get(`${API}/stats`),
        axios.get(`${API}/sessions?limit=5`)
      ]);

      setVacuumStatus(statusRes.data);
      setDetectedItems(itemsRes.data);
      setValuables(valuablesRes.data);
      setNotifications(notifRes.data);
      setStats(statsRes.data);
      setSessions(sessionsRes.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const controlVacuum = async (action) => {
    try {
      await axios.post(`${API}/vacuum/control`, { action });
      toast.success(`Vacuum ${action} command sent successfully`);
      setTimeout(fetchAllData, 500);
    } catch (error) {
      toast.error("Failed to control vacuum");
    }
  };

  const submitFeedback = async (itemId, feedback, correctedType = null) => {
    try {
      await axios.post(`${API}/items/feedback`, {
        itemId,
        feedback,
        correctedType,
        note: feedback === "incorrect" ? "User correction" : "Confirmed"
      });
      toast.success("Feedback submitted - helping improve accuracy!");
      fetchAllData();
    } catch (error) {
      toast.error("Failed to submit feedback");
    }
  };

  const markNotificationRead = async (notifId) => {
    try {
      await axios.post(`${API}/notifications/mark-read?notification_id=${notifId}`);
      fetchAllData();
    } catch (error) {
      console.error("Error marking notification:", error);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "valuable": return "text-emerald-400";
      case "trash": return "text-slate-400";
      case "unknown": return "text-amber-400";
      default: return "text-slate-400";
    }
  };

  const getTypeBadge = (type) => {
    const colors = {
      valuable: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      trash: "bg-slate-500/20 text-slate-400 border-slate-500/30",
      unknown: "bg-amber-500/20 text-amber-400 border-amber-500/30"
    };
    return colors[type] || colors.trash;
  };

  const getModeIcon = (mode) => {
    switch (mode) {
      case "cleaning": return <Play className="h-4 w-4" />;
      case "idle": return <Pause className="h-4 w-4" />;
      case "returning": return <Home className="h-4 w-4" />;
      case "charging": return <Battery className="h-4 w-4" />;
      default: return <Pause className="h-4 w-4" />;
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center">
        <div className="text-cyan-400 text-xl">Loading TreasureSense...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-slate-100">
      <Toaster position="top-right" richColors />
      
      {/* Header */}
      <header className="border-b border-slate-800/50 backdrop-blur-xl bg-slate-950/30 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Gem className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent" style={{fontFamily: 'Space Grotesk, sans-serif'}}>TreasureSense</h1>
                <p className="text-xs text-slate-400">Smart Vacuum System</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="relative border-slate-700 hover:border-cyan-500 hover:bg-cyan-500/10" data-testid="notifications-btn">
                    <Bell className="h-5 w-5" />
                    {notifications.filter(n => !n.isRead).length > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                        {notifications.filter(n => !n.isRead).length}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 bg-slate-900 border-slate-700">
                  <div className="p-2">
                    <h3 className="font-semibold mb-2 text-slate-200">Notifications</h3>
                    <ScrollArea className="h-64">
                      {notifications.slice(0, 5).map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-3 rounded-lg mb-2 cursor-pointer hover:bg-slate-800 ${
                            !notif.isRead ? "bg-slate-800/50" : "bg-slate-900"
                          }`}
                          onClick={() => markNotificationRead(notif.id)}
                          data-testid={`notification-${notif.id}`}
                        >
                          <p className="text-sm text-slate-300">{notif.message}</p>
                          <p className="text-xs text-slate-500 mt-1">{formatTimestamp(notif.timestamp)}</p>
                        </div>
                      ))}
                    </ScrollArea>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-900/50 border border-slate-800" data-testid="main-tabs">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400" data-testid="dashboard-tab">Dashboard</TabsTrigger>
            <TabsTrigger value="detected" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400" data-testid="detected-tab">Detection Feed</TabsTrigger>
            <TabsTrigger value="valuables" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400" data-testid="valuables-tab">Recovery Log</TabsTrigger>
            <TabsTrigger value="sessions" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400" data-testid="sessions-tab">Sessions</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6" data-testid="dashboard-content">
            {/* Vacuum Status Card */}
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
                  <div className={`h-3 w-3 rounded-full ${vacuumStatus?.isActive ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`}></div>
                  Vacuum Status
                </CardTitle>
                <CardDescription>Real-time monitoring and control</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-400">Battery</span>
                      <Battery className="h-4 w-4 text-cyan-400" />
                    </div>
                    <div className="text-2xl font-bold text-slate-100">{vacuumStatus?.battery}%</div>
                    <Progress value={vacuumStatus?.battery} className="mt-2 h-2" />
                  </div>
                  
                  <div className="p-4 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-400">Location</span>
                      <MapPin className="h-4 w-4 text-cyan-400" />
                    </div>
                    <div className="text-xl font-semibold text-slate-100">{vacuumStatus?.location}</div>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-400">Mode</span>
                      {getModeIcon(vacuumStatus?.mode)}
                    </div>
                    <div className="text-xl font-semibold text-slate-100 capitalize">{vacuumStatus?.mode}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-900/20 to-slate-900/50 border border-emerald-700/30">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <Gem className="h-6 w-6 text-emerald-400" />
                      </div>
                      <div>
                        <div className="text-sm text-slate-400">Valuables Bin</div>
                        <div className="text-2xl font-bold text-emerald-400">{vacuumStatus?.valuablesBinCount} items</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-slate-700/50 flex items-center justify-center">
                        <Trash2 className="h-6 w-6 text-slate-400" />
                      </div>
                      <div>
                        <div className="text-sm text-slate-400">Dust Bin Level</div>
                        <div className="text-2xl font-bold text-slate-100">{vacuumStatus?.dustBinLevel}%</div>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="bg-slate-800" />
                
                <div className="flex gap-3">
                  <Button
                    onClick={() => controlVacuum(vacuumStatus?.isActive ? "stop" : "start")}
                    className={`flex-1 ${
                      vacuumStatus?.isActive
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
                    }`}
                    data-testid="control-vacuum-btn"
                  >
                    {vacuumStatus?.isActive ? (
                      <><Pause className="mr-2 h-5 w-5" /> Stop Cleaning</>
                    ) : (
                      <><Play className="mr-2 h-5 w-5" /> Start Cleaning</>
                    )}
                  </Button>
                  <Button
                    onClick={() => controlVacuum("return")}
                    variant="outline"
                    className="border-slate-700 hover:border-cyan-500 hover:bg-cyan-500/10"
                    data-testid="return-home-btn"
                  >
                    <Home className="mr-2 h-5 w-5" /> Return Home
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-cyan-900/20 to-slate-900/50 border-cyan-700/30">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Items Detected</p>
                      <p className="text-3xl font-bold text-cyan-400" style={{fontFamily: 'Space Grotesk, sans-serif'}}>{stats?.totalItemsDetected}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-cyan-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-emerald-900/20 to-slate-900/50 border-emerald-700/30">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Valuables Saved</p>
                      <p className="text-3xl font-bold text-emerald-400" style={{fontFamily: 'Space Grotesk, sans-serif'}}>{stats?.valuablesSaved}</p>
                    </div>
                    <Gem className="h-8 w-8 text-emerald-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-blue-900/20 to-slate-900/50 border-blue-700/30">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Accuracy Rate</p>
                      <p className="text-3xl font-bold text-blue-400" style={{fontFamily: 'Space Grotesk, sans-serif'}}>{stats?.accuracyRate}%</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-900/20 to-slate-900/50 border-purple-700/30">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Total Sessions</p>
                      <p className="text-3xl font-bold text-purple-400" style={{fontFamily: 'Space Grotesk, sans-serif'}}>{stats?.totalSessions}</p>
                    </div>
                    <Clock className="h-8 w-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Categories */}
            {stats?.topCategories && stats.topCategories.length > 0 && (
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <CardTitle style={{fontFamily: 'Space Grotesk, sans-serif'}}>Top Detected Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.topCategories.map((cat, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-slate-300">{cat.category}</span>
                        <Badge variant="outline" className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                          {cat.count} items
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Detection Feed Tab */}
          <TabsContent value="detected" data-testid="detected-content">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle style={{fontFamily: 'Space Grotesk, sans-serif'}}>Real-Time Detection Feed</CardTitle>
                <CardDescription>All items detected by TreasureSense AI</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-4">
                    {detectedItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 hover:border-cyan-500/50 transition-all"
                        data-testid={`detected-item-${item.id}`}
                      >
                        <div className="flex gap-4">
                          {item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt={item.description}
                              className="w-20 h-20 rounded-lg object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-semibold text-slate-100 flex items-center gap-2">
                                  {item.description}
                                  <Badge className={getTypeBadge(item.type)}>
                                    {item.type}
                                  </Badge>
                                </h4>
                                <p className="text-sm text-slate-400 mt-1">
                                  {item.category} • {item.location}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-semibold text-cyan-400">
                                  {(item.confidence * 100).toFixed(0)}% confident
                                </div>
                                <div className="text-xs text-slate-500">
                                  {formatTimestamp(item.timestamp)}
                                </div>
                              </div>
                            </div>
                            
                            <Progress value={item.confidence * 100} className="h-1.5 mb-3" />
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  Chamber: {item.chamber}
                                </Badge>
                                {item.userFeedback && (
                                  <Badge className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                                    ✓ Feedback: {item.userFeedback}
                                  </Badge>
                                )}
                              </div>
                              
                              {!item.userFeedback && (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-green-700 hover:bg-green-500/10 hover:text-green-400"
                                    onClick={() => submitFeedback(item.id, "correct")}
                                    data-testid={`feedback-correct-${item.id}`}
                                  >
                                    <ThumbsUp className="h-3 w-3 mr-1" /> Correct
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-red-700 hover:bg-red-500/10 hover:text-red-400"
                                    onClick={() => submitFeedback(item.id, "incorrect", item.type === "valuable" ? "trash" : "valuable")}
                                    data-testid={`feedback-incorrect-${item.id}`}
                                  >
                                    <ThumbsDown className="h-3 w-3 mr-1" /> Incorrect
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Valuables Recovery Log Tab */}
          <TabsContent value="valuables" data-testid="valuables-content">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
                  <Gem className="h-5 w-5 text-emerald-400" />
                  Valuables Recovery Log
                </CardTitle>
                <CardDescription>All valuable items safely stored by TreasureSense</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-4">
                    {valuables.length === 0 ? (
                      <div className="text-center py-12 text-slate-400">
                        <Gem className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No valuables detected yet</p>
                      </div>
                    ) : (
                      valuables.map((item) => (
                        <div
                          key={item.id}
                          className="p-5 rounded-xl bg-gradient-to-br from-emerald-900/20 to-slate-900/50 border border-emerald-700/30 hover:border-emerald-500/50 transition-all"
                          data-testid={`valuable-item-${item.id}`}
                        >
                          <div className="flex gap-4">
                            {item.imageUrl && (
                              <img
                                src={item.imageUrl}
                                alt={item.description}
                                className="w-24 h-24 rounded-lg object-cover ring-2 ring-emerald-500/30"
                              />
                            )}
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className="font-semibold text-emerald-400 text-lg">{item.description}</h4>
                                  <p className="text-sm text-slate-400 mt-1">
                                    {item.category} • Found in {item.location}
                                  </p>
                                </div>
                                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                                  {(item.confidence * 100).toFixed(0)}% confident
                                </Badge>
                              </div>
                              
                              <div className="flex items-center gap-2 mt-3">
                                <Clock className="h-3 w-3 text-slate-500" />
                                <span className="text-xs text-slate-500">
                                  Detected {formatTimestamp(item.timestamp)}
                                </span>
                                {item.userFeedback && (
                                  <Badge className="text-xs bg-green-500/20 text-green-400 border-green-500/30 ml-auto">
                                    ✓ Verified
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions" data-testid="sessions-content">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle style={{fontFamily: 'Space Grotesk, sans-serif'}}>Cleaning Session History</CardTitle>
                <CardDescription>Past cleaning sessions and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="p-5 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50"
                      data-testid={`session-${session.id}`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-lg ${
                            session.status === "completed" ? "bg-green-500/20" : "bg-blue-500/20"
                          } flex items-center justify-center`}>
                            {session.status === "completed" ? (
                              <CheckCircle className="h-5 w-5 text-green-400" />
                            ) : (
                              <Clock className="h-5 w-5 text-blue-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-100">
                              {new Date(session.startTime).toLocaleDateString()} at {new Date(session.startTime).toLocaleTimeString()}
                            </div>
                            <div className="text-sm text-slate-400 capitalize">{session.status}</div>
                          </div>
                        </div>
                        <Badge variant="outline">{session.duration} min</Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <div className="text-xs text-slate-500">Items Detected</div>
                          <div className="text-lg font-semibold text-slate-100">{session.itemsDetected}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500">Valuables Saved</div>
                          <div className="text-lg font-semibold text-emerald-400">{session.valuablesSaved}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500">Trash Collected</div>
                          <div className="text-lg font-semibold text-slate-100">{session.trashCollected}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500">Area Cleaned</div>
                          <div className="text-lg font-semibold text-slate-100">{session.areaCleanedSqFt} sq ft</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 mt-12 py-6 bg-slate-950/30">
        <div className="container mx-auto px-4 text-center text-sm text-slate-500">
          <p>TreasureSense Smart Vacuum Cleaner • AI-Powered Value Protection</p>
        </div>
      </footer>
    </div>
  );
}

export default App;