import React, { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useAppStore } from '../../store/useAppStore';
import { generateStandardContent } from '../../services/gemini';
import { Loader2, Sparkles } from 'lucide-react';
import Markdown from 'react-markdown';
import { cn } from '../../utils/cn';

export const PostAnalyzer: React.FC = () => {
  const { t, language } = useLanguage();
  const { addToast } = useAppStore();
  
  const [postContent, setPostContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!postContent.trim()) return;
    
    setIsAnalyzing(true);
    setResults(null);
    
    try {
      const prompt = `
        You are an expert LinkedIn B2B content strategist. 
        Analyze the following LinkedIn post and provide a structured critique and improvement suggestions.
        
        Please output the analysis in ${language === 'ar' ? 'Arabic' : 'English'}.
        
        Focus on:
        1. Hook strength (First line)
        2. Readability and formatting
        3. Value proposition
        4. Call to Action (CTA)
        
        Format your response in Markdown with clear headings.
        
        Post to analyze:
        """
        ${postContent}
        """
      `;
      
      const analysis = await generateStandardContent(prompt);
      setResults(analysis);
      addToast('toast.analysisComplete', 'success');
    } catch (error) {
      addToast('toast.apiError', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="bg-white p-4 lg:p-8 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-xl lg:text-2xl font-bold text-slate-800 mb-2">{t('postAnalyzer.title')}</h2>
        <p className="text-sm lg:text-base text-slate-500 mb-4 lg:mb-6">{t('postAnalyzer.subtitle')}</p>
        
        <div className="space-y-4">
          <textarea
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            placeholder={t('postAnalyzer.placeholder')}
            className="w-full h-32 lg:h-48 p-3 lg:p-4 text-sm lg:text-base bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
            dir="auto"
          />
          
          <div className="flex justify-end">
            <button
              onClick={handleAnalyze}
              disabled={!postContent.trim() || isAnalyzing}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isAnalyzing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
              <span>{t('postAnalyzer.analyzeBtn')}</span>
            </button>
          </div>
        </div>
      </div>

      {results && (
        <div className="bg-white p-4 lg:p-8 rounded-2xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-lg lg:text-xl font-bold text-slate-800 mb-4 lg:mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-500" />
            {t('postAnalyzer.results')}
          </h3>
          <div className={cn(
            "prose prose-slate max-w-none prose-headings:text-slate-800 prose-a:text-blue-600",
            language === 'ar' ? 'prose-rtl' : ''
          )}>
            <Markdown>{results}</Markdown>
          </div>
        </div>
      )}
    </div>
  );
};
