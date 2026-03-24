import { useState, useEffect } from 'react';
import { marked } from 'marked';
import { getPolicy, PolicyData } from '../api';

marked.setOptions({
  breaks: true,
  gfm: true,
});

export default function PublicPage() {
  const [data, setData] = useState<PolicyData | null>(null);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [lastUpdated, setLastUpdated] = useState('');
  const [tocExpanded, setTocExpanded] = useState(false);
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    document.body.dataset.theme = darkMode ? 'dark' : 'light';
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    getPolicy()
      .then((policy) => {
        setData(policy);
        // Extract last updated date
        const dateMatch = policy.content.match(/最后更新[：:]\s*(\d{4}[-/年]\d{1,2}[-/月]\d{1,2}[日]?)/);
        if (dateMatch) {
          setLastUpdated(`最后更新：${dateMatch[1]}`);
        }
      })
      .catch(() => {
        setData({
          title: '加载失败',
          content: '请稍后重试',
          footer: '',
        });
      });
  }, []);

  useEffect(() => {
    if (!data) return;

    const updateActiveHeading = () => {
      const headings = document.querySelectorAll('#content h2, #content h3');
      let current = '';
      headings.forEach((heading) => {
        const rect = heading.getBoundingClientRect();
        if (rect.top < 150) {
          current = heading.id;
        }
      });
      setActiveId(current);
    };

    window.addEventListener('scroll', updateActiveHeading);
    return () => window.removeEventListener('scroll', updateActiveHeading);
  }, [data]);

  const handleContentRendered = (content: string) => {
    // Remove date line from content before rendering
    return content.replace(/^.*最后更新[：:]\s*\d{4}[-/年]\d{1,2}[-/月]\d{1,2}[日]?.*$/m, '');
  };

  if (!data) {
    return (
      <div className="layout">
        <main className="main">
          <div className="container">
            <h1 className="page-title">加载中...</h1>
          </div>
        </main>
      </div>
    );
  }

  const renderedContent = marked.parse(handleContentRendered(data.content)) as string;

  // Extract headings for TOC after render
  const headings: { id: string; text: string; level: number }[] = [];
  const headingRegex = /<h([23])[^>]*id="([^"]*)"[^>]*>(.*?)<\/h[23]>/gi;
  let match;
  while ((match = headingRegex.exec(renderedContent)) !== null) {
    const text = match[3].replace(/<[^>]*>/g, '');
    headings.push({
      level: parseInt(match[1]),
      id: match[2],
      text,
    });
  }

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      if (window.innerWidth <= 900) {
        setTocExpanded(false);
      }
    }
  };

  return (
    <>
      <button
        className="theme-toggle"
        onClick={() => setDarkMode(!darkMode)}
        aria-label="切换主题"
      >
        {darkMode ? '☀️' : '🌙'}
      </button>

      <div className="layout">
        <aside className={`toc ${headings.length > 0 ? 'toc-mobile' : ''}`}>
          <button
            className="toc-toggle"
            onClick={() => setTocExpanded(!tocExpanded)}
          >
            📑 目录
          </button>
          <div className={`toc-card ${tocExpanded ? 'expanded' : ''}`}>
            <div className="toc-title">目录</div>
            <ul className="toc-list">
              {headings.map((heading) => (
                <li key={heading.id} className={heading.level === 3 ? 'toc-h3' : ''}>
                  <a
                    href={`#${heading.id}`}
                    className={activeId === heading.id ? 'active' : ''}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToHeading(heading.id);
                    }}
                  >
                    {heading.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <main className="main">
          <article className="container">
            <h1 className="page-title">{data.title}</h1>
            <div className="last-updated">{lastUpdated}</div>
            <div
              className="content markdown-body"
              id="content"
              dangerouslySetInnerHTML={{ __html: renderedContent }}
            />
            <div className="footer">{data.footer}</div>
          </article>
        </main>
      </div>
    </>
  );
}
