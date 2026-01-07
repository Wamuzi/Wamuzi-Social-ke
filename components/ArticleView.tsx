
import React from 'react';
import { Article } from '../types';
import { ArrowLeftIcon, RssIcon } from './icons/Icons';

interface ArticleViewProps {
  article: Article;
  onBack: () => void;
}

const ArticleView: React.FC<ArticleViewProps> = ({ article, onBack }) => {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8">
      <header className="mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-brand-blue hover:underline font-semibold mb-4">
          <ArrowLeftIcon className="w-5 h-5" />
          Back to News
        </button>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 font-serif-logo">{article.title}</h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mt-2">
            <span>By {article.author || 'Unknown'}</span>
            <span>&bull;</span>
            <span>{new Date(article.pubDate).toLocaleString()}</span>
            {article.sourceFeedName && (
                <>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                        <RssIcon className="w-3 h-3" /> {article.sourceFeedName}
                    </span>
                </>
            )}
        </div>
      </header>

      {article.thumbnail && (
        <img src={article.thumbnail} alt="" className="w-full h-auto max-h-96 object-cover rounded-lg mb-6 shadow-lg" />
      )}
      
      {/* 
        NOTE: Using dangerouslySetInnerHTML to render HTML content from RSS feeds.
        This is necessary as the content is provided as a raw HTML string.
        Ensure you trust the RSS feed sources to prevent XSS vulnerabilities.
        For a production app, this content should be sanitized.
      */}
      <div 
        className="prose lg:prose-xl max-w-none text-gray-800"
        dangerouslySetInnerHTML={{ __html: article.content }} 
      />

      <footer className="mt-8 border-t pt-4">
        <a href={article.link} target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:underline">
            View Original Article &rarr;
        </a>
      </footer>
    </div>
  );
};

export default ArticleView;
