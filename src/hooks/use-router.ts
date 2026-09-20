import { useEffect, useState, useCallback } from 'react';

export interface ParsedRoute {
  path: string;       // full path after #, e.g. "/shop" or "/product/abc"
  segments: string[]; // e.g. ["product", "abc"]
  params: Record<string, string>;
  query: URLSearchParams;
}

function parseHash(): ParsedRoute {
  const raw = window.location.hash.replace(/^#/, '') || '/';
  const [path, queryString] = raw.split('?');
  const segments = path.split('/').filter(Boolean);
  const query = new URLSearchParams(queryString ?? '');
  const params: Record<string, string> = {};
  for (const [k, v] of query.entries()) params[k] = v;
  return { path, segments, params, query };
}

export function useHashRouter() {
  const [parsed, setParsed] = useState<ParsedRoute>(() => parseHash());

  useEffect(() => {
    const onChange = () => {
      setParsed(parseHash());
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const navigate = useCallback((to: string) => {
    const target = to.startsWith('#') ? to : `#${to}`;
    if (window.location.hash === target) {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    } else {
      window.location.hash = target;
    }
  }, []);

  return { ...parsed, navigate };
}
