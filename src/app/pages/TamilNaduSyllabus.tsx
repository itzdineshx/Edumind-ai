import { useState } from "react";
import {
  BookOpen,
  ChevronRight,
  Star,
  FileText,
  Brain,
  FlaskConical,
  Cpu,
  Database,
  Code,
  Layers,
  Clock,
  TrendingUp,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Loader2,
} from "lucide-react";
import { answerExamQuestion } from "../../lib/gemini";

const subjects: {
  id: string;
  name: string;
  code: string;
  semester: string;
  icon: typeof FlaskConical;
  color: string;
  bg: string;
  units: number;
  chapters: number;
  difficulty: string;
  topics: string[];
  prevQuestions: { year: number; q: string; marks: number }[];
  examPattern: { theory: number; practical: number; duration: string; pass: number };
}[] = [
  {
    id: "ds",
    name: "Data Structures",
    code: "CS3301",
    semester: "Sem 3",
    icon: Database,
    color: "#2563EB",
    bg: "rgba(37,99,235,0.08)",
    units: 5,
    chapters: 12,
    difficulty: "High",
    topics: [
      "Arrays, Linked Lists & their operations",
      "Stacks — Applications (Infix to Postfix, Evaluation)",
      "Queues — Circular Queue, Priority Queue, Dequeue",
      "Binary Trees — Traversals (In, Pre, Post order)",
      "Binary Search Trees — Insertion, Deletion, Search",
      "AVL Trees — Rotations (LL, RR, LR, RL)",
      "B-Trees and B+ Trees",
      "Hashing — Separate Chaining, Open Addressing",
      "Graphs — BFS, DFS Traversals",
      "Shortest Path — Dijkstra's & Bellman-Ford",
      "Minimum Spanning Tree — Prim's & Kruskal's",
      "Sorting — Quick Sort, Merge Sort, Heap Sort",
    ],
    prevQuestions: [
      { year: 2024, q: "Explain the different rotations in AVL trees with examples. Construct an AVL tree for the sequence 21, 26, 30, 9, 4, 14, 28, 18, 15, 10, 2, 3, 7.", marks: 13 },
      { year: 2024, q: "Write the algorithm for Dijkstra's shortest path and trace it on a given graph.", marks: 15 },
      { year: 2023, q: "Convert the expression A + B * C – D / E into postfix using stack. Trace the algorithm.", marks: 13 },
      { year: 2023, q: "Explain separate chaining and open addressing collision resolution techniques with examples.", marks: 13 },
      { year: 2023, q: "Describe BFS and DFS graph traversal algorithms. Illustrate with a suitable example graph.", marks: 15 },
      { year: 2022, q: "Define Binary Search Tree. Write recursive algorithms for insertion, deletion, and search operations.", marks: 13 },
      { year: 2022, q: "Compare Prim's and Kruskal's algorithms for Minimum Spanning Tree. Trace on a weighted graph.", marks: 13 },
      { year: 2022, q: "Explain Circular Queue operations with front and rear pointer management. Write enqueue and dequeue algorithms.", marks: 13 },
    ],
    examPattern: { theory: 75, practical: 25, duration: "3 hours", pass: 50 },
  },
  {
    id: "dbms",
    name: "Database Management Systems",
    code: "CS3492",
    semester: "Sem 4",
    icon: Database,
    color: "#7C3AED",
    bg: "rgba(124,58,237,0.08)",
    units: 5,
    chapters: 14,
    difficulty: "Medium",
    topics: [
      "ER Model — Entities, Attributes, Relationships, Cardinality",
      "Relational Model — Keys, Constraints, Schema",
      "SQL — DDL, DML, DCL, TCL Queries",
      "Normalization — 1NF, 2NF, 3NF, BCNF",
      "Functional Dependencies & Decomposition",
      "Transaction Management — ACID Properties",
      "Concurrency Control — Locks, Two-Phase Locking, Timestamps",
      "Recovery Techniques — Log-Based, Checkpointing",
      "Indexing — B-Tree, B+ Tree, Hashing",
      "Query Processing & Optimization",
      "NoSQL Basics — Document, Key-Value, Graph Databases",
    ],
    prevQuestions: [
      { year: 2024, q: "Design an ER diagram for a University database with entities Student, Course, Faculty, and Department. Map it to relational tables.", marks: 15 },
      { year: 2024, q: "Explain normalization up to BCNF with suitable examples. Demonstrate 1NF, 2NF, 3NF, and BCNF.", marks: 13 },
      { year: 2023, q: "Discuss Two-Phase Locking protocol. How does it ensure serializability? Explain with examples.", marks: 13 },
      { year: 2023, q: "Write SQL queries: (a) nested subquery, (b) correlated subquery, (c) JOIN operations with examples.", marks: 13 },
      { year: 2023, q: "Explain ACID properties of transactions with real-world examples.", marks: 13 },
      { year: 2022, q: "Describe B+ Tree indexing. Show insertion and deletion with a worked example.", marks: 13 },
      { year: 2022, q: "Explain log-based recovery techniques — immediate update and deferred update.", marks: 13 },
    ],
    examPattern: { theory: 75, practical: 25, duration: "3 hours", pass: 50 },
  },
  {
    id: "os",
    name: "Operating Systems",
    code: "CS3401",
    semester: "Sem 4",
    icon: Layers,
    color: "#06B6D4",
    bg: "rgba(6,182,212,0.08)",
    units: 5,
    chapters: 13,
    difficulty: "High",
    topics: [
      "Process Concepts — States, PCB, Context Switching",
      "CPU Scheduling — FCFS, SJF, Round Robin, Priority",
      "Process Synchronization — Semaphores, Monitors",
      "Deadlock — Prevention, Avoidance (Banker's Algorithm), Detection",
      "Memory Management — Paging, Segmentation",
      "Virtual Memory — Demand Paging, Page Replacement (FIFO, LRU, Optimal)",
      "File Systems — Allocation Methods, Directory Structure",
      "Disk Scheduling — FCFS, SSTF, SCAN, C-SCAN",
      "Inter-Process Communication — Shared Memory, Message Passing",
      "Threads — User & Kernel Level, Multithreading Models",
    ],
    prevQuestions: [
      { year: 2024, q: "Apply Banker's algorithm to determine safe sequence for the given resource allocation table.", marks: 15 },
      { year: 2024, q: "Compare FIFO, LRU, and Optimal page replacement algorithms with a reference string example.", marks: 13 },
      { year: 2023, q: "Explain the Producer-Consumer problem using semaphores. Write the pseudocode.", marks: 13 },
      { year: 2023, q: "Compare and contrast all CPU scheduling algorithms. Calculate average waiting time for a given set of processes.", marks: 13 },
      { year: 2023, q: "Explain paging and segmentation with diagrams. How is logical address translated to physical address?", marks: 15 },
      { year: 2022, q: "Describe the Dining Philosophers problem. Explain the solution using monitors.", marks: 13 },
      { year: 2022, q: "Discuss various disk scheduling algorithms with suitable examples. Compare their performance.", marks: 13 },
    ],
    examPattern: { theory: 75, practical: 25, duration: "3 hours", pass: 50 },
  },
  {
    id: "daa",
    name: "Design & Analysis of Algorithms",
    code: "CS3401",
    semester: "Sem 4",
    icon: Brain,
    color: "#10B981",
    bg: "rgba(16,185,129,0.08)",
    units: 5,
    chapters: 12,
    difficulty: "High",
    topics: [
      "Asymptotic Notations — Big O, Omega, Theta Analysis",
      "Divide & Conquer — Merge Sort, Quick Sort, Binary Search",
      "Recurrence Relations — Master Theorem, Substitution Method",
      "Greedy Algorithms — Activity Selection, Huffman Coding",
      "Knapsack Problem — Fractional (Greedy) vs 0/1 (DP)",
      "Dynamic Programming — LCS, Matrix Chain Multiplication, Floyd-Warshall",
      "Backtracking — N-Queens, Subset Sum, Graph Coloring",
      "Branch & Bound — Travelling Salesman Problem",
      "String Matching — Naive, Rabin-Karp, KMP Algorithm",
      "NP-Completeness — P vs NP, Reduction Techniques",
    ],
    prevQuestions: [
      { year: 2024, q: "Solve the 0/1 Knapsack problem using Dynamic Programming for given weights and values.", marks: 15 },
      { year: 2024, q: "Explain the Master Theorem. Solve T(n) = 2T(n/2) + n using the theorem.", marks: 13 },
      { year: 2023, q: "Apply Dijkstra's algorithm on a given weighted graph. Trace the steps clearly.", marks: 13 },
      { year: 2023, q: "Explain the N-Queens problem. Solve for N=4 using backtracking with state space tree.", marks: 13 },
      { year: 2023, q: "Build a Huffman tree for a given set of characters with frequencies. Show encoding.", marks: 13 },
      { year: 2022, q: "Compare Divide & Conquer, Greedy, and Dynamic Programming paradigms with examples.", marks: 15 },
      { year: 2022, q: "Explain Matrix Chain Multiplication using DP. Solve for matrices A1(10×30), A2(30×5), A3(5×60).", marks: 13 },
    ],
    examPattern: { theory: 100, practical: 0, duration: "3 hours", pass: 50 },
  },
  {
    id: "cn",
    name: "Computer Networks",
    code: "CS3591",
    semester: "Sem 5",
    icon: Cpu,
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.08)",
    units: 5,
    chapters: 14,
    difficulty: "Medium",
    topics: [
      "OSI & TCP/IP Reference Models — Layer Functions",
      "Data Link Layer — Framing, Error Detection (CRC, Checksum)",
      "Sliding Window Protocols — Go-Back-N, Selective Repeat",
      "Network Layer — IP Addressing, Subnetting, CIDR",
      "Routing Algorithms — Distance Vector, Link State, OSPF",
      "Transport Layer — TCP vs UDP, Flow Control, Congestion Control",
      "TCP 3-Way Handshake & Connection Management",
      "Application Layer — DNS, HTTP, FTP, SMTP, DHCP",
      "Network Security — Firewalls, VPN, SSL/TLS",
      "Wireless & Mobile Networks — WiFi, Cellular, Bluetooth",
    ],
    prevQuestions: [
      { year: 2024, q: "Compare OSI and TCP/IP models. Explain the functions of each layer with suitable examples.", marks: 15 },
      { year: 2024, q: "Explain subnetting. Given IP 192.168.1.0/24, subnet into 4 subnets. Show subnet mask and ranges.", marks: 13 },
      { year: 2023, q: "Explain Go-Back-N and Selective Repeat ARQ protocols with timing diagrams.", marks: 13 },
      { year: 2023, q: "Describe Dijkstra's link state routing algorithm. Trace for a given network topology.", marks: 13 },
      { year: 2023, q: "Explain TCP congestion control mechanisms — Slow Start, Congestion Avoidance, Fast Retransmit.", marks: 13 },
      { year: 2022, q: "Describe the DNS hierarchy and name resolution process. Explain recursive and iterative queries.", marks: 13 },
      { year: 2022, q: "Explain CRC error detection method. Compute CRC for data 1101011011 with divisor 10011.", marks: 13 },
    ],
    examPattern: { theory: 75, practical: 25, duration: "3 hours", pass: 50 },
  },
  {
    id: "ooad",
    name: "Object Oriented Analysis & Design",
    code: "CS3592",
    semester: "Sem 5",
    icon: Code,
    color: "#EF4444",
    bg: "rgba(239,68,68,0.08)",
    units: 5,
    chapters: 11,
    difficulty: "Medium",
    topics: [
      "UML Diagrams — Use Case, Class, Sequence, Activity",
      "Object-Oriented Concepts — Encapsulation, Inheritance, Polymorphism",
      "Design Patterns — Singleton, Factory, Observer, Strategy",
      "SOLID Principles",
      "Architectural Patterns — MVC, Layered, Client-Server",
      "Requirements Analysis — Use Case Modeling & Narratives",
      "Domain Modeling — Conceptual Classes, Associations",
      "Interaction Diagrams — Sequence & Communication",
      "State Machine Diagrams",
      "Component & Deployment Diagrams",
    ],
    prevQuestions: [
      { year: 2024, q: "Draw a Use Case diagram and Class diagram for an Online Shopping System.", marks: 15 },
      { year: 2024, q: "Explain the GRASP patterns — Creator, Information Expert, Controller, Low Coupling, High Cohesion.", marks: 13 },
      { year: 2023, q: "Describe Singleton and Factory design patterns with Java/C++ code examples.", marks: 13 },
      { year: 2023, q: "Draw a Sequence diagram for ATM withdrawal process. Include all actors and messages.", marks: 13 },
      { year: 2023, q: "Explain the MVC architectural pattern. How is it applied in web applications?", marks: 13 },
      { year: 2022, q: "Explain all types of UML diagrams with examples. Classify structural and behavioral diagrams.", marks: 15 },
      { year: 2022, q: "What are SOLID principles? Explain each with a code example.", marks: 13 },
    ],
    examPattern: { theory: 75, practical: 25, duration: "3 hours", pass: 50 },
  },
];

export function TamilNaduSyllabus() {
  const [selectedSubject, setSelectedSubject] = useState<typeof subjects[0] | null>(null);
  const [activeSection, setActiveSection] = useState<"topics" | "questions" | "pattern">("topics");
  const [expandedTopic, setExpandedTopic] = useState<number | null>(null);
  const [aiAnswers, setAiAnswers] = useState<Record<string, string>>({});
  const [loadingAnswer, setLoadingAnswer] = useState<string | null>(null);

  const handleGetAiAnswer = async (subjectName: string, question: string, marks: number, key: string) => {
    if (aiAnswers[key]) return; // already fetched
    setLoadingAnswer(key);
    try {
      const answer = await answerExamQuestion(question, subjectName, marks);
      setAiAnswers((prev) => ({ ...prev, [key]: answer }));
    } catch {
      setAiAnswers((prev) => ({ ...prev, [key]: "Failed to generate answer. Please try again." }));
    } finally {
      setLoadingAnswer(null);
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 p-5 rounded-2xl text-white" style={{ background: "linear-gradient(135deg, #1e1b4b, #2563EB, #7C3AED)" }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-white" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "1.2rem" }}>
              Tamil Nadu Syllabus
            </h2>
            <p className="text-white/70 text-sm">Anna University & TN Engineering Colleges — Regulation 2021</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Subject Cards */}
        <div className="lg:col-span-2 space-y-3">
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">Select Subject</p>
          {subjects.map((subject) => (
            <button
              key={subject.id}
              onClick={() => { setSelectedSubject(subject); setActiveSection("topics"); }}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all duration-200
                ${selectedSubject?.id === subject.id
                  ? "border-transparent shadow-lg text-white"
                  : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm"
                }`}
              style={selectedSubject?.id === subject.id ? { background: `linear-gradient(135deg, ${subject.color}, ${subject.color}bb)` } : {}}
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: selectedSubject?.id === subject.id ? "rgba(255,255,255,0.2)" : subject.bg,
                }}>
                <subject.icon className="w-5 h-5"
                  style={{ color: selectedSubject?.id === subject.id ? "white" : subject.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={`font-semibold text-sm truncate ${selectedSubject?.id === subject.id ? "text-white" : "text-gray-900"}`}
                    style={{ fontFamily: "'Poppins', sans-serif" }}>
                    {subject.name}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 font-medium
                    ${subject.difficulty === "High"
                      ? selectedSubject?.id === subject.id ? "bg-white/20 text-white" : "bg-red-50 text-red-600"
                      : selectedSubject?.id === subject.id ? "bg-white/20 text-white" : "bg-yellow-50 text-yellow-600"
                    }`}>
                    {subject.difficulty}
                  </span>
                </div>
                <p className={`text-xs mt-0.5 ${selectedSubject?.id === subject.id ? "text-white/70" : "text-gray-400"}`}>
                  {subject.code} · {subject.semester}
                </p>
              </div>
              <ChevronRight className={`w-4 h-4 flex-shrink-0 ${selectedSubject?.id === subject.id ? "text-white" : "text-gray-300"}`} />
            </button>
          ))}
        </div>

        {/* Subject Detail */}
        <div className="lg:col-span-3">
          {!selectedSubject ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-full flex flex-col items-center justify-center p-12 text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: "rgba(37,99,235,0.08)" }}>
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-gray-900 mb-2" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}>
                Select a Subject
              </h3>
              <p className="text-gray-400 text-sm">Choose a subject from the left to view important topics, previous year questions, and exam patterns.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Subject Header */}
              <div className="p-5 text-white relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${selectedSubject.color}dd, ${selectedSubject.color}88)` }}>
                <div className="absolute top-0 right-0 w-32 h-32 opacity-10"
                  style={{ background: "radial-gradient(circle, white, transparent)" }} />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <selectedSubject.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700 }}>
                        {selectedSubject.name}
                      </h3>
                      <p className="text-white/70 text-xs">{selectedSubject.code} · {selectedSubject.semester}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedSubject(null)} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
                <div className="flex gap-4 mt-4">
                  {[
                    { label: "Units", value: selectedSubject.units },
                    { label: "Chapters", value: selectedSubject.chapters },
                    { label: "Pass Mark", value: `${selectedSubject.examPattern.pass}%` },
                  ].map((s) => (
                    <div key={s.label} className="bg-white/10 rounded-xl px-3 py-2 text-center">
                      <p className="text-white font-bold">{s.value}</p>
                      <p className="text-white/70 text-xs">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-100">
                {[
                  { key: "topics" as const, label: "Important Topics", icon: Star },
                  { key: "questions" as const, label: "Previous Questions", icon: FileText },
                  { key: "pattern" as const, label: "Exam Pattern", icon: TrendingUp },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveSection(tab.key)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-all
                      ${activeSection === tab.key
                        ? "border-b-2 bg-blue-50/30"
                        : "border-transparent text-gray-400 hover:text-gray-600"
                      }`}
                    style={{ borderBottomColor: activeSection === tab.key ? selectedSubject.color : "transparent",
                      color: activeSection === tab.key ? selectedSubject.color : undefined }}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="hidden sm:block">{tab.label}</span>
                  </button>
                ))}
              </div>

              <div className="p-5 overflow-y-auto" style={{ maxHeight: "420px" }}>
                {activeSection === "topics" && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-4 p-3 rounded-xl"
                      style={{ background: "rgba(37,99,235,0.04)" }}>
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <p className="text-blue-700 text-sm font-medium">AI-highlighted important topics for exams</p>
                    </div>
                    {selectedSubject.topics.map((topic, i) => (
                      <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                        <button
                          className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors text-left"
                          onClick={() => setExpandedTopic(expandedTopic === i ? null : i)}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                              style={{ background: selectedSubject.color }}>
                              {i + 1}
                            </span>
                            <span className="text-gray-800 text-sm font-medium">{topic}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              i % 3 === 0 ? "bg-red-50 text-red-600" : i % 3 === 1 ? "bg-yellow-50 text-yellow-600" : "bg-green-50 text-green-600"
                            }`}>
                              {i % 3 === 0 ? "★ High Priority" : i % 3 === 1 ? "Medium" : "Low"}
                            </span>
                            {expandedTopic === i
                              ? <ChevronUp className="w-4 h-4 text-gray-400" />
                              : <ChevronDown className="w-4 h-4 text-gray-400" />
                            }
                          </div>
                        </button>
                        {expandedTopic === i && (
                          <div className="px-4 pb-3 border-t border-gray-50">
                            <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                              This topic has been frequently asked in previous year examinations. Focus on understanding the core concepts, definitions, and real-world applications. Practice numerical problems if applicable.
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs px-2 py-1 rounded-lg bg-blue-50 text-blue-600 font-medium flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Appeared 3x in last 5 years
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {activeSection === "questions" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-yellow-50">
                      <FileText className="w-4 h-4 text-yellow-600" />
                      <p className="text-yellow-700 text-sm font-medium">Previous year examination questions</p>
                    </div>
                    {selectedSubject.prevQuestions.map((pq, i) => (
                      <div key={i} className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold px-2 py-1 rounded-lg"
                            style={{ background: `${selectedSubject.color}15`, color: selectedSubject.color }}>
                            {pq.year} Exam
                          </span>
                          <span className="text-xs text-gray-400 font-medium">{pq.marks} Marks</span>
                        </div>
                        <p className="text-gray-800 text-sm leading-relaxed">{pq.q}</p>
                        <button
                          className="mt-3 flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-70 disabled:opacity-50"
                          style={{ color: selectedSubject.color }}
                          disabled={loadingAnswer === `${selectedSubject.id}-${i}`}
                          onClick={() => handleGetAiAnswer(selectedSubject.name, pq.q, pq.marks, `${selectedSubject.id}-${i}`)}
                        >
                          {loadingAnswer === `${selectedSubject.id}-${i}` ? (
                            <><Loader2 className="w-3 h-3 animate-spin" /> Generating...</>
                          ) : aiAnswers[`${selectedSubject.id}-${i}`] ? (
                            <><Sparkles className="w-3 h-3" /> {aiAnswers[`${selectedSubject.id}-${i}`] === "Failed to generate answer. Please try again." ? "Retry AI Answer" : "Hide / Show Answer"}</>
                          ) : (
                            <><Sparkles className="w-3 h-3" /> Get AI Answer</>
                          )}
                        </button>
                        {aiAnswers[`${selectedSubject.id}-${i}`] && (
                          <div className="mt-3 p-4 rounded-xl border border-blue-100 bg-blue-50/50">
                            <div className="flex items-center gap-2 mb-2">
                              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                              <span className="text-xs font-semibold text-blue-700">AI Generated Answer</span>
                            </div>
                            <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                              {aiAnswers[`${selectedSubject.id}-${i}`]}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {activeSection === "pattern" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: "Theory Marks", value: `${selectedSubject.examPattern.theory}%`, color: "#2563EB" },
                        { label: "Practical Marks", value: `${selectedSubject.examPattern.practical}%`, color: "#7C3AED" },
                        { label: "Duration", value: selectedSubject.examPattern.duration, color: "#06B6D4" },
                        { label: "Pass Percentage", value: `${selectedSubject.examPattern.pass}%`, color: "#10B981" },
                      ].map((item) => (
                        <div key={item.label} className="p-4 rounded-xl border border-gray-100 text-center">
                          <p className="text-2xl font-bold mb-1" style={{ fontFamily: "'Poppins', sans-serif", color: item.color }}>
                            {item.value}
                          </p>
                          <p className="text-gray-500 text-xs">{item.label}</p>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-xl border border-gray-100 overflow-hidden">
                      <div className="p-4 border-b border-gray-50 bg-gray-50">
                        <p className="text-gray-700 text-sm font-semibold">Question Paper Structure</p>
                      </div>
                      <div className="divide-y divide-gray-50">
                        {[
                          { part: "Part A", type: "Short Answers", questions: "10 × 2 = 20 marks", note: "All questions compulsory" },
                          { part: "Part B", type: "Paragraph Answers", questions: "5 × 13 = 65 marks", note: "Either or questions" },
                          { part: "Part C", type: "Big Answers", questions: "1 × 15 = 15 marks", note: "Open choice" },
                        ].map((row) => (
                          <div key={row.part} className="flex items-center gap-4 p-3">
                            <span className="w-16 text-xs font-bold px-2 py-1 rounded-lg text-center flex-shrink-0"
                              style={{ background: `${selectedSubject.color}15`, color: selectedSubject.color }}>
                              {row.part}
                            </span>
                            <div className="flex-1">
                              <p className="text-gray-800 text-sm font-medium">{row.type}</p>
                              <p className="text-gray-400 text-xs">{row.note}</p>
                            </div>
                            <span className="text-gray-600 text-xs font-medium">{row.questions}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
