import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { StepsList } from '../components/StepsList';
import { FileExplorer } from '../components/FileExplorer';
import { TabView } from '../components/TabView';
import { CodeEditor } from '../components/CodeEditor';
import { PreviewFrame } from '../components/PreviewFrame';
import { Step, FileItem, StepType } from '../types';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import { parseXml } from '../steps';
import { useWebContainer } from '../hooks/useWebContainer';
import { FileNode } from '@webcontainer/api';
import { Loader } from '../components/Loader';
import JSZip from 'jszip';
import { ChevronRight, Code, Eye, Layers, Download } from 'lucide-react';

export function Builder() {
  const location = useLocation();
  const navigate = useNavigate();
  const prompt = location.state?.prompt || "";
  const [userPrompt, setPrompt] = useState("");
  const [llmMessages, setLlmMessages] = useState<{ role: "user" | "assistant", content: string; }[]>([]);
  const [loading, setLoading] = useState(false);
  const [templateSet, setTemplateSet] = useState(false);
  const webcontainer = useWebContainer();

  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);

  const [steps, setSteps] = useState<Step[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);

  useEffect(() => {
    let originalFiles = [...files];
    let updateHappened = false;
    steps.filter(({ status }) => status === "pending").map(step => {
      updateHappened = true;
      if (step?.type === StepType.CreateFile) {
        let parsedPath = step.path?.split("/") ?? [];
        let currentFileStructure = [...originalFiles];
        let finalAnswerRef = currentFileStructure;

        let currentFolder = ""
        while (parsedPath.length) {
          currentFolder = `${currentFolder}/${parsedPath[0]}`;
          let currentFolderName = parsedPath[0];
          parsedPath = parsedPath.slice(1);

          if (!parsedPath.length) {
            let file = currentFileStructure.find(x => x.path === currentFolder)
            if (!file) {
              currentFileStructure.push({
                name: currentFolderName,
                type: 'file',
                path: currentFolder,
                content: step.code
              })
            } else {
              file.content = step.code;
            }
          } else {
            let folder = currentFileStructure.find(x => x.path === currentFolder)
            if (!folder) {
              currentFileStructure.push({
                name: currentFolderName,
                type: 'folder',
                path: currentFolder,
                children: []
              })
            }

            currentFileStructure = currentFileStructure.find(x => x.path === currentFolder)!.children!;
          }
        }
        originalFiles = finalAnswerRef;
      }
    })

    if (updateHappened) {
      setFiles(originalFiles)
      setSteps(steps => steps.map((s: Step) => {
        return {
          ...s,
          status: "completed"
        }
      }))
    }
  }, [steps, files]);

  useEffect(() => {
    const createMountStructure = (files: FileItem[]): Record<string, any> => {
      const mountStructure: Record<string, any> = {};

      const processFile = (file: FileItem, isRootFolder: boolean) => {
        if (file.type === 'folder') {
          mountStructure[file.name] = {
            directory: file.children ?
              Object.fromEntries(
                file.children.map(child => [child.name, processFile(child, false)])
              )
              : {}
          };
        } else if (file.type === 'file') {
          if (isRootFolder) {
            mountStructure[file.name] = {
              file: {
                contents: file.content || ''
              }
            };
          } else {
            return {
              file: {
                contents: file.content || ''
              }
            };
          }
        }
        return mountStructure[file.name];
      };

      files.forEach(file => processFile(file, true));
      return mountStructure;
    };

    const mountStructure = createMountStructure(files);
    webcontainer?.mount(mountStructure);
  }, [files, webcontainer]);

  useEffect(() => {
    if (!location.state || !location.state.prompt) {
      navigate('/');
      return;
    }
    init();
  }, []);

  async function init() {
    try {
      const apiKey = localStorage.getItem('llm_api_key');
      const provider = localStorage.getItem('llm_provider') || 'gemini';

      const response = await axios.post(`${BACKEND_URL}/template`, {
        prompt: prompt.trim(),
        apiKey,
        provider
      });
      setTemplateSet(true);

      const { prompts, uiPrompts } = response.data;

      setSteps(parseXml(uiPrompts[0]).map((x: Step) => ({
        ...x,
        status: "pending"
      })));

      setLoading(true);
      const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
        messages: [...prompts, prompt].map(content => ({
          role: "user",
          content
        })),
        apiKey,
        provider
      })

      setLoading(false);

      setSteps(s => [...s, ...parseXml(stepsResponse.data.response).map(x => ({
        ...x,
        status: "pending" as "pending"
      }))]);

      setLlmMessages([...prompts, prompt].map(content => ({
        role: "user",
        content
      })));

      setLlmMessages(x => [...x, { role: "assistant", content: stepsResponse.data.response }])
    } catch (error) {
      console.error("Error initializing builder:", error);
      alert("Failed to generate project plan. Please try again.");
      setLoading(false);
      navigate('/');
    }
  }

  async function downloadProject() {
    const zip = new JSZip();

    function addFilesToZip(files: FileItem[], currentZip: JSZip) {
      files.forEach(file => {
        if (file.type === 'folder') {
          const folderZip = currentZip.folder(file.name);
          if (folderZip && file.children) {
            addFilesToZip(file.children, folderZip);
          }
        } else if (file.type === 'file') {
          currentZip.file(file.name, file.content || "");
        }
      });
    }

    addFilesToZip(files, zip);

    const content = await zip.generateAsync({ type: "blob" });
    const url = window.URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = "project.zip";
    a.click();
    window.URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col font-sans">
      <header className="bg-[#1e1e1e] border-b border-gray-800 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <h1
            onClick={() => navigate('/')}
            className="text-xl font-bold text-gray-100 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 cursor-pointer hover:opacity-80 transition-opacity"
          >
            Vibe AI
          </h1>
          <div className="h-6 w-px bg-gray-700 mx-2"></div>
          <p className="text-sm text-gray-400 max-w-xl truncate">
            {prompt}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-gray-800 rounded-full text-xs text-gray-400 border border-gray-700 flex items-center gap-2">
            {localStorage.getItem('llm_provider') === 'anthropic' ? (
              <>
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                Claude 3.5 Sonnet
              </>
            ) : (
              <>
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                Gemini 2.0 Flash
              </>
            )}
          </div>
          <button
            onClick={downloadProject}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 transition-colors ml-2"
          >
            <Download className="w-3 h-3" />
            Download
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-12 gap-0">

          {/* Left Panel: Steps & Chat */}
          <div className="col-span-3 border-r border-gray-800 bg-[#1e1e1e] flex flex-col h-full">
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-2 text-gray-300 font-medium mb-2">
                  <Layers className="w-4 h-4" />
                  <span>Build Steps</span>
                </div>
                <StepsList
                  steps={steps}
                  currentStep={currentStep}
                  onStepClick={setCurrentStep}
                />
              </div>
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-800 bg-[#1e1e1e]">
              <div className="flex gap-2">
                <textarea
                  value={userPrompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ask to change something..."
                  className="w-full p-3 bg-black/30 border border-gray-700 rounded-lg text-sm text-gray-200 focus:outline-none focus:border-blue-500 resize-none h-20 placeholder-gray-500"
                />
                <button
                  onClick={async () => {
                    const newMessage = {
                      role: "user" as "user",
                      content: userPrompt
                    };

                    setLoading(true);
                    const apiKey = localStorage.getItem('llm_api_key');
                    const provider = localStorage.getItem('llm_provider') || 'gemini';
                    const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
                      messages: [...llmMessages, newMessage],
                      apiKey,
                      provider
                    });
                    setLoading(false);

                    setLlmMessages(x => [...x, newMessage]);
                    setLlmMessages(x => [...x, {
                      role: "assistant",
                      content: stepsResponse.data.response
                    }]);

                    setSteps(s => [...s, ...parseXml(stepsResponse.data.response).map(x => ({
                      ...x,
                      status: "pending" as "pending"
                    }))]);
                    setPrompt(""); // Clear input after sending
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  disabled={loading || !templateSet}
                >
                  {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Middle Panel: File Explorer */}
          <div className="col-span-2 border-r border-gray-800 bg-[#1e1e1e] flex flex-col">
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center gap-2 text-gray-300 font-medium">
                <Eye className="w-4 h-4" />
                <span>Explorer</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <FileExplorer files={files} onFileSelect={setSelectedFile} />
            </div>
          </div>


          {/* Right Panel: Editor & Preview */}
          <div className="col-span-7 bg-gray-900 flex flex-col h-full">
            <div className="h-12 border-b border-gray-800 flex items-center px-4 justify-between bg-[#1e1e1e]">
              <div className="flex items-center bg-gray-800 rounded-lg p-1 border border-gray-700">
                <button
                  onClick={() => setActiveTab('code')}
                  className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === 'code' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-200'}`}
                >
                  Code
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === 'preview' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-200'}`}
                >
                  Preview
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden relative">
              {loading && !templateSet && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-50 backdrop-blur-sm">
                  <div className="text-center">
                    <Loader />
                    <p className="mt-4 text-gray-300 animate-pulse">Generating your project...</p>
                  </div>
                </div>
              )}
              <div className="h-full w-full">
                <div className={`${activeTab === 'code' ? 'block' : 'hidden'} h-full`}>
                  <CodeEditor file={selectedFile} />
                </div>
                <div className={`${activeTab === 'preview' ? 'block' : 'hidden'} h-full`}>
                  {webcontainer && <PreviewFrame webContainer={webcontainer} files={files} />}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}