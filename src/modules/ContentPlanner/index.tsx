import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useAppStore } from '../../store/useAppStore';
import { generateStandardContent } from '../../services/gemini';
import { Loader2, Sparkles, Copy, CheckCircle2 } from 'lucide-react';
import Markdown from 'react-markdown';
import { cn } from '../../utils/cn';

const OPTIONS = {
  authorityTypes: ['opt.expert', 'opt.practitioner', 'opt.thoughtLeader', 'opt.mentor'],
  tones: ['opt.formal', 'opt.friendly', 'opt.provocative', 'opt.educational', 'opt.storytelling'],
  angles: ['opt.lessonLearned', 'opt.contrarian', 'opt.commonMistake', 'opt.achievement', 'opt.advice'],
  formats: ['opt.story', 'opt.list', 'opt.question', 'opt.statistic', 'opt.comparison'],
  hooks: ['opt.shock', 'opt.question', 'opt.statistic', 'opt.confession', 'opt.promise'],
  goals: ['opt.credibility', 'opt.leadGen', 'opt.networking', 'opt.educational'],
  ctas: ['opt.comment', 'opt.share', 'opt.contactMe', 'opt.visitLink', 'opt.none'],
  lengths: ['opt.short', 'opt.medium', 'opt.long'],
  hashtags: ['opt.zero', 'opt.three', 'opt.five'],
  emojis: ['opt.no', 'opt.moderate', 'opt.heavy'],
  languages: ['opt.arabic', 'opt.english', 'opt.arabicWithEnglish'],
  industries: ['opt.pharma', 'opt.supplyChain', 'opt.tech', 'opt.healthcare', 'opt.general'],
  valueTypes: ['opt.information', 'opt.inspiration', 'opt.entertainment', 'opt.challenge', 'opt.problemSolving'],
  expertiseLevels: ['opt.beginner', 'opt.intermediate', 'opt.advanced'],
  yesNo: ['opt.yes', 'opt.no'],
  structureStyles: ['opt.paragraphs', 'opt.bulletPoints', 'opt.hybrid'],
  urgencies: ['opt.high', 'opt.moderate', 'opt.none'],
  controversies: ['opt.safe', 'opt.bold', 'opt.provocative'],
  inspirationModels: ['opt.none', 'opt.justinWelsh', 'opt.laraAcosta', 'opt.arabicStyle'],
};

export const ContentPlanner: React.FC = () => {
  const { t, language } = useLanguage();
  const { addToast, suggestedVariables } = useAppStore();
  
  const [formData, setFormData] = useState<Record<string, string>>({
    coreTopic: '',
    authorityType: OPTIONS.authorityTypes[0],
    toneOfVoice: OPTIONS.tones[0],
    contentAngle: OPTIONS.angles[0],
    postFormat: OPTIONS.formats[0],
    hook: OPTIONS.hooks[0],
    postGoal: OPTIONS.goals[0],
    targetAudience: '',
    callToAction: OPTIONS.ctas[0],
    postLength: OPTIONS.lengths[1],
    hashtagsCount: OPTIONS.hashtags[1],
    emojiUsage: OPTIONS.emojis[1],
    outputLanguage: OPTIONS.languages[0],
    industryContext: OPTIONS.industries[4],
    valueType: OPTIONS.valueTypes[0],
    expertiseLevel: OPTIONS.expertiseLevels[1],
    hasPersonalStory: OPTIONS.yesNo[1],
    hasDataStats: OPTIONS.yesNo[1],
    structureStyle: OPTIONS.structureStyles[0],
    urgency: OPTIONS.urgencies[2],
    controversyLevel: OPTIONS.controversies[0],
    hasAudienceQuestion: OPTIONS.yesNo[1],
    inspirationModel: OPTIONS.inspirationModels[0],
    extraNotes: '',
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPost, setGeneratedPost] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Auto-populate from suggested variables (from Profile Analyzer)
  useEffect(() => {
    if (Object.keys(suggestedVariables).length > 0) {
      setFormData(prev => ({ ...prev, ...suggestedVariables }));
      addToast('toast.variablesApplied', 'info');
    }
  }, [suggestedVariables, addToast]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    if (!formData.coreTopic.trim()) {
      addToast('common.error', 'error');
      return;
    }
    
    setIsGenerating(true);
    setGeneratedPost(null);
    setIsCopied(false);
    
    try {
      const prompt = `
        You are an elite B2B LinkedIn ghostwriter. Write a highly engaging LinkedIn post based EXACTLY on the following 24 variables.
        
        1. Core Topic: ${formData.coreTopic}
        2. Authority Type: ${t(formData.authorityType)}
        3. Tone of Voice: ${t(formData.toneOfVoice)}
        4. Content Angle: ${t(formData.contentAngle)}
        5. Post Format: ${t(formData.postFormat)}
        6. Hook Style: ${t(formData.hook)}
        7. Post Goal: ${t(formData.postGoal)}
        8. Target Audience: ${formData.targetAudience}
        9. Call to Action: ${t(formData.callToAction)}
        10. Length: ${t(formData.postLength)}
        11. Hashtags: ${t(formData.hashtagsCount)}
        12. Emojis: ${t(formData.emojiUsage)}
        13. Output Language: ${t(formData.outputLanguage)}
        14. Industry Context: ${t(formData.industryContext)}
        15. Value Type: ${t(formData.valueType)}
        16. Expertise Level: ${t(formData.expertiseLevel)}
        17. Include Personal Story: ${t(formData.hasPersonalStory)}
        18. Include Data/Stats: ${t(formData.hasDataStats)}
        19. Structure Style: ${t(formData.structureStyle)}
        20. Urgency: ${t(formData.urgency)}
        21. Controversy Level: ${t(formData.controversyLevel)}
        22. Include Audience Question: ${t(formData.hasAudienceQuestion)}
        23. Inspiration Model: ${t(formData.inspirationModel)}
        24. Extra Notes: ${formData.extraNotes}
        
        CRITICAL INSTRUCTIONS:
        - The final output MUST be in the requested Output Language.
        - Do not include any meta-text or explanations. Just output the post itself.
        - Strictly follow the requested formatting, length, and tone.
      `;
      
      const post = await generateStandardContent(prompt);
      setGeneratedPost(post);
      addToast('toast.generationComplete', 'success');
    } catch (error) {
      addToast('toast.apiError', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedPost) {
      navigator.clipboard.writeText(generatedPost);
      setIsCopied(true);
      addToast('common.copied', 'success');
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const renderSelect = (key: string, labelKey: string, options: string[]) => (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700">{t(labelKey)}</label>
      <select
        value={formData[key]}
        onChange={(e) => handleChange(key, e.target.value)}
        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
      >
        {options.map(opt => (
          <option key={opt} value={opt}>{t(opt)}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">{t('contentPlanner.title')}</h2>
        <p className="text-slate-500 mb-8">{t('contentPlanner.subtitle')}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Text Inputs */}
          <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">{t('contentPlanner.coreTopic')} *</label>
            <input
              type="text"
              value={formData.coreTopic}
              onChange={(e) => handleChange('coreTopic', e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., The impact of AI on supply chain logistics"
            />
          </div>
          
          <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">{t('contentPlanner.targetAudience')}</label>
            <input
              type="text"
              value={formData.targetAudience}
              onChange={(e) => handleChange('targetAudience', e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Supply Chain Managers, Operations Directors"
            />
          </div>

          {/* Dropdowns */}
          {renderSelect('authorityType', 'contentPlanner.authorityType', OPTIONS.authorityTypes)}
          {renderSelect('toneOfVoice', 'contentPlanner.toneOfVoice', OPTIONS.tones)}
          {renderSelect('contentAngle', 'contentPlanner.contentAngle', OPTIONS.angles)}
          {renderSelect('postFormat', 'contentPlanner.postFormat', OPTIONS.formats)}
          {renderSelect('hook', 'contentPlanner.hook', OPTIONS.hooks)}
          {renderSelect('postGoal', 'contentPlanner.postGoal', OPTIONS.goals)}
          {renderSelect('callToAction', 'contentPlanner.callToAction', OPTIONS.ctas)}
          {renderSelect('postLength', 'contentPlanner.postLength', OPTIONS.lengths)}
          {renderSelect('hashtagsCount', 'contentPlanner.hashtagsCount', OPTIONS.hashtags)}
          {renderSelect('emojiUsage', 'contentPlanner.emojiUsage', OPTIONS.emojis)}
          {renderSelect('outputLanguage', 'contentPlanner.outputLanguage', OPTIONS.languages)}
          {renderSelect('industryContext', 'contentPlanner.industryContext', OPTIONS.industries)}
          {renderSelect('valueType', 'contentPlanner.valueType', OPTIONS.valueTypes)}
          {renderSelect('expertiseLevel', 'contentPlanner.expertiseLevel', OPTIONS.expertiseLevels)}
          {renderSelect('hasPersonalStory', 'contentPlanner.hasPersonalStory', OPTIONS.yesNo)}
          {renderSelect('hasDataStats', 'contentPlanner.hasDataStats', OPTIONS.yesNo)}
          {renderSelect('structureStyle', 'contentPlanner.structureStyle', OPTIONS.structureStyles)}
          {renderSelect('urgency', 'contentPlanner.urgency', OPTIONS.urgencies)}
          {renderSelect('controversyLevel', 'contentPlanner.controversyLevel', OPTIONS.controversies)}
          {renderSelect('hasAudienceQuestion', 'contentPlanner.hasAudienceQuestion', OPTIONS.yesNo)}
          {renderSelect('inspirationModel', 'contentPlanner.inspirationModel', OPTIONS.inspirationModels)}

          {/* Extra Notes */}
          <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">{t('contentPlanner.extraNotes')}</label>
            <textarea
              value={formData.extraNotes}
              onChange={(e) => handleChange('extraNotes', e.target.value)}
              className="w-full h-24 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Any specific keywords, names, or constraints..."
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleGenerate}
            disabled={!formData.coreTopic.trim() || isGenerating}
            className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
            <span>{t('contentPlanner.generateBtn')}</span>
          </button>
        </div>
      </div>

      {generatedPost && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-500" />
              Generated Post
            </h3>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              {isCopied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              <span>{t(isCopied ? 'common.copied' : 'common.copy')}</span>
            </button>
          </div>
          <div className="p-6 bg-slate-50 rounded-xl whitespace-pre-wrap text-slate-800 font-sans text-lg leading-relaxed border border-slate-100" dir="auto">
            {generatedPost}
          </div>
        </div>
      )}
    </div>
  );
};
