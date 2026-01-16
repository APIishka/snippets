// Post-process highlighted code to add custom highlighting for Python
export const enhancePythonCode = (code, language) => {
  if (language !== 'python') return code;

  // Highlight self, cls with special styling
  code = code.replace(/\bself\b/g, '<span style="color: #FF8F40; font-weight: bold; font-style: italic;">self</span>');
  code = code.replace(/\bcls\b/g, '<span style="color: #FF8F40; font-weight: bold; font-style: italic;">cls</span>');
  
  // Highlight method calls (word followed by opening parenthesis)
  code = code.replace(/\.([a-zA-Z_]\w*)\s*\(/g, (match, methodName) => {
    return `.<span style="color: #FFB454;">${methodName}</span>(`;
  });
  
  return code;
};
