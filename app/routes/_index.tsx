import { useState, useEffect, useRef } from "react";
import type { MetaFunction, LoaderFunction } from "@remix-run/node";
import { Search, Package, Loader2, X } from "lucide-react";
import { useNavigate, useSearchParams, useLoaderData } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";

interface Suggestion {
  appId: string;
  developer: string;
  icon: string;
  summary: string;
  title: string;
  url: string;
}

export const meta: MetaFunction = () => {
  return [
    { title: "AppInsight - Play Store Analytics" },
    { name: "description", content: "Extract and analyze Google Play Store reviews" },
  ];
};
// Add a server-side loader function
export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const term = url.searchParams.get("term");

  if (term) {
    // Only import and use gplay on the server
    const module = await import("google-play-scraper");
    const gplay = module.default;
    try {
      const suggestions = await gplay.search({
        term,
        num: 5
      });
      return ({ suggestions });
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      return ({ suggestions: [], error: "Failed to fetch suggestions" });
    }
  }

  return ({ suggestions: [] });
};

// Add Terminal component
const Terminal = ({ messages, complete, onClose }: { messages: string[], complete: boolean, onClose: () => void }) => {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [selectedLink, setSelectedLink] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, history]);

  const links = [
    { command: 'profile', url: 'https://www.milhamakbarjr.com/', label: 'Access Jedi Holocron (Personal Archives)' },
    { command: 'code', url: 'https://github.com/milhamakbarjr/uxtools-appinsights-playstore', label: 'Access Source Code Archives' },
    { command: 'exit', url: '', label: 'Close Secure Connection' }
  ];

  const handleCommand = (cmd: string) => {
    const command = cmd.toLowerCase().trim();
    let response = "";

    switch (command) {
      case "profile":
        response = "> ACCESSING JEDI HOLOCRON DATABASE...";
        setHistory(prev => [...prev, `$ ${cmd}`, response]);
        setTimeout(() => {
          setHistory(prev => [...prev, "> MAY THE FORCE BE WITH YOU"]);
          setTimeout(() => window.open("https://www.milhamakbarjr.com/", "_blank"), 1000);
        }, 1500);
        break;
      case "code":
        response = "> ACCESSING JEDI ARCHIVES...";
        setHistory(prev => [...prev, `$ ${cmd}`, response]);
        setTimeout(() => {
          setHistory(prev => [...prev, "> MAY THE FORCE BE WITH YOU"]);
          setTimeout(() => window.open("https://github.com/milhamakbarjr/uxtools-appinsights-playstore", "_blank"), 1000);
        }, 1500);
        break;
      case "exit":
        response = "> CLOSING SECURE CONNECTION...";
        setHistory(prev => [...prev, `$ ${cmd}`, response]);
        setTimeout(() => {
          setHistory(prev => [...prev, "> MAY THE FORCE BE WITH YOU"]);
          setTimeout(() => onClose(), 1000);
        }, 1500);
        break;
      default:
        response = `> COMMAND NOT RECOGNIZED. THIS IS NOT THE COMMAND YOU'RE LOOKING FOR.`;
        setHistory(prev => [...prev, `$ ${cmd}`, response]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (input.trim()) {
        handleCommand(input);
        setInput("");
      } else if (selectedLink !== -1) {
        const command = links[selectedLink].command;
        handleCommand(command);
      }
    } else if (e.key === "Tab" || e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (e.key === "ArrowUp") {
        setSelectedLink(prev => (prev <= 0 ? links.length - 1 : prev - 1));
      } else {
        setSelectedLink(prev => (prev >= links.length - 1 ? 0 : prev + 1));
      }
      setInput("");
    } else if (e.key === "Escape") {
      setSelectedLink(-1);
    }
  };

  useEffect(() => {
    inputRef.current?.focus();

    const handleClickOutside = (e: MouseEvent) => {
      if (terminalRef.current && !terminalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const renderMessage = (message: string, index: number) => {
    if (message.startsWith("    ")) {
      return <p key={index} className="ascii-art">{message}</p>;
    }

    if (message.includes('terminal-command')) {
      return (
        <p key={index} className="text-green-400 whitespace-pre">
          {message.split('<span').map((part, i) => {
            if (!part.includes('terminal-command')) return part;
            const commandMatch = part.match(/>(.*?)<\/span>/);
            const command = commandMatch ? commandMatch[1] : '';
            const linkIndex = links.findIndex(l => l.command === command);
            if (linkIndex === -1) return part;
            return (
              <span key={i}>
                <span 
                  className={`terminal-command ${selectedLink === linkIndex ? 'bg-green-500 text-black' : ''}`}
                  onClick={() => command === 'exit' ? onClose() : window.open(links[linkIndex].url, '_blank')}
                >
                  {command}
                </span>
                {` - ${links[linkIndex].label}`}
              </span>
            );
          })}
        </p>
      );
    }

    return (
      <p key={index} className={`text-green-400 whitespace-pre ${
        index === messages.length - 1 ? 'animate-typing' : ''
      }`}>
        {message}
      </p>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => inputRef.current?.focus()}>
      <div ref={terminalRef} className="terminal-container bg-black/95 p-6 rounded-lg border border-green-500 w-[800px] max-w-[95vw]">
        <div className="flex items-center gap-2 mb-4">
          <button 
            onClick={onClose}
            className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
          />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <div className="space-y-2 overflow-y-auto max-h-[70vh]">
          <div className="font-mono">
            {messages.map((message, i) => renderMessage(message, i))}
            {history.map((line, i) => (
              <p key={`history-${i}`} className="text-green-400 whitespace-pre">{line}</p>
            ))}
            <div className="flex items-center text-green-400">
              <span>$&nbsp;</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent border-none outline-none text-green-400 font-mono"
                autoFocus
              />
            </div>
          </div>
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
};

export default function Index() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [_, setSearchParams] = useSearchParams();
  const data = useLoaderData<{ suggestions: Array<Suggestion> }>();
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const [konamiIndex, setKonamiIndex] = useState(0);
  const [showParty, setShowParty] = useState(false);
  const [showClue, setShowClue] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalMessages, setTerminalMessages] = useState<string[]>([]);
  const [terminalComplete, setTerminalComplete] = useState(false);
  const konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // Up Up Down Down Left Right Left Right B A

  const TERMINAL_SEQUENCE = [
    { text: "> ESTABLISHING SECURE CONNECTION TO JEDI NETWORK...", delay: 800 },
    { text: "> AUTHENTICATING CREDENTIALS...", delay: 600 },
    { text: "> DECRYPTING HOLOCRON ACCESS CODES...", delay: 700 },
    { text: "> ACCESS GRANTED TO JEDI ARCHIVES", delay: 800 },
    { text: `> HELLO THERE!

⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢿⠫⡁⢀⣀⣠⣒⣬⠿⡳⠛⠏⣿⢿⣛⢷⣄⡀⠀⠀⢀⡽⣻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣻⣽⣿⣾⡿⣽⣾⣿⣽⣿⠟⣥⢞⡩⣴⡿⢗⣫⣭⣴⣷⣿⣶⣿⣿⣿⣿⣿⣏⠼⢆⣀⢦⣝⡿⣽⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⡿⣷⣿⣿⣯⣿⣿⠋⣨⡴⣫⣾⣿⣿⢿⣫⣷⣿⣿⣿⣿⣿⡿⡿⢟⡟⣻⣶⣾⣾⣓⣾⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣻
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠏⣨⢋⣾⣿⡷⣻⣵⣿⣿⣿⣿⣿⣿⣿⣯⢷⣻⢯⣜⠦⠹⣿⣿⣿⡜⣿⣿⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡄⢣⣿⡟⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣽⢻⣯⣯⡜⠀⠁⠘⣿⣿⣯⣽⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠇⣰⡼⢫⣾⣿⡟⣽⣿⣿⣿⣿⣿⣿⣽⣞⣿⣻⣾⣱⢂⠀⠀⠀⢿⣿⣿⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢀⡋⠰⣱⣿⢏⣾⣿⣿⣿⣿⣿⣯⣿⢿⡾⣿⣵⢯⡗⠂⠀⠀⠀⠸⢿⣿⣾⣿⣿⣿⣿⡇⠀⠘⠀⠀⡏⠉⣉⣹⠉⢹⣿⠉⢹⣿⠋⢩⠉⢻⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢠⠇⡱⣿⠏⣾⡿⢻⣿⣿⣿⣿⣿⣾⢫⢝⡺⡝⣺⢼⣷⣶⠞⣆⠠⣛⣿⣿⣿⣿⣿⣿⣇⣀⣰⣀⣠⣇⣀⣒⣿⣀⣈⣹⣀⣈⣹⣀⡸⣀⣼⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣈⣷⡠⢹⣶⠓⢀⣼⣻⣿⣾⣿⣯⣟⣯⣶⣷⠈⣴⣯⢿⣶⢧⡄⠀⡛⡟⠁⠈⠐⠉⡙⢯⡟⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣭⣷⠀⣌⡟⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣆⠻⣿⣾⠟⠋⠁⠀⠝⡄⠀⠀⠀⡀⣠⠒⠛⠓⢛⠛⠛⡛⠛⡟⠛⣛⣻⠛⢛⠛⣿⠛⢛⣛⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡎⣞⣧⠨⠀⠀⢙⣿⣿⣿⣾⣿⣿⣿⣿⣿⣿⡇⡀⠈⣯⢣⡰⠀⠀⢸⣿⣿⣿⣿⣷⣿⣿⠀⢸⣿⠀⠠⡄⠀⡇⠀⠭⣿⠀⢨⠀⣻⠀⠨⢽⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣝⣿⣝⠨⠀⠰⣻⣿⣻⣿⢿⣿⣿⣿⣿⡿⠇⠁⢠⡛⠆⠁⠀⠀⢺⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡬⣾⣗⡀⠀⢱⣿⣳⣯⣟⣯⢷⣿⣿⣿⣯⣵⣿⡂⢟⡀⠀⠀⠀⢸⣿⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣷⣿⣌⣧⢋⡜⠹⢿⣿⣧⡌⢹⡈⠀⠀⣿⣟⡾⣽⣾⣿⣿⣿⣿⣟⢫⠖⡂⠀⠀⢰⣿⣯⣻⣽⣟⡮⢳⠹⣞⡷⣯⢷⡻⣾⡽⣞⡷⣯⣟⣞⣳⢻⣜⡳⣝⡲⣝⢮⡳⣛`, delay: 1500 },
    { text: "> JEDI MASTER: MOHAMMAD ILHAM AKBAR JUNIOR", delay: 800 },
    { text: "> SPECIALIZATION: PRODUCT DESIGN & UX RESEARCH", delay: 600 },
    { text: "> READY TO ASSIST WITH THE FORCE OF DESIGN", delay: 700 },
    { text: "> AVAILABLE COMMANDS:", delay: 500 },
    { text: "> - <span class='terminal-command'>profile</span> - Access Jedi Holocron (Personal Archives)", delay: 300 },
    { text: "> - <span class='terminal-command'>code</span> - Access Source Code Archives", delay: 300 },
    { text: "> - <span class='terminal-command'>exit</span> - Close Secure Connection", delay: 300 },
    { text: "> USE THE FORCE (↑/↓) TO NAVIGATE, ENTER TO EXECUTE", delay: 500 },
    
  ];

  // Add terminal sequence handler
  const startTerminalSequence = () => {
    let totalDelay = 0;
    
    TERMINAL_SEQUENCE.forEach((message, index) => {
      totalDelay += message.delay;
      setTimeout(() => {
        setTerminalMessages(prev => [...prev, message.text]);
        
        if (index === TERMINAL_SEQUENCE.length - 1) {
          setTerminalComplete(true);
        }
      }, totalDelay);
    });
  };

  const handleCloseTerminal = () => {
    setShowTerminal(false);
    setTerminalMessages([]);
    setTerminalComplete(false);
  };

  // Suggested popular apps for quick access
  const suggestedApps = [
    { 
      name: "Spotify", 
      id: "com.spotify.music",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#1DB954" className="bi bi-spotify" viewBox="0 0 16 16">
          <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0m3.669 11.538a.5.5 0 0 1-.686.165c-1.879-1.147-4.243-1.407-7.028-.77a.499.499 0 0 1-.222-.973c3.048-.696 5.662-.397 7.77.892a.5.5 0 0 1 .166.686m.979-2.178a.624.624 0 0 1-.858.205c-2.15-1.321-5.428-1.704-7.972-.932a.625.625 0 0 1-.362-1.194c2.905-.881 6.517-.454 8.986 1.063a.624.624 0 0 1 .206.858m.084-2.268C10.154 5.56 5.9 5.419 3.438 6.166a.748.748 0 1 1-.434-1.432c2.825-.857 7.523-.692 10.492 1.07a.747.747 0 1 1-.764 1.288"/>
        </svg>
      )
    },
    { 
      name: "Facebook", 
      id: "com.facebook.katana",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#1877F2" className="bi bi-facebook" viewBox="0 0 16 16">
          <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951"/>
        </svg>
      )
    },
    { 
      name: "Instagram", 
      id: "com.instagram.android",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#E4405F" className="bi bi-instagram" viewBox="0 0 16 16">
          <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334"/>
        </svg>
      )
    },
  ];

  // Add function to check if search is valid
  const isSearchValid = () => {
    // Valid if it's a correct package ID format
    if (isValidPackageId(search)) return true;
    
    // Valid if there are suggestions and one was selected (debouncedSearch will match a suggestion's appId)
    if (data.suggestions && data.suggestions.length > 0) {
      return data.suggestions.some(suggestion => suggestion.appId === debouncedSearch);
    }
    
    return false;
  };

  // Update useEffect for debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search.length >= 3) {
        setDebouncedSearch(search);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Update search params only if valid
  useEffect(() => {
    if (debouncedSearch.length >= 3 || isValidPackageId(debouncedSearch)) {
      setSearchParams({ term: debouncedSearch });
    } else {
      setSearchParams({});
    }
  }, [debouncedSearch, setSearchParams]);

  // Add click outside handler to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Add Konami code effect
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.keyCode === konamiCode[konamiIndex]) {
        const nextIndex = konamiIndex + 1;
        setKonamiIndex(nextIndex);
        
        if (nextIndex === konamiCode.length) {
          setKonamiIndex(0);
          setShowTerminal(true);
          startTerminalSequence();
        }
      } else {
        setKonamiIndex(0);
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [konamiIndex]);

  const isValidPackageId = (id: string) => {
    // Package ID must contain at least one dot and only letters, numbers, and dots
    const packagePattern = /^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)+$/;
    return packagePattern.test(id);
  };

  const handleSearch = () => {
    if (!debouncedSearch) {
      setSearchError("Please enter an app name or package ID");
      setIsSearching(false);
      return false;
    }

    if (!isSearchValid()) {
      setSearchError("Please enter a valid package ID (e.g., com.company.app) or select from suggestions");
      setIsSearching(false);
      return false;
    }

    setSearchError("");
    setIsSearching(true);
    setTimeout(() => {
      navigate(`/analysis/${debouncedSearch}`);
    }, 1000);
    return true;
  };

  const handleSuggestionClick = (appId: string) => {
    setSearch(appId);
    setDebouncedSearch(appId);
    setShowSuggestions(false);
    setIsSearching(true);
    setTimeout(() => {
      navigate(`/analysis/${appId}`);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 relative">
      <div className="w-full max-w-2xl mx-auto">
        {/* Logo Header */}
        <div className="flex items-center justify-center mb-8">
          <div className="h-12 w-12">
            <img
              src="/icons/logo-light.png"
              alt="AppInsight Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="ml-3 text-2xl font-bold tracking-tight">AppInsight</h1>
        </div>

        <Card className="border-0 shadow-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl">Find an app to analyze</CardTitle>
            <CardDescription>
              Discover insights from user reviews and ratings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex gap-2 relative">
                <div className="flex-1">
                  <Input
                    placeholder="Enter app name or ID"
                    className={`h-12 bg-white dark:bg-slate-950 ${searchError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setSearchError("");
                      setIsSearching(false);
                      setShowSuggestions(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const isValid = handleSearch();
                        if (isValid) {
                          setShowSuggestions(false);
                        }
                      } else if (e.key === "Escape") {
                        setShowSuggestions(false);
                      }
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={(e) => {
                      if (!suggestionsRef.current?.contains(e.relatedTarget as Node)) {
                        setTimeout(() => setShowSuggestions(false), 150);
                      }
                    }}
                  />
                  {searchError && (
                    <p className="text-sm text-red-500 mt-1">{searchError}</p>
                  )}
                </div>
                <Button
                  size="lg"
                  className="gap-2 min-w-32 h-12"
                  onClick={() => {
                    const isValid = handleSearch();
                    if (isValid) {
                      setShowSuggestions(false);
                    }
                  }}
                  disabled={isSearching || !isSearchValid()}
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      Search
                    </>
                  )}
                </Button>

                {/* Suggestions Dropdown */}
                {showSuggestions && data.suggestions && data.suggestions.length > 0 && (
                  <div 
                    ref={suggestionsRef}
                    className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 shadow-lg rounded-md z-10 border border-slate-200 dark:border-slate-700 max-h-80 overflow-y-auto"
                  >
                    <ul className="py-1">
                      {data.suggestions.map((app) => (
                        <li
                          key={app.appId}
                          className="px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center gap-3"
                          onClick={() => handleSuggestionClick(app.appId)}
                        >
                          <div className="w-10 h-10 flex-shrink-0">
                            <img
                              src={app.icon}
                              alt={`${app.title} icon`}
                              className="w-full h-full object-contain rounded"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{app.title}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{app.developer}</p>
                          </div>
                          <Package className="h-4 w-4 text-slate-400" />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Popular app suggestions */}
              <div className="mt-2">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Popular apps:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedApps.map((app) => (
                    <button
                      key={app.id}
                      onClick={() => handleSuggestionClick(app.id)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 
                                rounded-full text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      {app.icon}
                      {app.name}
                    </button>
                  ))}
                </div>
              </div>
              
            </div>
          </CardContent>
        </Card>

      </div>

      {showTerminal && (
        <Terminal 
          messages={terminalMessages} 
          complete={terminalComplete}
          onClose={handleCloseTerminal}
        />
      )}

      {/* GitHub Link */}
      <div className="fixed bottom-12 right-4 group">
        <div className="absolute bottom-full right-0 mb-4 w-56 p-3 bg-slate-800/95 text-sm text-slate-300 rounded-lg opacity-0 
                      group-hover:opacity-100 transition-opacity duration-300 pointer-events-none backdrop-blur-sm border border-slate-700/50">
          <p className="font-medium mb-1">Shhh! Try this:</p>
          <p className="font-mono text-green-400">↑↑↓↓←→←→BA</p>
        </div>
        <a
          href="https://github.com/milhamakbarjr/uxtools-appinsights-playstore"
          target="_blank"
          rel="noopener noreferrer"
          className="relative text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          {showParty && (
            <div className="absolute -top-4 -left-4 -right-4 -bottom-4 flex items-center justify-center">
              <span className="animate-bounce mx-0.5">🎉</span>
              <span className="animate-bounce mx-0.5 delay-75">✨</span>
              <span className="animate-bounce mx-0.5 delay-150">🎮</span>
            </div>
          )}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transform transition-all duration-300 ${showParty ? 'animate-spin' : ''}`}
          >
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
          </svg>
        </a>
      </div>

      {/* Sticky Disclaimer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border-t border-slate-200 dark:border-slate-800 py-2 z-10">
        <div className="container mx-auto max-w-4xl px-4">
          <p className="text-[0.65rem] text-slate-500 dark:text-slate-400 text-center">
            <strong>Disclaimer:</strong> AppInsight is designed for educational and research purposes only.
            No data is stored on our servers—all processing happens in your browser session.
            Users are responsible for ensuring compliance with Google Play Store's Terms of Service.
            This tool should not be used for commercial scraping operations.
          </p>
        </div>
      </div>
    </div>
  );
}
