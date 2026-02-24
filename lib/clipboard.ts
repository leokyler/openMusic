import Clipboard from 'clipboard';

export interface CopyOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export interface FormattedPrompt {
  text: string;
  field_count: number;
  fields: string[];
}

export function copyToClipboard(text: string, options: CopyOptions = {}): Clipboard | null {
  if (typeof window === 'undefined') {
    options.onError?.(new Error('Clipboard API is not available in server-side environment'));
    return null;
  }

  const button = document.createElement('button');
  button.setAttribute('data-clipboard-text', text);
  button.style.position = 'absolute';
  button.style.left = '-9999px';
  document.body.appendChild(button);

  const clipboard = new Clipboard(button, {
    text: () => text,
  });

  clipboard.on('success', (e) => {
    options.onSuccess?.();
    document.body.removeChild(button);
    e.clearSelection();
  });

  clipboard.on('error', (e) => {
    options.onError?.(new Error('Failed to copy to clipboard'));
    document.body.removeChild(button);
  });

  button.click();
  return clipboard;
}

export function formatPromptForCopy(
  prompt: Partial<{
    lyrics: string | null;
    style: string | null;
    vocal: string | null;
    instrumental: string | null;
  }>
): FormattedPrompt {
  const fields: string[] = [];
  const lines: string[] = [];

  if (prompt.lyrics) {
    fields.push('lyrics');
    lines.push(`lyrics:\n${prompt.lyrics}`);
  }

  if (prompt.style) {
    fields.push('style');
    lines.push(`style:\n${prompt.style}`);
  }

  if (prompt.vocal) {
    fields.push('vocal');
    lines.push(`vocal:\n${prompt.vocal}`);
  }

  if (prompt.instrumental) {
    fields.push('instrumental');
    lines.push(`instrumental:\n${prompt.instrumental}`);
  }

  return {
    text: lines.join('\n\n'),
    field_count: fields.length,
    fields,
  };
}
