import React, { useState, useRef } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useAppStore } from '../../store/useAppStore';
import { analyzeStrategicData } from '../../services/gemini';
import { parseLinkedInData } from '../../services/fileParser';
import { compressLinkedInData } from '../../utils/dataCompressor';
import { Loader2, UploadCloud, BarChart3, Target, Crosshair, ArrowRight, CheckCircle2 } from 'lucide-react';
import Markdown from 'react-markdown';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { cn } from '../../utils/cn';

interface AnalysisResult {
  diagnosis: {
    text: string;
    chartData: { name: string; actual: number; target: number }[];
  };
  networking: string;
  prescription: Record<string, string>;
}

export const ProfileAnalyzer: React.FC = () => {
  const { t, language, dir } = useLanguage();
  const { addToast, setSuggestedVariables } = useAppStore();
  
  const [profileUrl, setProfileUrl] = useState('');
  const [targetTitle, setTargetTitle] = useState('');
  const [positioningGoal, setPositioningGoal] = useState('');
  const [file, setFile] = useState<File | null>(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.csv')) {
        if (selectedFile.size > 5 * 1024 * 1024) {
          addToast('toast.fileTooLarge', 'error');
          return;
        }
        setFile(selectedFile);
      } else {
        addToast('toast.invalidFileType', 'error');
      }
    }
  };

  const handleAnalyze = async () => {
    if (!profileUrl || !targetTitle || !positioningGoal || !file) {
      addToast('common.error', 'error');
      return;
    }
    
    setIsAnalyzing(true);
    setResult(null);
    
    try {
      // 1. Parse File
      const parsedData = await parseLinkedInData(file);
      
      // 2. Compress Data
      const compressedData = compressLinkedInData(parsedData);
      
      // 3. Prepare Prompt for Gemini Pro
      const prompt = `
        You are an elite B2B LinkedIn Strategist. Analyze the following compressed LinkedIn data and user goals.
        User Goals:
        - Profile URL: ${profileUrl}
        - Target Job Title: ${targetTitle}
        - Positioning Goal: ${positioningGoal}

        Compressed LinkedIn Data:
        ${JSON.stringify(compressedData)}

        Perform a gap analysis between their current demographics and their target title.
        Create a networking playbook.
        Create a strategic prescription of content variables.

        You MUST respond with a valid JSON object matching this EXACT schema. Do not include markdown formatting like \`\`\`json.
        {
          "diagnosis": {
            "text": "Markdown text explaining the gap analysis...",
            "chartData": [
              {"name": "CEOs", "actual": 15, "target": 40},
              {"name": "Founders", "actual": 20, "target": 30},
              {"name": "Managers", "actual": 40, "target": 10}
            ]
          },
          "networking": "Markdown text explaining the networking playbook...",
          "prescription": {
            "authorityType": "opt.expert",
            "toneOfVoice": "opt.provocative",
            "contentAngle": "opt.contrarian",
            "postFormat": "opt.story",
            "hook": "opt.shock",
            "postGoal": "opt.leadGen",
            "callToAction": "opt.contactMe",
            "postLength": "opt.medium",
            "hashtagsCount": "opt.three",
            "emojiUsage": "opt.moderate",
            "outputLanguage": "opt.arabic",
            "industryContext": "opt.tech",
            "valueType": "opt.information",
            "expertiseLevel": "opt.advanced",
            "hasPersonalStory": "opt.yes",
            "hasDataStats": "opt.yes",
            "structureStyle": "opt.hybrid",
            "urgency": "opt.high",
            "controversyLevel": "opt.bold",
            "hasAudienceQuestion": "opt.yes",
            "inspirationModel": "opt.justinWelsh"
          }
        }

        Use the exact translation keys for the prescription values (e.g., 'opt.expert', 'opt.yes', 'opt.no', etc.).
        The language of the text fields (diagnosis.text and networking) should be ${language === 'ar' ? 'Arabic' : 'English'}.
      `;
      
      const responseText = await analyzeStrategicData(prompt);
      
      // Clean up potential markdown formatting from the response
      const cleanJsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const analysisResult = JSON.parse(cleanJsonStr) as AnalysisResult;
      
      setResult(analysisResult);
      addToast('toast.analysisComplete', 'success');
    } catch (error) {
      console.error(error);
      addToast('toast.apiError', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyToPlanner = () => {
    if (result?.prescription) {
      setSuggestedVariables(result.prescription);
      addToast('toast.variablesApplied', 'success');
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">{t('profileAnalyzer.title')}</h2>
        <p className="text-slate-500 mb-8">{t('profileAnalyzer.subtitle')}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-1.5 md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">{t('profileAnalyzer.profileUrl')}</label>
            <input
              type="url"
              value={profileUrl}
              onChange={(e) => setProfileUrl(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://linkedin.com/in/username"
              dir="ltr"
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">{t('profileAnalyzer.targetTitle')}</label>
            <input
              type="text"
              value={targetTitle}
              onChange={(e) => setTargetTitle(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., CEO, HR Manager, Investor"
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">{t('profileAnalyzer.positioningGoal')}</label>
            <input
              type="text"
              value={positioningGoal}
              onChange={(e) => setPositioningGoal(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Pharma Operations Expert, HealthTech Founder"
            />
          </div>
        </div>

        {/* File Upload */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
            file ? "border-emerald-400 bg-emerald-50" : "border-slate-300 hover:border-blue-400 hover:bg-blue-50"
          )}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsx,.csv"
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center space-y-3">
            {file ? (
              <>
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                <span className="text-emerald-700 font-medium">{file.name}</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-10 h-10 text-slate-400" />
                <span className="text-slate-600 font-medium">{t('profileAnalyzer.uploadData')}</span>
                <span className="text-slate-400 text-sm">Drag and drop or click to browse</span>
              </>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleAnalyze}
            disabled={!profileUrl || !targetTitle || !positioningGoal || !file || isAnalyzing}
            className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isAnalyzing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <BarChart3 className="w-5 h-5" />
            )}
            <span>{t('profileAnalyzer.analyzeBtn')}</span>
          </button>
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Chart Section */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              Demographics Gap Analysis
            </h3>
            <div className="h-80 w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={result.diagnosis.chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                  <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend iconType="circle" />
                  <Bar dataKey="actual" name="Actual (%)" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="target" name="Target (%)" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 3 Cards Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Card 1: Diagnosis */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                <BarChart3 className="w-5 h-5 text-rose-500" />
                {t('profileAnalyzer.diagnosis')}
              </h3>
              <div className={cn("prose prose-sm prose-slate max-w-none flex-1", language === 'ar' ? 'prose-rtl' : '')}>
                <Markdown>{result.diagnosis.text}</Markdown>
              </div>
            </div>

            {/* Card 2: Networking Playbook */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Crosshair className="w-5 h-5 text-emerald-500" />
                {t('profileAnalyzer.networking')}
              </h3>
              <div className={cn("prose prose-sm prose-slate max-w-none flex-1", language === 'ar' ? 'prose-rtl' : '')}>
                <Markdown>{result.networking}</Markdown>
              </div>
            </div>

            {/* Card 3: Strategic Prescription */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Target className="w-5 h-5 text-blue-500" />
                {t('profileAnalyzer.prescription')}
              </h3>
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 mb-6">
                  {Object.entries(result.prescription).map(([key, value]) => (
                    <span key={key} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                      {t(value)}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={applyToPlanner}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-colors mt-auto"
              >
                <span>{t('profileAnalyzer.applyToPlanner')}</span>
                <ArrowRight className={cn("w-4 h-4", dir === 'rtl' ? 'rotate-180' : '')} />
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
