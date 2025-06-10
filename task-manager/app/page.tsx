'use client';
import React  from "react";
import {useState, useEffect, useRef, useMemo} from "react";
import * as Icon from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { FileText, AlertTriangle , ArrowLeft, MessageCircle, UploadCloud, Users, PenTool, SendHorizonal, MoreVertical, StickyNote, Highlighter, Eraser, Undo2, FileEdit, PenLine, Save, Trash2 } from "lucide-react";
import { ReactSketchCanvas } from "react-sketch-canvas";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";

import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";
import { LineChartIcon, BarChartIcon, PieChartIcon } from "lucide-react";
import clsx from "classnames";


interface MenuItem {
  id: string;
  title: string;
  icon: keyof typeof Icon;
}

type ChartData = {
  name: string;
  tasksCreated: number;
  tasksCompleted?: number;
  activeUsers?: number;
};


const users = [
  { id: 1, name: "John Doe", avatar: "https://placehold.co/400", status: "Online" },
  { id: 2, name: "Jane Smith", avatar: "https://placehold.co/400", status: "Offline" },
  { id: 3, name: "Alice Ray", avatar: "https://placehold.co/400", status: "Online" },
];

const App: React.FC = () => {

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [selectedUser, setSelectedUser] = useState<{
    id: number;
    name: string;
    avatar: string;
    status: string;
  } | null>(null);
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobileOrTablet(window.innerWidth <= 1024); 
    };

    checkScreenSize(); 
    window.addEventListener("resize", checkScreenSize); 
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);
  const [activityHistory, setActivityHistory] = useState([
    {
      label: 'Edited "Project Proposal"',
      time: '2h ago',
      icon: <FileText className="w-4 h-4 text-blue-400" />,
    },
    {
      label: 'Commented on "Dashboard UI"',
      time: '4h ago',
      icon: <MessageCircle className="w-4 h-4 text-green-400" />,
    },
    {
      label: 'Uploaded "Meeting Notes.pdf"',
      time: '1d ago',
      icon: <UploadCloud className="w-4 h-4 text-purple-400" />,
    },
    {
      label: 'Joined "Design Sprint"',
      time: '3d ago',
      icon: <Users className="w-4 h-4 text-orange-400" />,
    },
  ]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    console.log(mobileMenuOpen);
  };

  const menuItems: MenuItem[] = [
    { id: "home", title: "Home", icon: "Home" },
    { id: "Annotation", title: "Annotation", icon: "SquarePen" },
    { id: "Charts", title: "Charts", icon: "ChartNoAxesCombined" },
    { id: "Elicitation", title: "Elicitation", icon: "NotebookPen" },
    { id: "Editor", title: "Editor", icon: "FileEdit" },
  ];

  const scrollToSection = (id: string) => {
    const element = sectionRefs.current[id];
    if (element) {
      window.scrollTo({
        top: element.offsetTop,
        behavior: 'smooth'
      });
      setActiveSection(id);
    }
  };
  
  const registerSection = (id: string, ref: HTMLDivElement | null) => {
    if (ref) {
      sectionRefs.current[id] = ref;
    }
  };

  const [messages, setMessages] = useState([
    { sender: "user", text: "Hey! How can I help you today?" },
    { sender: "me", text: "I'm looking to revamp my portfolio. Got any ideas?" },
    { sender: "user", text: "Absolutely! I can help with design, layout, and interaction ideas." },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (input.trim()) {
      setMessages((prev) => [...prev, { sender: "me", text: input.trim() }]);
      setInput("");
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;

      for (const section in sectionRefs.current) {
        const element = sectionRefs.current[section];
        if (element) {
          const offsetTop = element.offsetTop;
          const height = element.offsetHeight;

          if (scrollPosition >= offsetTop - 200 && scrollPosition < offsetTop + height - 200) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // CANVAS
  const canvasRef = useRef<any>(null);
  const [tool, setTool] = useState<"pen" | "marker" | "eraser">("pen");
  const [color, setColor] = useState("#00BC91");

  // Charts
  const defaultData: ChartData[] = [
    { name: "Jan", tasksCreated: 32, tasksCompleted: 18, activeUsers: 10 },
    { name: "Feb", tasksCreated: 45, tasksCompleted: 30, activeUsers: 12 },
    { name: "Mar", tasksCreated: 60, tasksCompleted: 50, activeUsers: 15 },
    { name: "Apr", tasksCreated: 48, tasksCompleted: 42, activeUsers: 14 },
    { name: "May", tasksCreated: 52, tasksCompleted: 47, activeUsers: 17 },
    { name: "Jun", tasksCreated: 40, tasksCompleted: 35, activeUsers: 13 }
  ];

  const [data, setData] = useState<ChartData[]>(defaultData);
  const [chartType, setChartType] = useState<"line" | "bar" | "pie">("line");

  const handleAddRow = () => {
    const newRow = { name: "", tasksCreated: 0 }; 
      setData(prev => [...prev, newRow]);
  };

  const handleRemoveRow = () => {
    setData(prev => prev.slice(0, -1));
  };
  const columns = useMemo(
    () => [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "tasksCreated", header: "tasksCreated" },
      { accessorKey: "tasksCompleted", header: "tasksCompleted" },
      { accessorKey: "activeUsers", header: "activeUsers" },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      updateData: (rowIndex: number, columnId: string, value: string | number) => {
        setData((old) =>
          old.map((row, index) =>
            index === rowIndex ? { ...row, [columnId]: columnId === "name" ? value : +value } : row
          )
        );
      },
    },
  });

  const renderChart = () => {
    const gridColor = "#a4fae6";
    const axisColor = "#CCCCCC";
    const tooltipBg = "#1A1A1A";
    const mainColor = "#00BC91";
    const accentColor = "#00A77F";
    const textColor = "#F1F5F9"; 
    const colors = ["#00BC91", "#00A77F", "#14B8A6", "#06B6D4", "#4ADE80", "#FBBF24"];
    const lineKeys = ["tasksCreated", "tasksCompleted", "activeUsers"];
    const barKeys = ["tasksCreated", "tasksCompleted", "activeUsers"];


    if (chartType === "line") {
      return (
          <LineChart data={data}>
            <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
            <XAxis dataKey="name" stroke={axisColor} tick={{ fill: textColor }} />
            <YAxis stroke={axisColor} tick={{ fill: textColor }} />
            <Tooltip
              contentStyle={{ backgroundColor: tooltipBg, borderColor: mainColor, color: textColor }}
              labelStyle={{ color: textColor }}
              itemStyle={{ color: textColor }}
            />
            <Legend wrapperStyle={{ color: textColor }} />

            {lineKeys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index % colors.length]}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>

      );
    } else if (chartType === "bar") {
      return (
        <BarChart data={data}>
          <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
          <XAxis dataKey="name" stroke={axisColor} tick={{ fill: textColor }} />
          <YAxis stroke={axisColor} tick={{ fill: textColor }} />
          <Tooltip contentStyle={{ backgroundColor: tooltipBg, borderColor: mainColor }} />
          <Legend wrapperStyle={{ color: textColor }} />
          
          {barKeys.map((key, index) => (
            <Bar key={key} dataKey={key} fill={colors[index % colors.length]} />
          ))}
        </BarChart>
      );
    } else {
      return (
        <PieChart>
          <Tooltip contentStyle={{ backgroundColor: axisColor, borderColor: mainColor }} />
          <Legend wrapperStyle={{ color: textColor }} />

          <Pie
            data={data}
            dataKey="tasksCreated"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            labelLine={false}
            label={({ name, x, y }) => (
              <text x={x} y={y} fill={textColor} textAnchor="middle" dominantBaseline="central" fontSize={12}>
                {name}
              </text>
            )}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} stroke={accentColor} />
            ))}
          </Pie>
        </PieChart>

      );
    }
  };

  // Elicitation
  const [ideas, setIdeas] = useState<string[]>([]);
  const [ideaText, setIdeaText] = useState("");

  const addIdea = () => {
    if (ideaText.trim()) {
      setIdeas((prev) => [...prev, ideaText.trim()]);

      setActivityHistory((prev) => [
        {
          label: `Added idea: "${ideaText.trim()}"`,
          time: "Just now",
          icon: <StickyNote className="w-4 h-4 text-[#00BC91]" />,
        },
        ...prev,
      ]);

      setIdeaText("");
    }
  };

  const deleteIdea = (index: number) => {
    setIdeas((prev) => prev.filter((_, i) => i !== index));
  };

  // Editor
  const [content, setContent] = useState<string>("");

  const handleSave = () => {
    if (content.trim() === "") return;

    setActivityHistory(prev => [
      {
        label: 'Edited document - saved changes',
        time: 'Just now',
        icon: <PenLine className="w-4 h-4 text-[#00BC91]" />,
      },
      ...prev,
    ]);
  };

  const handleClear = () => {
    setContent("");
    setActivityHistory(prev => [
      {
        label: 'Cleared shared document',
        time: 'Just now',
        icon: <Trash2 className="w-4 h-4 text-[#f87171]" />,
      },
      ...prev,
    ]);
  };



  return (
    <>

      <div className="relative pt-10 minfo__app max-xl:pt-20 bg-[#1A1A1A] text-white">
        <div className={`xl:hidden menu-overlay fixed top-0 left-0 w-full h-full bg-black/60 transition-all duration-200 z-999 ${mobileMenuOpen ? 'is-menu-open opacity-100 visible' : 'opacity-0 invisible'}`}></div>

        <div className="flex flex-col xl:flex-row gap-6 mx-auto max-w-[82rem]">
          {/* Sidebar  */}
          <div className="w-full xl:w-1/4">
            <div className="relative pt-10 minfo__app max-xl:pt-20">
              <div className={`xl:hidden menu-overlay fixed top-0 left-0 w-full h-full bg-black/60 transition-all duration-200 z-999 ${mobileMenuOpen ? 'is-menu-open opacity-100 visible' : 'opacity-0 invisible'}`}></div>
              <div className="max-lg:px-4">
                <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-2 px-3 bg-white/10 mobile-menu-bar sm:px-6 backdrop-blur-md xl:hidden">
                  <div className="text-lg font-medium name">
                    <a href="#" className="flex items-center gap-2 text-white">
                      <img src="https://placehold.co/400" alt="logo" width={32} height={32} />
                    </a>
                  </div>
                  <button
                    className="w-12 h-12 border rounded-full hamburger menu_toggle bg-[#161616] border-greyBlack flex items-center justify-center"
                    type="button"
                    aria-label="Open Mobile Menu"
                    onClick={toggleMobileMenu}
                  >
                    <PenTool size={25} className="text-white" />
                  </button>
                </div>

                <div className={`mobile-menu fixed top-0 ${mobileMenuOpen ? 'right-0' : '-right-full'} w-full max-w-[20rem] bg-[#161616] z-999 h-full xl:hidden transition-all duration-300 py-12 px-8 overflow-y-scroll`}>
                  <button
                    className="absolute flex items-center justify-center w-9 h-9 text-sm text-white rounded-full close-menu top-4 right-4 bg-[#3a3a3a]"
                    aria-label="Close Menu"
                    onClick={toggleMobileMenu}
                  >
                    <Icon.X size={18} />
                  </button>

                  <div className="mb-6 text-lg font-medium text-white menu-title">
                    Menu
                  </div>

                  <ul className="space-y-5 font-normal main-menu">
                    {menuItems.map((item) => {
                      const IconComponent = Icon[item.icon] as LucideIcon;
                      return (
                        <li key={item.id} className={`relative group ${activeSection === item.id ? 'active' : ''}`}>
                          <a
                            href={`#${item.id}`}
                            className="flex items-center space-x-2 group"
                            onClick={(e) => {
                              e.preventDefault();
                              scrollToSection(item.id);
                              toggleMobileMenu();
                            }}
                          >
                            <span className={`w-5 text-white ${activeSection === item.id ? 'text-[#00BC91]' : ''}`}>
                              <IconComponent size={16} />
                            </span>
                            <span className={`${activeSection === item.id ? 'text-[#00BC91]' : 'text-white'} transition-colors`}>
                              {item.title}
                            </span>
                          </a>
                        </li>
                      );
                    })}
                  </ul>

                  <div className="mt-8 mb-4 font-medium text-white menu-title text-md">
                    Get in Touch
                  </div>

                  <div className="flex items-center space-x-4 social-icons *:flex">
                    <a href="#" className="text-white hover:text-[#00BC91] transition-colors" title="Share with Facebook">
                      <i className="fab fa-facebook-f"></i>
                    </a>
                    <a href="#" className="text-white hover:text-[#00BC91] transition-colors" title="Share with Linkedin">
                      <i className="fab fa-linkedin-in"></i>
                    </a>
                    <a href="#" className="text-white hover:text-[#00BC91] transition-colors" title="Share with Twitter">
                      <i className="fab fa-twitter"></i>
                    </a>
                    <a href="#" className="text-white hover:text-[#00BC91] transition-colors" title="Share with Instagram">
                      <i className="fab fa-instagram"></i>
                    </a>
                  </div>
                </div>
                
                <div className="mx-4 mt-10 sm:mt-12 text-center user-info lg:mx-6 items-center">
                  <a
                    href="#"
                    className="w-28 h-28 sm:w-36 sm:h-36 mb-2 block mx-auto border-4 sm:border-6 border-[#2f2f2f] overflow-hidden rounded-full *:w-full *:h-full *:rounded-full"
                  >
                    <img
                      src="https://placehold.co/400"
                      className="block"
                      alt="Tony Stark"
                      width={144}
                      height={144}
                    />
                  </a>

                  <h6 className="mb-1 text-base sm:text-lg font-semibold text-white name">Tony Stark</h6>

                  <div className="leading-none cd-headline clip is-full-width text-center items-center">
                  </div>

                  <div className="mt-6 bg-[#1f1f1f] px-4 py-3 sm:px-5 sm:py-4 rounded-xl shadow-md text-left text-sm sm:text-base text-white w-full sm:max-w-sm mx-auto">
                    <h4 className="text-sm sm:text-base font-semibold mb-3 border-b border-gray-700 pb-2">
                      Recent Activity
                    </h4>
                    <ul className="space-y-3">
                      {activityHistory.map((item, idx) => (
                        <li key={idx} className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-gray-300">
                            <span className="flex items-center justify-center">{item.icon}</span>
                            <span>{item.label}</span>
                          </div>
                          <span className="text-gray-500 text-xs sm:text-sm">{item.time}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Desktop Port NavBar */}
          <div className="minfo__nav__wrapper fixed top-4 left-1/2 -translate-x-1/2 z-[999] flex items-center flex-row gap-6 px-4 py-3 border border-metalBlack rounded-[2rem] bg-[#161616] text-[#acacac] font-normal shadow-lg max-xl:hidden">
            <div className="flex items-center justify-center w-10 h-10 border rounded-full border-metalBlack hover:bg-[#2f2f2f]">
              <a href="#" className="inline-flex items-center justify-center w-8 h-8 rounded bg-[#2f2f2f] hover:bg-[#3a3a3a] transition">
                <PenTool size={20} className="text-white" />
              </a>
            </div>

            <ul className="flex items-center gap-4 *:relative">
              {menuItems.map((item) => {
                const IconComponent = Icon[item.icon] as LucideIcon;
                return (
                  <li key={item.id} className={`group ${activeSection === item.id ? 'active' : ''}`}>
                    <a
                      href={`#${item.id}`}
                      className="w-9 h-9 rounded-full flex items-center justify-center group-[&.active]:bg-[#565656] group-hover:bg-[#2f2f2f] transition-all duration-300 relative"
                      data-title={item.title}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToSection(item.id);
                      }}
                    >
                      <span className={`text-white group-hover:text-[#00BC91] ${activeSection === item.id ? 'text-[#00BC91]' : ''}`}>
                        <IconComponent size={16} />
                      </span>
                      <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#2f2f2f] text-sm text-white px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
                        {item.title}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>

            <div className="relative share group">
              <button className="w-10 h-10 border rounded-full border-metalBlack flex items-center justify-center group-hover:bg-[#2f2f2f] text-white" aria-label="Share">
                <Icon.Share2 size={16} />
              </button>

              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 flex items-center px-5 py-4 space-x-3 transition-all duration-300 opacity-0 invisible group-hover:opacity-100 group-hover:visible bg-[#161616] rounded-[2rem] shadow-lg z-50 *:flex *:transition *:duration-200">
                <a href="#" className="text-white hover:text-[#ff9eef]" title="Facebook">
                  <i className="fab fa-facebook"></i>
                </a>
                <a href="#" className="text-white hover:text-[#ff9eef]" title="LinkedIn">
                  <i className="fab fa-linkedin-in"></i>
                </a>
                <a href="#" className="text-white hover:text-[#ff9eef]" title="Twitter">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" className="text-white hover:text-[#ff9eef]" title="Instagram">
                  <i className="fab fa-instagram"></i>
                </a>
              </div>
            </div>
          </div>


          {/* Main content */}
          <div className="w-full xl:w-2/4">
            <div className="minfo__contentBox relative mx-auto max-w-[82rem] xl:max-2xl:max-w-[65rem] *:py-5 xl:*:py-3.5 *:max-w-[70rem] max-xl:*:mx-auto xl:*:ml-auto xl:max-2xl:*:max-w-[50rem]">

              <div className="minfo__contentBox relative mx-auto max-w-[82rem] xl:max-2xl:max-w-[65rem] *:py-5 xl:*:py-3.5 *:max-w-[70rem] max-xl:*:mx-auto xl:*:ml-auto xl:max-2xl:*:max-w-[50rem]">

                <div ref={(ref) => registerSection("home", ref)} id="home" data-scroll-index="0">
                  <div className="hero-section px-5 py-8 md:p-8 bg-[#161616] rounded-2xl lg:p-10 2xl:p-13 shadow-xl">
                    <div className="inline-flex items-center gap-2 px-4 py-2 text-xs tracking-wide text-white border border-[#464646] rounded-[2rem]">
                      <Icon.Home className="text-[#00BC91]" size={18} />
                      INTRODUCE
                    </div>

                    <div className="items-center gap-6 hero-content md:flex xl:gap-10">
                      <div className="text-content pt-7 lg:pt-8 max-lg:max-w-[30rem]">
                        <h1 className="text-[32px] lg:text-5xl xl:text-4xl 2xl:text-5xl font-semibold text-white leading-tight mb-4 lg:mb-5">
                        Streamlining <span className="text-[#00BC91]">Real-Time Task</span><br />
                        Management for Research-Driven Teams
                      </h1>
                      <p className="text-gray-400">
                        A unified workspace to <span className="text-white font-medium">manage tasks</span>, annotate objectives, collaborate live, organize references, and visualize progress — accessible from any device.
                      </p>


                        <ul className="grid gap-2 mt-6 text-sm text-white/90">
                          <li className="flex items-center gap-2">
                            <Icon.PenLine size={16} className="text-[#00BC91]" />
                            Real-time collaborative task editing with inline annotations
                          </li>
                          <li className="flex items-center gap-2">
                            <Icon.MessageCircle size={16} className="text-[#00BC91]" />
                            Built-in team chat with contextual version history
                          </li>
                          <li className="flex items-center gap-2">
                            <Icon.BarChart3 size={16} className="text-[#00BC91]" />
                            Integrated visual dashboards: charts, tables & task insights
                          </li>
                          <li className="flex items-center gap-2">
                            <Icon.PencilRuler size={16} className="text-[#00BC91]" />
                            Fully responsive, touch-optimized interface for all devices
                          </li>
                          <li className="flex items-center gap-2">
                            <Icon.BookOpenCheck size={16} className="text-[#00BC91]" />
                            Built-in reference and resource management for tasks
                          </li>
                        </ul>


                        <ul className="mt-7">
                          <li>
                            <a
                              href="#get-started"
                              className="btn-theme inline-flex items-center gap-2 bg-[#00BC91] py-4 md:py-4.5 lg:px-9 px-7 rounded-[2rem] text-white font-medium text-[15px] md:text-base hover:shadow-theme_shadow transition-all duration-300"
                              onClick={(e) => {
                                e.preventDefault();
                                scrollToSection("Annotation");
                              }}
                            >
                              <Icon.Rocket size={16} />
                              Get Started
                            </a>
                          </li>
                        </ul>
                      </div>

                    </div>

                    <div className="mb-2 mt-14 xl:mb-0 xl:mt-20">
                      <div className="grid-cols-12 overflow-hidden md:grid items-center">
                        <div className="hidden col-span-2 md:inline-block">
                          <h6 className="font-medium text-white/80 text-sm md:max-w-[8rem] border-l border-[#00BC91] pl-4">
                            Trusted by Teams
                          </h6>
                        </div>
                        <div className="col-span-10 logo-slider">
                          <div className="flex space-x-8 items-center">
                            {["Vapple", "Gooogle", "Fijma", "Gooogle Docs"].map((brand, index) => (
                              <div key={index} className="flex items-center justify-center">
                                <img
                                  src={`https://placehold.co/96x40?text=${encodeURIComponent(brand)}`}
                                  alt={`${brand} Logo`}
                                  width={96}
                                  height={40}
                                  className="opacity-80 hover:opacity-100 transition"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div ref={(ref) => registerSection("Annotation", ref)} id="Annotation" data-scroll-index="5">
                  <div className="inline-flex items-center gap-2 px-4 py-2 text-xs tracking-wide text-white border border-[#464646] rounded-[2rem]">
                    <Icon.SquarePen className="text-[#00BC91]" size={18} />
                    CANVA
                  </div>
                  <div className="bg-[#1A1A1A] rounded-2xl p-4 shadow-xl h-[70vh] flex flex-col">
                    
                    <div className="flex items-center justify-between bg-[#2A2A2A] rounded-xl px-4 py-2 mb-4">
                      <div className="flex gap-3">
                        <button
                          className={`tool-button ${tool === "pen" ? "bg-[#00BC91]/20" : ""}`}
                          onClick={() => setTool("pen")}
                        >
                          <PenTool size={18} />
                          <span className="text-xs">Pen</span>
                        </button>
                        <button
                          className={`tool-button ${tool === "marker" ? "bg-[#00BC91]/20" : ""}`}
                          onClick={() => setTool("marker")}
                        >
                          <Highlighter size={18} />
                          <span className="text-xs">Marker</span>
                        </button>
                        <button
                          className={`tool-button ${tool === "eraser" ? "bg-[#00BC91]/20" : ""}`}
                          onClick={() => setTool("eraser")}
                        >
                          <Eraser size={18} />
                          <span className="text-xs">Eraser</span>
                        </button>
                        <button className="tool-button" onClick={() => canvasRef.current?.undo()}>
                          <Undo2 size={18} />
                          <span className="text-xs">Undo</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-300">Color:</label>
                        <input
                          type="color"
                          className="w-6 h-6 rounded-full border-none"
                          value={color}
                          onChange={(e) => setColor(e.target.value)}
                          disabled={tool === "eraser"} 
                        />
                      </div>
                    </div>

                    <div className="flex-1 bg-[#a5a5a5] rounded-xl border border-[#a5a5a5] relative overflow-hidden">
                      <ReactSketchCanvas
                        ref={canvasRef}
                        canvasColor="#a5a5a5"
                        className="w-full h-full rounded-xl"
                        strokeColor={tool === "eraser" ? "#a5a5a5" : color} 
                        strokeWidth={tool === "marker" ? 6 : 3}
                        eraserWidth={8}
                        allowOnlyPointerType="all"
                      />
                    </div>
                  </div>
                </div>

                <div ref={(ref) => registerSection("Charts", ref)} id="Charts" data-scroll-index="5">
                  <div className="inline-flex items-center gap-2 px-4 py-2 text-xs tracking-wide text-white border border-[#464646] rounded-[2rem]">
                    <Icon.ChartNoAxesCombined className="text-[#00BC91]" size={18} />
                    CHARTS
                  </div>
                  <div className="bg-[#1A1A1A] text-white rounded-2xl p-6 shadow-2xl min-h-[80vh] flex flex-col gap-6">

                  <div className="flex gap-4">
                    {[
                      { label: "Line", type: "line", icon: <LineChartIcon /> },
                      { label: "Bar", type: "bar", icon: <BarChartIcon /> },
                      { label: "Pie", type: "pie", icon: <PieChartIcon /> },
                    ].map(({ label, type, icon }) => (
                      <button
                        key={type}
                        onClick={() => setChartType(type as any)}
                        className={clsx(
                          "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition",
                          chartType === type ? "bg-[#07e9b4] text-white" : "bg-gray-700 hover:bg-gray-600"
                        )}
                      >
                        {icon}
                        {label}
                      </button>
                    ))}
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-gray-700">
                    <div className="flex gap-3 mb-4">
                      <button
                        onClick={handleAddRow}
                        className="bg-[#00BC91] hover:bg-[#00a77f] text-white text-sm px-3 py-1.5 rounded-md shadow-sm"
                      >
                        Add Row
                      </button>
                      <button
                        onClick={handleRemoveRow}
                        className="bg-[#00BC91] hover:text-[#aa4a4a] text-white text-sm px-3 py-1.5 rounded-md shadow-sm"
                      >
                        Remove Row
                      </button>

                    </div>
                    <table className="min-w-full table-auto text-left">
                      <thead className="bg-[#2A2A2A] text-sm uppercase tracking-wider">
                        {table.getHeaderGroups().map(headerGroup => (
                          <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                              <th key={header.id} className="px-4 py-3">
                                {flexRender(header.column.columnDef.header, header.getContext())}
                              </th>
                            ))}
                          </tr>
                        ))}
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {table.getRowModel().rows.map(row => (
                          <tr key={row.id} className="hover:bg-gray-800">
                            {row.getVisibleCells().map(cell => (
                              <td key={cell.id} className="px-4 py-2">
                                <input
                                  value={cell.getValue() as string | number}
                                  onChange={e =>
                                    table.options.meta?.updateData(
                                      row.index,
                                      cell.column.id,
                                      e.target.value
                                    )
                                  }
                                  className="bg-transparent border-b border-gray-600 focus:outline-none focus:border-blue-500 w-full text-white"
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex-grow min-h-[300px]">
                    <ResponsiveContainer width="100%" height={400}>
                      {renderChart()}
                        
                    </ResponsiveContainer>
                    {/* <div className="flex flex-col items-center justify-center h-full text-center text-white bg-[#1A1A1A] border border-[#00BC91] rounded-xl p-6 shadow-md">
                      <AlertTriangle className="w-8 h-8 text-[#00BC91] mb-3" />
                      <div className="text-lg font-semibold text-[#00BC91] mb-1">
                        Chart Render Error
                      </div>
                      <p className="text-sm text-gray-300">
                        This environment cannot render <span className="text-[#00BC91] font-medium">Recharts</span> components.
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Please run the project locally to view the charts.
                      </p>
                    </div> */}
                  </div>
                </div>
                </div>

                <div ref={(ref) => registerSection("Elicitation", ref)} id="Elicitation" data-scroll-index="5">
                  <div className="inline-flex items-center gap-2 px-4 py-2 text-xs tracking-wide text-white border border-[#464646] rounded-[2rem] mb-6">
                    <Icon.NotebookPen className="text-[#00BC91]" size={14} />
                    ELICITATION
                  </div>

                  <h2 className="text-3xl md:text-4xl font-semibold mb-4 leading-tight">
                    <span className="text-[#00BC91]">Collaborative Planning</span> for Smarter Task Execution
                  </h2>

                  <p className="text-gray-400 max-w-3xl mb-8">
                    Capture goals, requirements, and actionable items from your team in real-time. Whether you're outlining sprint priorities, gathering feature requests, or voting on task urgency, this workspace supports flexible planning with <span className="text-white">live collaboration</span> and <span className="text-white">detailed version tracking</span>.
                  </p>


                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-[#1e1e1e] border border-[#333333] rounded-xl p-5 hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center gap-3 mb-3">
                        <Icon.Brain className="text-[#00BC91]" size={20} />
                        <h4 className="font-medium text-lg">Task Planning Canvas</h4>
                      </div>
                      <p className="text-gray-400 text-sm">
                        Collaborate in a shared visual space using digital sticky notes and sketches to break down tasks, map priorities, and set objectives.
                      </p>
                    </div>

                    <div className="bg-[#1e1e1e] border border-[#333333] rounded-xl p-5 hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center gap-3 mb-3">
                        <Icon.MessageCircle className="text-[#00BC91]" size={20} />
                        <h4 className="font-medium text-lg">Team Feedback & Prioritization</h4>
                      </div>
                      <p className="text-gray-400 text-sm">
                        Run team polls or structured feedback rounds to gather input, vote on task urgency, and align priorities across the board.
                      </p>
                    </div>

                    <div className="bg-[#1e1e1e] border border-[#333333] rounded-xl p-5 hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center gap-3 mb-3">
                        <Icon.History className="text-[#00BC91]" size={20} />
                        <h4 className="font-medium text-lg">Task History & Traceability</h4>
                      </div>
                      <p className="text-gray-400 text-sm">
                        Every task update is versioned automatically, allowing you to trace decisions, track edits, and understand task evolution in real time.
                      </p>
                    </div>

                  </div>

                  <div className="mt-12">
                    <h3 className="text-2xl font-semibold mb-4 text-white flex items-center gap-2">
                      <Icon.StickyNote className="text-[#00BC91]" size={20} />
                      Live Idea Board
                    </h3>

                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                      <input
                        type="text"
                        placeholder="Type your idea..."
                        value={ideaText}
                        onChange={(e) => setIdeaText(e.target.value)}
                        className="w-full px-4 py-2 bg-[#1e1e1e] border border-[#333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00BC91]"
                      />
                      <button
                        onClick={addIdea}
                        className="bg-[#00BC91] text-white font-medium px-6 py-2 rounded-lg hover:bg-[#00a77f] transition"
                      >
                        Add
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {ideas.map((idea, index) => (
                        <div
                          key={index}
                          className="relative p-4 bg-[#2b2b2b] border border-[#444] rounded-lg text-sm text-white shadow-md"
                        >
                          <p>{idea}</p>
                          <button
                            onClick={() => deleteIdea(index)}
                            className="absolute top-2 right-2 text-[#ff5e5e] hover:text-red-400"
                            aria-label="Delete idea"
                          >
                            <Icon.X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                <div ref={(ref) => registerSection("Editor", ref)} id="Editor"                data-scroll-index="5"
                >
                  <div className="inline-flex items-center gap-2 px-4 py-2 text-xs tracking-wide text-white border border-[#464646] rounded-[2rem]">
                    <FileEdit className="text-[#00BC91]" size={18} />
                    SHARED DOCUMENT EDITOR
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-300">Start collaborating live</div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleSave}
                        className="flex items-center gap-2 bg-[#00BC91] hover:bg-[#00a77f] px-3 py-1.5 text-sm rounded-md shadow-md"
                      >
                        <Save size={16} />
                        Save
                      </button>
                      <button
                        onClick={handleClear}
                        className="flex items-center gap-2 bg-[#2A2A2A] hover:text-[#f87171] px-3 py-1.5 text-sm rounded-md"
                      >
                        <Trash2 size={16} />
                        Clear
                      </button>
                    </div>
                  </div>

                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Type your shared notes or research draft here..."
                    className="w-full h-[60vh] p-4 text-sm rounded-lg bg-[#121212] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00BC91] resize-none text-white shadow-inner"
                  />

                  <div className="flex justify-end text-xs text-gray-400 italic">
                    <PenLine size={14} className="mr-1 text-[#00BC91]" />
                    Editing enabled - changes won’t persist across reloads (demo only)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User Chat Box */}
          <div className="w-full xl:w-1/4">
            <div className="max-w-4xl mx-auto p-4 pt-8 bg-[#121212] text-white rounded-2xl shadow-lg h-[80vh] flex flex-col md:flex-row">
              {(isMobileOrTablet || !selectedUser) && (
                <div className="md:w-3/4 md:pr-4 border-r border-[#2A2A2A] w-full mb-4 md:mb-0">
                  <h3 className="text-lg font-semibold mb-4">Chats</h3>
                  <ul className="space-y-3">
                    {users.map((user) => (
                      <li
                        key={user.id}
                        onClick={() => setSelectedUser(user)}
                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedUser?.id === user.id ? "bg-[#1E1E1E]" : "hover:bg-[#1A1A1A]"
                        }`}
                      >
                        <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full" />
                        <div>
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-gray-400">{user.status}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedUser && (
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center justify-between p-4 border-b border-[#2A2A2A]">
                    <div className="flex items-center gap-3">
                      {!isMobileOrTablet && (
                        <button
                          onClick={() => setSelectedUser(null)}
                          className="mr-2 text-gray-400 hover:text-white transition"
                        >
                          <ArrowLeft size={20} />
                        </button>
                      )}
                      <img src={selectedUser.avatar} alt="User Avatar" className="w-10 h-10 rounded-full" />
                      <div>
                        <h2 className="text-base font-semibold">{selectedUser.name}</h2>
                        <p className="text-sm text-gray-400">{selectedUser.status}</p>
                      </div>
                    </div>
                    <MoreVertical className="text-gray-400" />
                  </div>

                  <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
                    {messages.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex ${
                          msg.sender === "me" ? "justify-end" : "items-start gap-3"
                        }`}
                      >
                        {msg.sender !== "me" && (
                          <img
                            src={selectedUser.avatar}
                            alt="Sender"
                            className="w-8 h-8 rounded-full"
                          />
                        )}
                        <div
                          className={`rounded-2xl px-4 py-3 max-w-xs text-sm ${
                            msg.sender === "me"
                              ? "bg-[#00BC91] text-white"
                              : "bg-[#1E1E1E]"
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-[#2A2A2A] p-4">
                    <div className="flex items-center gap-3 bg-[#1A1A1A] rounded-full px-4 py-2">
                      <input
                        type="text"
                        placeholder="Type your message..."
                        className="flex-1 bg-transparent text-white placeholder-gray-500 text-sm focus:outline-none"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                      />
                      <button
                        className="p-2 rounded-full bg-[#00BC91] hover:bg-[#00a37d] transition"
                        onClick={sendMessage}
                      >
                        <SendHorizonal size={18} className="text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default App;
