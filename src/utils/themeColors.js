/**
 * Shared theme colors from colorScheme (ayu | vscode | light).
 * Use for consistent UI across code and content pages.
 */
export function getThemeColors(colorScheme) {
  const pageBackground = (() => {
    switch (colorScheme) {
      case 'ayu': return '#0f1419';
      case 'vscode': return '#1E1E1E';
      case 'light': return '#f6f8fa';
      default: return '#0f1419';
    }
  })();
  const textColor = colorScheme === 'light' ? '#24292f' : '#e5e7eb';
  const inputBorder = colorScheme === 'light' ? '#d0d7de' : (colorScheme === 'ayu' ? '#1a1f2e' : '#1f2937');
  const inputText = colorScheme === 'light' ? '#24292f' : (colorScheme === 'ayu' ? '#d0d0d0' : '#d1d5db');
  const inputPlaceholder = colorScheme === 'light' ? '#57606a' : (colorScheme === 'ayu' ? '#828C99' : '#6b7280');
  const focusBorder = colorScheme === 'light' ? '#0969da' : (colorScheme === 'ayu' ? '#FF8F40' : '#25d5f8');
  const buttonText = colorScheme === 'light' ? '#57606a' : (colorScheme === 'ayu' ? '#8b949e' : '#6b7280');
  const buttonHoverText = colorScheme === 'light' ? '#0969da' : (colorScheme === 'ayu' ? '#FF8F40' : '#25d5f8');
  const buttonHoverBorder = colorScheme === 'light' ? '#0969da' : (colorScheme === 'ayu' ? '#FF8F40' : '#25d5f8');
  const inputBackground = colorScheme === 'light' ? '#f6f8fa' : (colorScheme === 'ayu' ? '#0f1419' : '#252526');
  const modalBg = colorScheme === 'light' ? '#ffffff' : (colorScheme === 'ayu' ? '#0f1419' : '#1E1E1E');
  const placeholderColor = colorScheme === 'light' ? 'rgba(36, 41, 47, 0.25)' : 'rgba(229, 231, 235, 0.25)';

  return {
    pageBackground,
    textColor,
    inputBorder,
    inputText,
    inputPlaceholder,
    focusBorder,
    buttonText,
    buttonHoverText,
    buttonHoverBorder,
    inputBackground,
    modalBg,
    placeholderColor,
  };
}
