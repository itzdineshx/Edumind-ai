import { useState, useRef } from "react";
import {
  Send,
  Bot,
  User,
  FileText,
  Upload,
  Search,
  BookOpen,
  Copy,
  ThumbsUp,
  ThumbsDown,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { uploadPDF, askQuestion } from "../../services/pdfAI";

interface Message {
  id: number;
  role: "user" | "ai";
  content: string;
  page?: number;
  highlight?: string;
}

export function PDFSmartSearch() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasFile, setHasFile] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [pdfName, setPdfName] = useState("");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file || !file.name.toLowerCase().endsWith(".pdf")) return;
    setPdfName(file.name);
    setMessages([]);
    setIsUploading(true);
    // Create blob URL for PDF preview
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(URL.createObjectURL(file));
    try {
      await uploadPDF(file);
      setHasFile(true);
      setMessages([{
        id: 1,
        role: "ai",
        content: `I've loaded **${file.name}**. I'm ready to answer your questions about this document. What would you like to know?`,
      }]);
    } catch {
      setHasFile(false);
      setMessages([{
        id: 1,
        role: "ai",
        content: "Sorry, I had trouble processing that PDF. Make sure the backend server is running and try again.",
      }]);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    if (!hasFile) {
      setMessages((prev) => [...prev, {
        id: prev.length + 1,
        role: "ai",
        content: "Please upload a PDF first so I can answer your questions.",
      }]);
      return;
    }
    const question = input;
    const userMsg: Message = { id: messages.length + 1, role: "user", content: question };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    try {
      const answer = await askQuestion(question);
      setMessages((prev) => [...prev, {
        id: prev.length + 1,
        role: "ai",
        content: answer,
      }]);
    } catch {
      setMessages((prev) => [...prev, {
        id: prev.length + 1,
        role: "ai",
        content: "Sorry, something went wrong. Please try again.",
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-[calc(100vh-65px)] flex overflow-hidden">
      {/* Left: PDF Viewer */}
      <div className="hidden md:flex w-1/2 flex-col border-r border-gray-200 bg-gray-50">
        {/* PDF Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span className="text-gray-700 text-sm font-medium truncate max-w-[200px]">
              {pdfName || "No PDF loaded"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setZoom(z => Math.max(z - 10, 50))}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs text-gray-500 w-12 text-center">{zoom}%</span>
            <button onClick={() => setZoom(z => Math.min(z + 10, 150))}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PDF Content */}
        <div className="flex-1 overflow-hidden">
          {pdfUrl ? (
            <object
              data={pdfUrl}
              type="application/pdf"
              className="w-full h-full"
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top left", width: `${10000 / zoom}%`, height: `${10000 / zoom}%` }}
            >
              <p className="p-8 text-gray-500 text-sm text-center">
                Your browser cannot display this PDF.{" "}
                <a href={pdfUrl} download={pdfName} className="text-blue-600 underline">Download it</a> instead.
              </p>
            </object>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.1), rgba(124,58,237,0.1))" }}>
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-gray-900 font-semibold text-sm mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>
                No PDF uploaded yet
              </p>
              <p className="text-gray-400 text-xs">Upload a PDF to preview it here</p>
            </div>
          )}
        </div>
      </div>

      {/* Right: Chat Interface */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Chat Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}>
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-gray-900 text-sm font-semibold">PDF AI Assistant</p>
              <p className="text-green-500 text-xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                Ready to answer
              </p>
            </div>
          </div>
          {!hasFile && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium text-white"
                style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}>
                <Upload className="w-3.5 h-3.5" /> {isUploading ? "Uploading..." : "Upload PDF"}
              </button>
            </>
          )}
          {hasFile && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5" /> {isUploading ? "Uploading..." : "Change PDF"}
              </button>
            </>
          )}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium text-blue-600 bg-blue-50 md:hidden">
            <BookOpen className="w-3.5 h-3.5" /> Page {currentPage}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Intro */}
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.1), rgba(124,58,237,0.1))" }}>
              <Search className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-gray-900 font-semibold text-sm" style={{ fontFamily: "'Poppins', sans-serif" }}>PDF Smart Search</p>
            <p className="text-gray-400 text-xs mt-1">Ask any question about your uploaded document</p>
          </div>

          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0
                ${msg.role === "user" ? "bg-gray-100" : ""}`}
                style={msg.role === "ai" ? { background: "linear-gradient(135deg, #2563EB, #7C3AED)" } : {}}>
                {msg.role === "ai"
                  ? <Bot className="w-4 h-4 text-white" />
                  : <User className="w-4 h-4 text-gray-500" />
                }
              </div>

              <div className={`flex flex-col gap-2 max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <div className={`rounded-2xl px-4 py-3 ${msg.role === "user"
                  ? "text-white rounded-tr-sm"
                  : "bg-gray-50 text-gray-800 rounded-tl-sm border border-gray-100"
                  }`}
                  style={msg.role === "user" ? { background: "linear-gradient(135deg, #2563EB, #7C3AED)" } : {}}>
                  <p className="text-sm whitespace-pre-line leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/•/g, '&bull;')
                    }} />
                </div>

                {/* AI Source Card */}
                {msg.role === "ai" && msg.page && (
                  <div className="flex items-start gap-2 p-3 rounded-xl border border-blue-100 bg-blue-50/50 max-w-full">
                    <BookOpen className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-blue-700 text-xs font-semibold mb-0.5">📄 Found on Page {msg.page}</p>
                      <p className="text-blue-600 text-xs leading-relaxed italic truncate">"{msg.highlight}"</p>
                    </div>
                    <button onClick={() => setCurrentPage(msg.page!)}
                      className="flex-shrink-0 text-blue-600 text-xs font-medium hover:underline">
                      Go to page
                    </button>
                  </div>
                )}

                {msg.role === "ai" && (
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                      <ThumbsUp className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                      <ThumbsDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}>
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-50 rounded-2xl rounded-tl-sm px-4 py-3 border border-gray-100">
                <div className="flex gap-1 items-center">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-100 bg-white">
          <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3 border border-gray-200 focus-within:border-blue-300 transition-colors">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask anything from your notes..."
              className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400 text-sm"
            />
            <button
              onClick={handleSend}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all hover:opacity-90 hover:scale-105 flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-center text-gray-300 text-xs mt-2">AI may make mistakes. Verify important information.</p>
        </div>
      </div>
    </div>
  );
}
